"""Render the original written score using sampled instruments and a stereo room."""
from __future__ import annotations

import numpy as np

from rvideo.music.instrument_bank import InstrumentRenderer
from rvideo.music.room_processor import RoomProcessor
from rvideo.music.score_events import ScoreNote, ScorePlan, ScoreSection
from rvideo.music.score_settings import MASTER_PEAK, SAMPLE_RATE
from rvideo.music.voices import Voices


class MusicComposer:
    """Own the dry/send mix; arrangement and instrument timbres have separate owners."""

    def __init__(self, bank: InstrumentRenderer) -> None:
        self._bank = bank

    def render(self, plan: ScorePlan) -> np.ndarray:
        count = max(0, int(np.ceil(plan.duration * SAMPLE_RATE)))
        output = np.zeros((count, 2), dtype=np.float32)
        send = np.zeros(count, dtype=np.float32)
        for note in plan.notes:
            self._mix_note(output, send, note)
        if count == 0:
            return output
        RoomProcessor().apply(output, send)
        self._apply_explicit_silence(output, plan.sections)
        self._master(output)
        return output

    @staticmethod
    def _apply_explicit_silence(output: np.ndarray, sections: tuple[ScoreSection, ...]) -> None:
        fade_frames = int(round(0.05 * SAMPLE_RATE))
        intervals: list[tuple[int, int]] = []
        for section in sections:
            if not section.silence:
                continue
            start = max(0, min(output.shape[0], int(round(section.start_s * SAMPLE_RATE))))
            end = max(start, min(output.shape[0], int(round(section.end_s * SAMPLE_RATE))))
            if start == end:
                continue
            if intervals and start <= intervals[-1][1]:
                intervals[-1] = (intervals[-1][0], max(intervals[-1][1], end))
            else:
                intervals.append((start, end))

        envelope = np.ones(output.shape[0], dtype=np.float32)
        for start, end in intervals:
            fade_start = max(0, start - fade_frames)
            if fade_start < start:
                fade_out = np.linspace(1.0, 0.0, start - fade_start, dtype=np.float32)
                envelope[fade_start:start] = np.minimum(envelope[fade_start:start], fade_out)
            envelope[start:end] = 0.0
            fade_end = min(output.shape[0], end + fade_frames)
            if end < fade_end:
                fade_in = np.linspace(0.0, 1.0, fade_end - end, dtype=np.float32)
                envelope[end:fade_end] = np.minimum(envelope[end:fade_end], fade_in)
        output *= envelope[:, None]

    def _mix_note(self, output: np.ndarray, send: np.ndarray, note: ScoreNote) -> None:
        first = int(round(note.start_s * SAMPLE_RATE))
        if first >= output.shape[0]:
            return
        audio = (self._bank.render_sample(note) if note.instrument in ('piano', 'strings', 'shaker')
                 else Voices.render(note))
        usable = min(audio.shape[0], output.shape[0] - first)
        if usable <= 0:
            return
        source = audio[:usable]
        angle = (note.pan + 1) * np.pi / 4
        left = np.float32(np.cos(angle) * np.sqrt(2) * note.level)
        right = np.float32(np.sin(angle) * np.sqrt(2) * note.level)
        output[first:first + usable, 0] += source[:, 0] * left
        output[first:first + usable, 1] += source[:, 1] * right
        send[first:first + usable] += source.mean(axis=1) * np.float32(note.level * note.reverb_send)

    @staticmethod
    def _master(output: np.ndarray) -> None:
        count = output.shape[0]
        fade_in = min(count, int(1.0 * SAMPLE_RATE))
        fade_out = min(count, int(4.0 * SAMPLE_RATE))
        output[:fade_in] *= np.linspace(0, 1, fade_in, dtype=np.float32)[:, None]
        output[-fade_out:] *= np.linspace(1, 0, fade_out, dtype=np.float32)[:, None]
        peak = float(np.max(np.abs(output)))
        if peak > MASTER_PEAK:
            output *= np.float32(MASTER_PEAK / peak)
