"""Authored musical cues tied to measured chapter and sentence boundaries."""
from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

CueEdge = Literal["start", "end"]
CueInstrument = Literal["piano", "strings", "electric", "bass", "kick", "shaker"]


@dataclass(frozen=True)
class CueAnchor:
    chapter: str
    sentence: int | None
    edge: CueEdge
    offset_s: float


@dataclass(frozen=True)
class CueNote:
    instrument: CueInstrument
    midi: int
    beat: float
    beats: float
    release_s: float
    level: float
    pan: float
    reverb_send: float


@dataclass(frozen=True)
class ScoreCue:
    id: str
    purpose: str
    start: CueAnchor
    end: CueAnchor
    bpm: float
    notes: tuple[CueNote, ...]


@dataclass(frozen=True)
class CueSheet:
    episode: str
    title: str
    cues: tuple[ScoreCue, ...]

    @staticmethod
    def load(path: Path) -> CueSheet:
        try:
            raw: object = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid score cue JSON: {path}") from exc
        if not isinstance(raw, dict):
            raise ValueError("Score cue sheet must be a JSON object")
        episode = _required_string(raw, "episode")
        title = _required_string(raw, "title")
        raw_cues: object = raw.get("cues")
        if not isinstance(raw_cues, list):
            raise ValueError("Score cue sheet cues must be an array")
        cues: list[ScoreCue] = []
        for index, raw_cue in enumerate(raw_cues):
            if not isinstance(raw_cue, dict):
                raise ValueError(f"Cue {index} must be an object")
            raw_notes: object = raw_cue.get("notes")
            if not isinstance(raw_notes, list):
                raise ValueError(f"Cue {index} notes must be an array")
            notes: list[CueNote] = []
            for note_index, raw_note in enumerate(raw_notes):
                if not isinstance(raw_note, dict):
                    raise ValueError(f"Cue {index} note {note_index} must be an object")
                notes.append(_parse_note(raw_note, index, note_index))
            cues.append(ScoreCue(
                id=_required_string(raw_cue, "id"), purpose=_required_string(raw_cue, "purpose"),
                start=_parse_anchor(raw_cue.get("start"), index, "start"),
                end=_parse_anchor(raw_cue.get("end"), index, "end"),
                bpm=_required_number(raw_cue, "bpm", f"cue {index}"), notes=tuple(notes)))
        return CueSheet(episode=episode, title=title, cues=tuple(cues))


def _required_string(data: dict[str, object], key: str) -> str:
    value: object = data.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{key} must be a nonempty string")
    return value


def _required_number(data: dict[str, object], key: str, context: str) -> float:
    value: object = data.get(key)
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ValueError(f"{context} {key} must be numeric")
    number = float(value)
    if not math.isfinite(number):
        raise ValueError(f"{context} {key} must be finite")
    return number


def _parse_anchor(value: object, cue_index: int, field: str) -> CueAnchor:
    if not isinstance(value, dict):
        raise ValueError(f"Cue {cue_index} {field} must be an anchor object")
    chapter = _required_string(value, "chapter")
    if "sentence" not in value:
        raise ValueError(f"Cue {cue_index} {field} sentence must be present, using null for a chapter boundary")
    sentence_value: object = value.get("sentence")
    if sentence_value is not None and (not isinstance(sentence_value, int) or isinstance(sentence_value, bool)):
        raise ValueError(f"Cue {cue_index} {field} sentence must be an integer or null")
    edge_value: object = value.get("edge")
    if edge_value not in ("start", "end"):
        raise ValueError(f"Cue {cue_index} {field} edge must be 'start' or 'end'")
    return CueAnchor(chapter, sentence_value, edge_value, _required_number(value, "offset_s", f"cue {cue_index} {field}"))


def _parse_note(value: dict[str, object], cue_index: int, note_index: int) -> CueNote:
    context = f"cue {cue_index} note {note_index}"
    instrument_value: object = value.get("instrument")
    if instrument_value not in ("piano", "strings", "electric", "bass", "kick", "shaker"):
        raise ValueError(f"{context} has unsupported instrument {instrument_value!r}")
    midi_value: object = value.get("midi")
    if not isinstance(midi_value, int) or isinstance(midi_value, bool) or not 0 <= midi_value <= 127:
        raise ValueError(f"{context} midi must be an integer in [0, 127]")
    note = CueNote(
        instrument_value, midi_value,
        _required_number(value, "beat", context), _required_number(value, "beats", context),
        _required_number(value, "release_s", context), _required_number(value, "level", context),
        _required_number(value, "pan", context), _required_number(value, "reverb_send", context))
    if note.beat < 0.0 or note.beats <= 0.0 or note.release_s < 0.0:
        raise ValueError(f"{context} beat/release must be nonnegative and beats must be positive")
    if not 0.0 <= note.level <= 1.0 or not -1.0 <= note.pan <= 1.0 or not 0.0 <= note.reverb_send <= 1.0:
        raise ValueError(f"{context} level/reverb_send must be in [0, 1] and pan in [-1, 1]")
    return note
