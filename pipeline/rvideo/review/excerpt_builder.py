"""Build one chapter-local review interval from existing measured production inputs."""
from __future__ import annotations

import math
from dataclasses import dataclass, replace

from rvideo.schema.provenance import VoiceProvenance
from rvideo.schema.timeline import Timeline, TimelineCaption, TimelineChapter

FPS = 30
TAIL_SECONDS = 1.6


@dataclass(frozen=True)
class ExcerptSpec:
    episode: str
    source_start: float
    duration: float
    fps: int


@dataclass(frozen=True)
class ReviewExcerpt:
    spec: ExcerptSpec
    timeline: Timeline
    provenance: VoiceProvenance


class ExcerptBuilder:
    def build(self, timeline: Timeline, provenance: VoiceProvenance, chapter_id: str,
              last_sentence: int) -> ReviewExcerpt:
        chapter = next((candidate for candidate in timeline.chapters if candidate.id == chapter_id), None)
        if chapter is None:
            raise ValueError(f"unknown chapter {chapter_id!r}")
        if not 0 <= last_sentence < len(chapter.sentence_ends):
            raise ValueError(f"last_sentence {last_sentence} is outside chapter {chapter_id!r}")
        if len(chapter.sentence_starts) != len(chapter.sentence_ends):
            raise ValueError(f"chapter {chapter_id!r} has inconsistent sentence boundaries")

        source_start_frame = round(chapter.start * FPS)
        source_start = source_start_frame / FPS
        requested_end = chapter.start + chapter.sentence_ends[last_sentence] + TAIL_SECONDS
        source_end_frame = min(round(chapter.end * FPS), math.ceil(requested_end * FPS - 1e-6))
        source_end = source_end_frame / FPS
        duration = (source_end_frame - source_start_frame) / FPS
        if duration <= 0.0:
            raise ValueError("review excerpt interval must have positive duration")
        if abs(source_start * FPS - round(source_start * FPS)) > 1e-3 or abs(duration * FPS - round(duration * FPS)) > 1e-3:
            raise ValueError("review excerpt interval must lie on the 30-fps frame grid")

        chapter_shift = chapter.start - source_start
        local_chapter = TimelineChapter(
            id=chapter.id, index=chapter.index, start=chapter_shift, end=duration,
            title=chapter.title, music=chapter.music,
            sentence_starts=chapter.sentence_starts[:last_sentence + 1],
            sentence_ends=chapter.sentence_ends[:last_sentence + 1])
        chapter_captions = tuple(caption for caption in timeline.captions
                                 if chapter.start <= caption.start < chapter.end)[:last_sentence + 1]
        if len(chapter_captions) != last_sentence + 1:
            raise ValueError(f"timeline captions for {chapter.id!r} do not cover sentence indices 0..{last_sentence}")
        captions = tuple(TimelineCaption(round(caption.start - source_start, 4), round(caption.end - source_start, 4),
                                         caption.text, caption.translation) for caption in chapter_captions)
        shifted_timeline = Timeline(language=timeline.language, episode=timeline.episode, duration=duration,
                                    chapters=(local_chapter,), captions=captions)
        selected_voice = tuple(sentence for sentence in provenance.sentences
                               if sentence.scene_id == chapter.id and sentence.index <= last_sentence)
        if len(selected_voice) != last_sentence + 1:
            raise ValueError(f"voice provenance for {chapter.id!r} does not cover sentence indices 0..{last_sentence}")
        selected_voice = tuple(sorted(selected_voice, key=lambda sentence: sentence.index))
        if tuple(sentence.index for sentence in selected_voice) != tuple(range(last_sentence + 1)):
            raise ValueError(f"voice provenance for {chapter.id!r} has duplicate or missing sentence indices")
        shifted_provenance = replace(provenance, sentences=selected_voice)
        spec = ExcerptSpec(timeline.episode, source_start, duration, FPS)
        return ReviewExcerpt(spec, shifted_timeline, shifted_provenance)
