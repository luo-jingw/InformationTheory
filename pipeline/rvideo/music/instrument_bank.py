"""Verified sample-backed instrument rendering for the original score."""
from __future__ import annotations

import hashlib
import json
import math
from collections import OrderedDict
from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path
from typing import Literal, Protocol, TypedDict, cast

import numpy as np
import soundfile as sf
from numpy.typing import NDArray
from scipy.signal import butter, resample_poly, sosfilt

from rvideo.music.score_events import ScoreNote

InstrumentName = Literal["piano", "strings", "shaker"]
StereoAudio = NDArray[np.float32]
OUTPUT_SAMPLE_RATE: int = 48_000
MAX_CONVERTED_SAMPLES: int = 48
LEADING_PREROLL_SECONDS: float = 0.020


class InstrumentRenderer(Protocol):
    """Render one score note as stereo float32 at 48 kHz."""

    def render_sample(self, note: ScoreNote) -> StereoAudio: ...


class _SampleEntry(TypedDict):
    instrument: str
    root_midi: int
    path: str
    sha256: str


class _Manifest(TypedDict):
    sample_rate: int
    root_note_convention: str
    samples: list[_SampleEntry]


@dataclass(frozen=True)
class _SampleRecord:
    instrument: InstrumentName
    root_midi: int
    path: Path
    sha256: str


@dataclass(frozen=True)
class _PreparedSample:
    audio: StereoAudio
    sample_rate: int


