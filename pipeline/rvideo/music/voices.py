"""Electric-piano, round bass and soft kick synthesis for the chamber score."""
from __future__ import annotations

import numpy as np

from rvideo.music.pitch import midi_to_hz
from rvideo.music.score_events import ScoreNote
from rvideo.music.score_settings import SAMPLE_RATE


class Voices:
    """Stateless synthesizers; the mixer owns note gain, panning and room sends."""

    @staticmethod
    def render(note: ScoreNote) -> np.ndarray:
        n = max(1, int(np.ceil((note.hold_s + note.release_s) * SAMPLE_RATE)))
        t = np.arange(n, dtype=np.float64) / SAMPLE_RATE
        frequency = midi_to_hz(note.midi)
        if note.instrument == 'electric':
            phase = 2 * np.pi * frequency * t
            tine = (1.4 * np.exp(-t / .095) + .24) * np.sin(2 * phase)
            body = np.sin(phase + tine) + .12 * np.sin(2 * phase + .2)
            decay = .72 * np.exp(-t / 1.7) + .28 * np.exp(-t / 4.0)
            left = body * decay
            right = (np.sin(phase * 1.00065 + tine) + .12 * np.sin(2 * phase * 1.00065 + .2)) * decay
            stereo = .62 * np.column_stack((left, right))
        elif note.instrument == 'bass':
            phase = 2 * np.pi * frequency * t
            mono = (.80 * np.sin(phase) + .16 * np.sin(2 * phase) + .04 * np.sin(3 * phase)) * np.exp(-t / 2.2)
            stereo = .70 * np.column_stack((mono, mono))
        elif note.instrument == 'kick':
            phase = 2 * np.pi * (48 * t + 2.9 * (1 - np.exp(-t / .04)))
            mono = np.sin(phase) * np.exp(-t / .16)
            stereo = .65 * np.column_stack((mono, mono))
        else:
            raise ValueError(f'Not a synthesized instrument: {note.instrument}')
        attack = .012 if note.instrument == 'bass' else .005
        envelope = np.minimum(1.0, t / attack)
        if note.release_s > 0:
            release = np.clip((t - note.hold_s) / note.release_s, 0, 1)
            envelope *= np.cos(release * np.pi / 2) ** 2
        stereo *= envelope[:, None]
        return stereo.astype(np.float32)
