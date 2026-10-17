"""Written chord voicings, form, and melodies for 'Uncertainty, in Motion'."""
from __future__ import annotations

from dataclasses import dataclass

from rvideo.music.episode_key import EpisodeKey


@dataclass(frozen=True)
class Chord:
    name: str
    bass: int
    voicing: tuple[int, ...]


@dataclass(frozen=True)
class MelodyTone:
    beat: float
    midi: int
    beats: float


class Harmony:
    """Owns the composition's 68-bar form; pitches are concert MIDI notes."""

    bars: int = 68

    def __init__(self, key: EpisodeKey) -> None:
        self._transpose = key.transpose
        self._chords: dict[str, Chord] = {
            'D9': Chord('Dmaj9', 38, (54, 57, 61, 64)),
            'F11': Chord('F#m11', 42, (57, 61, 64, 71)),
            'B9': Chord('Bm9', 35, (54, 57, 61, 62)),
            'G9': Chord('Gmaj9', 43, (54, 57, 59, 62)),
            'E9': Chord('Em9', 40, (54, 55, 59, 62)),
            'A13': Chord('A13sus', 33, (55, 59, 62, 66)),
            'DC': Chord('Dmaj9/C#', 37, (54, 57, 62, 64)),
            'Gm': Chord('Gm6', 43, (55, 58, 62, 64)),
            'A7': Chord('A7(b9)', 33, (55, 58, 61, 64)),
        }
        self._progression: tuple[str, ...] = (
            'D9', 'D9', 'G9', 'D9',
            *self._double(('D9', 'F11', 'B9', 'G9', 'DC', 'E9', 'G9', 'A13')),
            *self._double(('D9', 'F11', 'B9', 'G9', 'E9', 'F11', 'G9', 'A13')),
            *self._double(('E9', 'Gm', 'DC', 'A7')),
            *self._double(('G9', 'A13', 'F11', 'B9', 'E9', 'G9', 'A13', 'D9')),
            *self._double(('G9', 'F11', 'E9', 'D9')),
        )
        self._theme: tuple[tuple[MelodyTone, ...], ...] = (
            (MelodyTone(1, 66, .75), MelodyTone(2, 69, .75), MelodyTone(3, 76, 1.25)),
            (MelodyTone(1, 74, 1.5), MelodyTone(3, 73, 1.0)),
            (MelodyTone(.5, 73, 1), MelodyTone(2, 71, .5), MelodyTone(3, 69, .75)),
            (MelodyTone(1, 68, 1), MelodyTone(2.5, 66, 1.5)),
            (MelodyTone(1, 74, .75), MelodyTone(2, 73, .75), MelodyTone(3, 69, 1.5)),
            (MelodyTone(1, 66, 1.25), MelodyTone(3, 69, .75)),
            (MelodyTone(.5, 71, 1.5), MelodyTone(2.5, 69, .75), MelodyTone(3.5, 66, .75)),
            (MelodyTone(1, 64, 1.5), MelodyTone(3, 66, 1.25)),
            (MelodyTone(1, 69, .75), MelodyTone(2, 73, .75), MelodyTone(3, 74, 1.25)),
            (MelodyTone(1, 76, 1.5), MelodyTone(3, 73, .75)),
            (MelodyTone(.5, 67, .75), MelodyTone(1.5, 71, .75), MelodyTone(3, 78, 1.25)),
            (MelodyTone(1, 76, 1.25), MelodyTone(3, 74, .75)),
            (MelodyTone(.5, 74, 1), MelodyTone(2, 71, 1), MelodyTone(3.25, 69, .75)),
            (MelodyTone(1, 66, 2.5),),
            (MelodyTone(1, 71, .75), MelodyTone(2, 69, .75), MelodyTone(3, 66, .75)),
            (MelodyTone(.5, 64, 1.5), MelodyTone(3, 73, .75)),
        )

    def chord(self, bar: int) -> Chord:
        base = self._chords[self._progression[bar % self.bars]]
        return Chord(base.name, base.bass + self._transpose, tuple(p + self._transpose for p in base.voicing))

    def section(self, bar: int) -> str:
        within = bar % self.bars
        return 'Opening' if within < 4 else 'Theme A' if within < 20 else 'Theme A variation' if within < 36 else 'Bridge' if within < 44 else 'Theme B' if within < 60 else 'Coda'

    def melody(self, bar: int) -> tuple[MelodyTone, ...]:
        within = bar % self.bars
        if 4 <= within < 36:
            base = self._theme[(within - 4) % 16]
            variation = within >= 20
            return tuple(MelodyTone(max(0, n.beat - (.5 if variation else 0)), n.midi + self._transpose, n.beats * (.90 if variation else 1)) for n in base)
        chord = self.chord(bar)
        if 44 <= within < 60:
            if within % 2 == 0:
                return (MelodyTone(.5, chord.voicing[1] + 12, .75), MelodyTone(1.75, chord.voicing[-1] + 12, 1.25), MelodyTone(3.25, chord.voicing[2] + 12, .75))
            return (MelodyTone(1, chord.voicing[0] + 12, 2.2),)
        if 36 <= within < 44:
            return (MelodyTone(1, chord.voicing[-1] + 12, 2.4),) if within % 2 == 0 else ()
        if within >= 60:
            return (MelodyTone(.5, chord.voicing[2] + 12, 2.8),) if within % 2 == 0 else ()
        return (MelodyTone(1.5, chord.voicing[0] + 12, 1.3),) if within in (0, 2) else ()

    @staticmethod
    def _double(names: tuple[str, ...]) -> tuple[str, ...]:
        return tuple(name for name in names for _ in range(2))