class InstrumentBank:
    """Select, verify, prepare, and render the closest recorded instrument sample."""

    def __init__(self, records: tuple[_SampleRecord, ...]) -> None:
        self._records: tuple[_SampleRecord, ...] = records
        self._records_by_instrument: dict[InstrumentName, tuple[_SampleRecord, ...]] = {
            instrument: tuple(record for record in records if record.instrument == instrument)
            for instrument in ("piano", "strings", "shaker")
        }
        self._source_cache: dict[tuple[InstrumentName, int], _PreparedSample] = {}
        self._converted_cache: OrderedDict[tuple[InstrumentName, int, int], StereoAudio] = OrderedDict()

    @classmethod
    def load(cls, manifest: Path) -> InstrumentBank:
        """Read a sample manifest and validate its schema and referenced files."""
        manifest_path: Path = manifest.resolve()
        try:
            with manifest_path.open("r", encoding="utf-8") as manifest_file:
                raw: object = json.load(manifest_file)
        except OSError:
            raise
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid instrument manifest JSON: {manifest_path}") from exc

        if not isinstance(raw, dict):
            raise ValueError("Instrument manifest must be a JSON object")
        manifest_data: _Manifest = cast(_Manifest, raw)
        sample_rate: object = manifest_data.get("sample_rate")
        convention: object = manifest_data.get("root_note_convention")
        raw_samples: object = manifest_data.get("samples")
        if sample_rate != OUTPUT_SAMPLE_RATE:
            raise ValueError(f"Instrument manifest sample_rate must be {OUTPUT_SAMPLE_RATE}")
        if not isinstance(convention, str) or not convention.strip():
            raise ValueError("Instrument manifest must declare root_note_convention")
        if not isinstance(raw_samples, list) or not raw_samples:
            raise ValueError("Instrument manifest samples must be a nonempty list")

        records: list[_SampleRecord] = []
        seen: set[tuple[InstrumentName, int]] = set()
        manifest_dir: Path = manifest_path.parent
        for index, value in enumerate(raw_samples):
            if not isinstance(value, dict):
                raise ValueError(f"Instrument sample entry {index} must be an object")
            entry: _SampleEntry = cast(_SampleEntry, value)
            instrument_value: object = entry.get("instrument")
            root_value: object = entry.get("root_midi")
            relative_path_value: object = entry.get("path")
            digest_value: object = entry.get("sha256")
            if instrument_value not in ("piano", "strings", "shaker"):
                raise ValueError(f"Unsupported instrument in manifest: {instrument_value!r}")
            if not isinstance(root_value, int) or isinstance(root_value, bool) or not 0 <= root_value <= 127:
                raise ValueError(f"Invalid root_midi in instrument sample entry {index}")
            if not isinstance(relative_path_value, str) or not relative_path_value:
                raise ValueError(f"Invalid path in instrument sample entry {index}")
            if not isinstance(digest_value, str) or len(digest_value) != 64:
                raise ValueError(f"Invalid SHA-256 in instrument sample entry {index}")
            try:
                int(digest_value, 16)
            except ValueError as exc:
                raise ValueError(f"Invalid SHA-256 in instrument sample entry {index}") from exc

            relative_path: Path = Path(relative_path_value)
            if relative_path.is_absolute():
                raise ValueError(f"Sample path must be relative to its manifest: {relative_path}")
            sample_path: Path = (manifest_dir / relative_path).resolve()
            try:
                sample_path.relative_to(manifest_dir)
            except ValueError as exc:
                raise ValueError(f"Sample path escapes its manifest directory: {relative_path}") from exc
            if not sample_path.is_file():
                raise FileNotFoundError(f"Instrument sample is missing: {sample_path}")

            instrument: InstrumentName = cast(InstrumentName, instrument_value)
            record_key: tuple[InstrumentName, int] = (instrument, root_value)
            if record_key in seen:
                raise ValueError(f"Duplicate instrument/root sample: {record_key}")
            seen.add(record_key)
            records.append(_SampleRecord(instrument, root_value, sample_path, digest_value.lower()))

        for instrument in ("piano", "strings", "shaker"):
            if not any(record.instrument == instrument for record in records):
                raise ValueError(f"Instrument manifest has no samples for {instrument}")
        if not any(record.instrument == "shaker" and record.root_midi == 0 for record in records):
            raise ValueError("Instrument manifest must map shaker MIDI 0 to the downstroke")
        if not any(record.instrument == "shaker" and record.root_midi == 1 for record in records):
            raise ValueError("Instrument manifest must map shaker MIDI 1 to the upstroke")
        return cls(tuple(records))

    def render_sample(self, note: ScoreNote) -> StereoAudio:
        """Render one note without applying score level, pan, or reverb-send gains."""
        instrument: InstrumentName
        if note.instrument not in ("piano", "strings", "shaker"):
            raise ValueError(f"Unsupported instrument: {note.instrument!r}")
        instrument = cast(InstrumentName, note.instrument)
        if not 0 <= note.midi <= 127:
            raise ValueError(f"MIDI note must be in [0, 127], got {note.midi}")
        if not math.isfinite(note.hold_s) or not math.isfinite(note.release_s):
            raise ValueError("Note hold and release durations must be finite")
        if note.hold_s < 0.0 or note.release_s < 0.0:
            raise ValueError("Note hold and release durations must be nonnegative")

        record: _SampleRecord = self._select_record(instrument, note.midi)
        if instrument == "shaker" and note.midi not in (0, 1):
            raise ValueError("Shaker MIDI 0 selects downstroke; MIDI 1 selects upstroke")
        cache_key: tuple[InstrumentName, int, int] = (instrument, record.root_midi, note.midi)
        converted: StereoAudio | None = self._converted_cache.get(cache_key)
        if converted is None:
            source: _PreparedSample = self._get_source(record)
            converted = self._convert_pitch(source, record, note.midi)
            self._converted_cache[cache_key] = converted
            if len(self._converted_cache) > MAX_CONVERTED_SAMPLES:
                self._converted_cache.popitem(last=False)
        else:
            self._converted_cache.move_to_end(cache_key)

        output_length: int = int(math.ceil((note.hold_s + note.release_s) * OUTPUT_SAMPLE_RATE))
        output: StereoAudio = np.zeros((output_length, 2), dtype=np.float32)
        if output_length == 0 or converted.shape[0] == 0:
            return output
        if instrument == "shaker":
            self._render_oneshot(converted, output)
        else:
            self._render_pitched(converted, output, instrument, note.hold_s, note.release_s)
        return output

    def _select_record(self, instrument: InstrumentName, midi: int) -> _SampleRecord:
        records: tuple[_SampleRecord, ...] = self._records_by_instrument[instrument]
        if instrument == "shaker":
            matches: tuple[_SampleRecord, ...] = tuple(record for record in records if record.root_midi == midi)
            if not matches:
                raise ValueError(f"No shaker sample is mapped to MIDI {midi}")
            return matches[0]
        if not records:
            raise ValueError(f"No samples available for {instrument}")
        return min(records, key=lambda record: (abs(record.root_midi - midi), record.root_midi))

    def _get_source(self, record: _SampleRecord) -> _PreparedSample:
        cache_key: tuple[InstrumentName, int] = (record.instrument, record.root_midi)
        cached: _PreparedSample | None = self._source_cache.get(cache_key)
        if cached is not None:
            return cached

        digest: str = self._sha256_file(record.path)
        if digest != record.sha256:
            raise ValueError(
                f"SHA-256 mismatch for {record.path}: expected {record.sha256}, got {digest}"
            )
        audio, source_rate = sf.read(record.path, dtype="float32", always_2d=True)
        if audio.ndim != 2:
            raise ValueError(f"Expected a channel matrix in sample: {record.path}")
        if audio.shape[1] > 2:
            raise ValueError(f"Samples with more than two channels are unsupported: {record.path}")
        if audio.shape[1] == 1:
            audio = np.repeat(audio, 2, axis=1)
        if audio.shape[0] == 0:
            raise ValueError(f"Instrument sample is empty: {record.path}")

        preroll: int = int(round(LEADING_PREROLL_SECONDS * source_rate))
        active_frames: NDArray[np.int64] = np.flatnonzero(np.any(audio != np.float32(0.0), axis=1))
        if active_frames.size > 0:
            first_active: int = int(active_frames[0])
            audio = audio[max(0, first_active - preroll) :]

        filtered: StereoAudio = self._filter_and_normalize(audio, int(source_rate), record.instrument)
        prepared: _PreparedSample = _PreparedSample(filtered, int(source_rate))
        self._source_cache[cache_key] = prepared
        return prepared

    @staticmethod
    def _sha256_file(path: Path) -> str:
        digest = hashlib.sha256()
        with path.open("rb") as source_file:
            while True:
                chunk: bytes = source_file.read(1024 * 1024)
                if not chunk:
                    break
                digest.update(chunk)
        return digest.hexdigest()

    @staticmethod
    def _filter_and_normalize(audio: StereoAudio, sample_rate: int, instrument: InstrumentName) -> StereoAudio:
        highpass_hz: float
        lowpass_hz: float
        target_peak: float
        if instrument == "piano":
            highpass_hz, lowpass_hz, target_peak = 55.0, 7_500.0, 0.65
        elif instrument == "strings":
            highpass_hz, lowpass_hz, target_peak = 90.0, 5_500.0, 0.50
        else:
            highpass_hz, lowpass_hz, target_peak = 350.0, 12_000.0, 0.50
        nyquist: float = sample_rate / 2.0
        if not 0.0 < highpass_hz < lowpass_hz < nyquist:
            raise ValueError(f"Source sample rate {sample_rate} cannot support {instrument} filter cutoffs")

        highpass_sos: NDArray[np.float64] = butter(
            2, highpass_hz, btype="highpass", fs=sample_rate, output="sos"
        )
        lowpass_sos: NDArray[np.float64] = butter(
            2, lowpass_hz, btype="lowpass", fs=sample_rate, output="sos"
        )
        filter_sos: NDArray[np.float64] = np.vstack((highpass_sos, lowpass_sos))
        filtered: StereoAudio = sosfilt(filter_sos, audio, axis=0).astype(np.float32, copy=False)
        peak: float = float(np.max(np.abs(filtered)))
        if not math.isfinite(peak) or peak <= 0.0:
            raise ValueError(f"Instrument sample has no finite nonzero signal: {instrument}")
        filtered *= np.float32(target_peak / peak)
        return filtered

    @staticmethod
    def _convert_pitch(source: _PreparedSample, record: _SampleRecord, midi: int) -> StereoAudio:
        if record.instrument == "shaker":
            pitch_ratio: float = 1.0
        else:
            pitch_ratio = math.pow(2.0, (midi - record.root_midi) / 12.0)
        source_rate_ratio: Fraction = Fraction(
            OUTPUT_SAMPLE_RATE / (source.sample_rate * pitch_ratio)
        ).limit_denominator(10_000)
        converted: StereoAudio = resample_poly(
            source.audio,
            up=source_rate_ratio.numerator,
            down=source_rate_ratio.denominator,
            axis=0,
        ).astype(np.float32, copy=False)
        if record.instrument == "shaker":
            return converted
        peak: float = float(np.max(np.abs(converted)))
        target_peak: float = 0.65 if record.instrument == "piano" else 0.50
        if peak > 0.0:
            converted *= np.float32(target_peak / peak)
        return converted

    @staticmethod
    def _render_pitched(
        sample: StereoAudio,
        output: StereoAudio,
        instrument: InstrumentName,
        hold_s: float,
        release_s: float,
    ) -> None:
        copy_length: int = min(sample.shape[0], output.shape[0])
        output[:copy_length] = sample[:copy_length]
        hold_frames: int = min(output.shape[0], int(math.ceil(hold_s * OUTPUT_SAMPLE_RATE)))

        attack_seconds: float = 0.005 if instrument == "piano" else 0.300
        attack_frames: int = min(hold_frames, int(round(attack_seconds * OUTPUT_SAMPLE_RATE)))
        if attack_frames > 0:
            attack: NDArray[np.float32] = np.linspace(
                0.0, 1.0, attack_frames, endpoint=True, dtype=np.float32
            )
            output[:attack_frames] *= attack[:, None]

        release_frames: int = min(
            int(math.ceil(release_s * OUTPUT_SAMPLE_RATE)),
            max(0, output.shape[0] - hold_frames),
        )
        if release_frames > 0:
            phase: NDArray[np.float32] = np.linspace(
                0.0, 1.0, release_frames, endpoint=True, dtype=np.float32
            )
            envelope: NDArray[np.float32] = np.float32(0.5) * (
                np.float32(1.0) + np.cos(np.float32(np.pi) * phase)
            )
            output[hold_frames : hold_frames + release_frames] *= envelope[:, None]

    @staticmethod
    def _render_oneshot(sample: StereoAudio, output: StereoAudio) -> None:
        copy_length: int = min(sample.shape[0], output.shape[0])
        if copy_length == 0:
            return
        output[:copy_length] = sample[:copy_length]
        fade_frames: int = min(copy_length, int(round(0.020 * OUTPUT_SAMPLE_RATE)))
        if fade_frames > 0:
            phase: NDArray[np.float32] = np.linspace(
                0.0, 1.0, fade_frames, endpoint=True, dtype=np.float32
            )
            envelope: NDArray[np.float32] = np.float32(0.5) * (
                np.float32(1.0) + np.cos(np.float32(np.pi) * phase)
            )
            output[copy_length - fade_frames : copy_length] *= envelope[:, None]
