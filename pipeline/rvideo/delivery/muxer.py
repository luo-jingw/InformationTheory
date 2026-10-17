"""Muxes a rendered episode into a new immutable, chapter-marked delivery version."""
from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path

from rvideo.delivery.chapter_metadata import ChapterMark, ChapterMetadata
from rvideo.delivery.delivery_report import InputDigest
from rvideo.paths import ProjectPaths
from rvideo.schema.timeline import Timeline

TARGET_LUFS = -16.0
TARGET_TP = -1.5
TARGET_LRA = 11.0


@dataclass(frozen=True)
class LoudnessMeasurement:
    input_i: float
    input_tp: float
    input_lra: float
    input_thresh: float
    target_offset: float


@dataclass(frozen=True)
class MuxResult:
    episode: str
    version: int
    output_dir: str
    mp4: str
    duration: float
    size_bytes: int
    mp4_sha256: str
    cover: str
    cover_time: float


@dataclass(frozen=True)
class DeliveryManifest:
    episode: str
    version: int
    mp4: str
    mp4_sha256: str
    srt: str
    cover: str
    cover_time: float
    timeline_duration: float
    loudness_input: LoudnessMeasurement
    source_hashes: tuple[InputDigest, ...]
    chapters: tuple[str, ...]
    video_codec: str
    audio_codec: str
    subtitle_codec: str


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def _run(command: list[str]) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        raise RuntimeError(f"{command[0]} exit {result.returncode}: {result.stderr.strip()[-2000:]}")
    return result


def _metadata_escape(value: str) -> str:
    escaped: list[str] = []
    for char in value:
        if char in "\\=;#":
            escaped.append("\\" + char)
        elif char == "\n":
            escaped.append("\\\n")
        elif char == "\r":
            continue
        else:
            escaped.append(char)
    return "".join(escaped)


