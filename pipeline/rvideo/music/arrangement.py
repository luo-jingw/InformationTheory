"""Phrase-aware orchestration of the written course theme and its lecture version."""
from __future__ import annotations

import math
from dataclasses import replace

import numpy as np

from rvideo.music.episode_key import EpisodeKey
from rvideo.music.harmony import Chord, Harmony, MelodyTone
from rvideo.music.score_events import InstrumentName, ScoreNote, ScorePlan, ScoreSection
from rvideo.music.score_settings import BPM, ScoreProfile, profile_for_category
from rvideo.schema.timeline import Timeline


class ScoreArrangement:
    """Own all note scheduling; timbre renderers receive complete note events."""

    def theme(self, episode_order: int = 1) -> ScorePlan:
        duration = Harmony.bars * 4 * 60 / BPM + 3.0
        return self._build(duration, episode_order, None)

    def lecture(self, timeline: Timeline, episode_order: int) -> ScorePlan:
        return self._build(timeline.duration, episode_order, timeline)

    def _build(self, duration: float, episode_order: int, timeline: Timeline | None) -> ScorePlan:
        beat = 60 / BPM
        bar_length = 4 * beat
        harmony = Harmony(EpisodeKey.for_order(episode_order))
        rng = np.random.default_rng(9137 + episode_order * 109)
        notes: list[ScoreNote] = []
        sections: list[ScoreSection] = []
        count = math.ceil(duration / bar_length)
        theme_mode = timeline is None
        last_label = ''
        for bar in range(count):
            start = bar * bar_length
            section = harmony.section(bar)
            category = self._category(start + bar_length / 2, timeline)
            profile = profile_for_category(category)
            if theme_mode:
                profile = ScoreProfile(1.0, .90, .92, .86, .58, 1.0)
            chord = harmony.chord(bar)
            if not theme_mode and duration - start < 8:
                chord = harmony.chord(0)
                section = 'Closing resolution'
            if theme_mode and bar >= Harmony.bars:
                continue
            label = section + ' / ' + category
            if label != last_label:
                if sections:
                    sections[-1] = replace(sections[-1], end_s=start)
                sections.append(ScoreSection(start, duration, section, category))
                last_label = label
            is_opening = bar % Harmony.bars < 4
            is_bridge = section == 'Bridge'
            is_lift = section == 'Theme B'
            # A low piano root, inner voices, then a displaced upper response.
            piano_pattern: tuple[tuple[float, int, float], ...] = (
                (0, chord.bass + 12, .78),
                (.08, chord.voicing[1], .60),
                (1.5, chord.voicing[0], .63),
                (1.56, chord.voicing[-1], .55),
                (2.75, chord.voicing[2], .60),
                (3.5, chord.voicing[1], .43),
            )
            if category == 'proof' and not theme_mode:
                piano_pattern = (piano_pattern[0], piano_pattern[2], piano_pattern[4])
            for pulse, midi, velocity in piano_pattern:
                self._add(notes, rng, 'piano', midi, start + pulse * beat,
                          (1.45 if pulse < .1 else .95) * beat, 1.55,
                          .205 * profile.piano * velocity, -.18, .35)
            if bar % 2 == 0:
                for index, midi in enumerate(chord.voicing):
                    self._add(notes, rng, 'electric', midi, start + .22 * beat + index * .013,
                              5.4 * beat, 1.0, .075 * profile.electric,
                              .20, .30)
            if not is_opening or bar >= 2:
                for index, midi in enumerate(chord.voicing):
                    self._add(notes, rng, 'strings', midi, start + index * .021,
                              3.65 * beat, 1.10, .052 * profile.strings * (.85 if is_bridge else 1),
                              -.45 + index * .30, .43)
            if not is_opening:
                self._add(notes, rng, 'bass', chord.bass, start, 2.05 * beat, .34,
                          .13 * profile.bass, 0, .035)
                if not is_bridge:
                    self._add(notes, rng, 'bass', chord.bass + (12 if bar % 2 else 7), start + 2.75 * beat,
                              .72 * beat, .22, .066 * profile.bass, 0, .025)
            percussion = profile.percussion
            if is_opening or is_bridge or (section == 'Coda' and bar % 2):
                percussion = 0
            if percussion > 0:
                for pulse, strength in ((0.0, 1.0), (2.5, .67)):
                    self._add(notes, rng, 'kick', 36, start + pulse * beat,
                              .15, .28, .085 * percussion * strength, 0, .025)
                for stroke, pulse in enumerate((.5, 1.5, 2.5, 3.5)):
                    self._add(notes, rng, 'shaker', stroke % 2, start + pulse * beat + .018,
                              .17, .12, .038 * percussion * (1.0 if stroke % 2 else .75),
                              .30 if stroke % 2 else -.30, .13)
            melody = harmony.melody(bar)
            lead = profile.lead
            if not theme_mode:
                # Sparse four-bar statements return about once per 98 seconds.
                if bar % 32 >= 4 and category not in ('motivation', 'recap'):
                    melody = ()
                if category == 'proof':
                    melody = melody[:1] if bar % 2 == 0 else ()
            for tone in melody:
                midi = self._melody_register(tone.midi, theme_mode)
                self._add(notes, rng, 'piano', midi, start + tone.beat * beat,
                          tone.beats * beat, 1.85, .255 * lead * (1.06 if is_lift else 1),
                          .04, .40)
            if bar % 4 == 3 and not is_opening:
                answer = chord.voicing[-1]
                self._add(notes, rng, 'electric', answer, start + 2.15 * beat,
                          1.1 * beat, 1.15, .055 * profile.electric, .30, .42)
        return ScorePlan('Uncertainty, in Motion', duration, BPM,
                         tuple(sorted(notes, key=lambda n: n.start_s)), tuple(sections))

    @staticmethod
    def _category(at: float, timeline: Timeline | None) -> str:
        if timeline is None:
            return 'motivation'
        for chapter in timeline.chapters:
            if chapter.start <= at < chapter.end:
                return chapter.music
        if timeline.chapters and at >= timeline.chapters[-1].end:
            return 'recap'
        return 'motivation'

    @staticmethod
    def _melody_register(midi: int, theme: bool) -> int:
        ceiling = 81 if theme else 78
        while midi > ceiling:
            midi -= 12
        return midi

    @staticmethod
    def _add(notes: list[ScoreNote], rng: np.random.Generator, instrument: InstrumentName,
             midi: int, start: float, hold: float, release: float, level: float,
             pan: float, send: float) -> None:
        timing = float(rng.uniform(-.009, .009)) if start > .02 else 0.0
        velocity = float(rng.uniform(.93, 1.07))
        notes.append(ScoreNote(instrument, midi, max(0, start + timing), hold, release,
                               level * velocity, pan, send))
