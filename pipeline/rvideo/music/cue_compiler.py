"""Resolve an authored cue sheet against the measured narration timeline."""
from __future__ import annotations

import math
from typing import cast

from rvideo.music.score_events import InstrumentName, ScoreNote, ScorePlan, ScoreSection
from rvideo.schema.score_cues import CueAnchor, CueSheet, ScoreCue
from rvideo.schema.timeline import Timeline, TimelineChapter


class CueCompiler:
    def compile(self, sheet: CueSheet, timeline: Timeline) -> ScorePlan:
        if sheet.episode != timeline.episode:
            raise ValueError(f"cue sheet episode {sheet.episode!r} does not match timeline {timeline.episode!r}")
        if not math.isfinite(timeline.duration) or timeline.duration < 0.0:
            raise ValueError("timeline duration must be finite and nonnegative")
        chapters = {chapter.id: chapter for chapter in timeline.chapters}
        if len(chapters) != len(timeline.chapters):
            raise ValueError("timeline chapter IDs must be unique")
        if not sheet.cues:
            raise ValueError("cue sheet must contain at least one explicit cue")

        sections: list[ScoreSection] = []
        notes: list[ScoreNote] = []
        seen_ids: set[str] = set()
        previous_end = 0.0
        for cue in sheet.cues:
            if not cue.id.strip() or not cue.purpose.strip() or cue.id in seen_ids:
                raise ValueError(f"cue IDs must be unique and cue id/purpose nonempty: {cue.id!r}")
            seen_ids.add(cue.id)
            self._validate_finite_cue(cue)
            start = self._resolve(cue.start, chapters, timeline.duration)
            end = self._resolve(cue.end, chapters, timeline.duration)
            if end <= start:
                raise ValueError(f"cue {cue.id}: end must be after start")
            if start < previous_end - 1e-9:
                raise ValueError(f"cue {cue.id}: cues must be ordered and nonoverlapping")
            if start < -1e-9 or end > timeline.duration + 1e-9:
                raise ValueError(f"cue {cue.id}: interval [{start:.6f}, {end:.6f}] exceeds timeline")
            previous_end = end
            sections.append(ScoreSection(start, end, cue.id, cue.purpose, silence=not cue.notes))
            for cue_note in cue.notes:
                note_start = start + cue_note.beat * 60.0 / cue.bpm
                hold_s = cue_note.beats * 60.0 / cue.bpm
                note_end = note_start + hold_s + cue_note.release_s
                if note_start < start - 1e-9 or note_end > end + 1e-9:
                    raise ValueError(f"cue {cue.id}: note at beat {cue_note.beat:g} including release exceeds cue interval")
                notes.append(ScoreNote(cast(InstrumentName, cue_note.instrument), cue_note.midi, note_start,
                                      hold_s, cue_note.release_s, cue_note.level, cue_note.pan,
                                      cue_note.reverb_send))
        return ScorePlan(sheet.title, timeline.duration, sheet.cues[0].bpm,
                         tuple(sorted(notes, key=lambda note: note.start_s)), tuple(sections))

    @staticmethod
    def _resolve(anchor: CueAnchor, chapters: dict[str, TimelineChapter], duration: float) -> float:
        chapter = chapters.get(anchor.chapter)
        if chapter is None:
            raise ValueError(f"score anchor references unknown chapter {anchor.chapter!r}")
        if len(chapter.sentence_starts) != len(chapter.sentence_ends):
            raise ValueError(f"chapter {anchor.chapter!r} has inconsistent sentence boundaries")
        if anchor.edge not in ("start", "end") or not math.isfinite(anchor.offset_s):
            raise ValueError(f"invalid score anchor for chapter {anchor.chapter!r}")
        if anchor.sentence is None:
            base = chapter.start if anchor.edge == "start" else chapter.end
        else:
            if not 0 <= anchor.sentence < len(chapter.sentence_starts):
                raise ValueError(f"score anchor sentence {anchor.sentence} is outside chapter {anchor.chapter!r}")
            offsets = chapter.sentence_starts if anchor.edge == "start" else chapter.sentence_ends
            base = chapter.start + offsets[anchor.sentence]
        resolved = base + anchor.offset_s
        if not math.isfinite(resolved) or resolved < -1e-9 or resolved > duration + 1e-9:
            raise ValueError(f"score anchor for chapter {anchor.chapter!r} resolves outside the timeline")
        return max(0.0, min(duration, resolved))

    @staticmethod
    def _validate_finite_cue(cue: ScoreCue) -> None:
        if not math.isfinite(cue.bpm) or cue.bpm <= 0.0:
            raise ValueError(f"cue {cue.id}: bpm must be finite and positive")
        for note in cue.notes:
            values = (note.beat, note.beats, note.release_s, note.level, note.pan, note.reverb_send)
            if any(not math.isfinite(value) for value in values):
                raise ValueError(f"cue {cue.id}: note values must be finite")
            if (note.instrument not in ("piano", "strings", "electric", "bass", "kick", "shaker") or
                    not isinstance(note.midi, int) or isinstance(note.midi, bool) or
                    not 0 <= note.midi <= 127 or note.beat < 0 or note.beats <= 0 or note.release_s < 0):
                raise ValueError(f"cue {cue.id}: note pitch/beat/length/release is invalid")
            if not 0 <= note.level <= 1 or not -1 <= note.pan <= 1 or not 0 <= note.reverb_send <= 1:
                raise ValueError(f"cue {cue.id}: note level/pan/reverb_send is outside its valid range")