class Muxer:
    """Owns ``output/<episode>/v<version>`` and refuses version replacement."""

    def __init__(self, paths: ProjectPaths) -> None:
        self._paths = paths

    def _measure(self, wav: Path) -> LoudnessMeasurement:
        result = _run([
            "ffmpeg", "-hide_banner", "-nostats", "-i", str(wav), "-af",
            f"loudnorm=I={TARGET_LUFS}:TP={TARGET_TP}:LRA={TARGET_LRA}:print_format=json",
            "-f", "null", "-",
        ])
        blocks = re.findall(r"\{[^{}]*\}", result.stderr)
        if not blocks:
            raise RuntimeError(f"ffmpeg loudness measurement missing JSON for {wav}")
        raw = json.loads(blocks[-1])
        return LoudnessMeasurement(
            input_i=float(raw["input_i"]), input_tp=float(raw["input_tp"]),
            input_lra=float(raw["input_lra"]), input_thresh=float(raw["input_thresh"]),
            target_offset=float(raw["target_offset"]),
        )

    @staticmethod
    def _write_chapter_metadata(marks: tuple[ChapterMark, ...], path: Path) -> None:
        lines = [";FFMETADATA1"]
        for mark in marks:
            start_ms = round(mark.start * 1000)
            end_ms = round(mark.end * 1000)
            if end_ms <= start_ms:
                raise ValueError(f"chapter {mark.id} has no positive ffmetadata duration")
            lines.extend([
                "[CHAPTER]", "TIMEBASE=1/1000", f"START={start_ms}", f"END={end_ms}",
                f"title={_metadata_escape(mark.title)}",
            ])
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    def mux(self, episode: str, version: int) -> MuxResult:
        if version < 1:
            raise ValueError("version must be positive")
        video = self._paths.render_video(episode)
        mix = self._paths.mix_wav(episode)
        srt = self._paths.srt_file(episode)
        timeline_path = self._paths.timeline_file(episode)
        timeline = Timeline.load(timeline_path)
        if timeline.episode != episode:
            raise ValueError(f"timeline episode {timeline.episode!r} != {episode!r}")
        for source in (video, mix, srt):
            if not source.is_file():
                raise FileNotFoundError(source)
        if not timeline.chapters:
            raise ValueError("cannot mux an episode without timeline chapters")

        output_dir = self._paths.output_dir(episode, version)
        output_dir.parent.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(exist_ok=False)
        try:
            return self._write(episode, version, output_dir, video, mix, srt, timeline_path, timeline)
        except Exception:
            shutil.rmtree(output_dir)
            raise

    def _write(self, episode: str, version: int, output_dir: Path, video: Path, mix: Path, srt: Path,
               timeline_path: Path, timeline: Timeline) -> MuxResult:
        mp4 = output_dir / f"{episode}.en.mp4"
        chapter_metadata = self._paths.build_dir(episode) / "render" / "chapters.ffmeta"
        chapter_marks = ChapterMetadata.for_timeline(timeline)
        self._write_chapter_metadata(chapter_marks, chapter_metadata)
        loudness = self._measure(mix)
        loudnorm = (
            f"loudnorm=I={TARGET_LUFS}:TP={TARGET_TP}:LRA={TARGET_LRA}:measured_I={loudness.input_i}:"
            f"measured_TP={loudness.input_tp}:measured_LRA={loudness.input_lra}:"
            f"measured_thresh={loudness.input_thresh}:offset={loudness.target_offset}:linear=true,"
            "aformat=sample_rates=48000:channel_layouts=stereo"
        )
        _run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(video), "-i", str(mix), "-i", str(srt), "-f", "ffmetadata", "-i", str(chapter_metadata),
            "-map", "0:v:0", "-map", "1:a:0", "-map", "2:s:0",
            "-map_metadata", "3", "-map_chapters", "3",
            "-c:v", "copy", "-af", loudnorm, "-c:a", "aac", "-b:a", "192k",
            "-c:s", "mov_text", "-metadata:s:a:0", "language=eng",
            "-metadata:s:s:0", "language=eng", "-metadata:s:s:0", "title=English / 中文",
            "-movflags", "+faststart", str(mp4),
        ])

        external_srt = output_dir / f"{episode}.en.srt"
        shutil.copyfile(srt, external_srt)
        cover_time = min(2.5, max(0.0, timeline.duration - 0.05))
        cover = output_dir / "cover.png"
        _run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{cover_time:.3f}",
              "-i", str(video), "-frames:v", "1", str(cover)])

        probe_result = _run([
            "ffprobe", "-v", "error", "-show_entries", "format=duration,size:stream=codec_type,codec_name",
            "-of", "json", str(mp4),
        ])
        probe = json.loads(probe_result.stdout)
        codecs = {stream["codec_type"]: str(stream["codec_name"]) for stream in probe["streams"]}
        source_hashes = tuple(
            InputDigest(name=name, path=str(path), sha256=_sha256(path))
            for name, path in (("video", video), ("mix", mix), ("srt", srt),
                               ("timeline", timeline_path), ("story", self._paths.story_file(episode)),
                               ("music", self._paths.music_wav(episode)),
                               ("score_cues", self._paths.episode_content(episode) / "score-cues.json"),
                               ("resolved_score", self._paths.music_wav(episode).parent / "resolved-score.json"),
                               ("voice_provenance", self._paths.provenance_file(episode)),
                               ("instrument_manifest", self._paths.root / "assets/music/instrument-bank.json"))
            if path.is_file()
        )
        manifest = DeliveryManifest(
            episode=episode, version=version, mp4=mp4.name, mp4_sha256=_sha256(mp4),
            srt=external_srt.name, cover=cover.name, cover_time=cover_time,
            timeline_duration=timeline.duration, loudness_input=loudness, source_hashes=source_hashes,
            chapters=tuple(mark.id for mark in chapter_marks),
            video_codec=codecs.get("video", ""), audio_codec=codecs.get("audio", ""),
            subtitle_codec=codecs.get("subtitle", ""),
        )
        (output_dir / "manifest.json").write_text(
            json.dumps(asdict(manifest), ensure_ascii=False, indent=1), encoding="utf-8")
        return MuxResult(
            episode=episode, version=version, output_dir=str(output_dir), mp4=str(mp4),
            duration=float(probe["format"]["duration"]), size_bytes=int(probe["format"]["size"]),
            mp4_sha256=_sha256(mp4), cover=str(cover), cover_time=cover_time,
        )
