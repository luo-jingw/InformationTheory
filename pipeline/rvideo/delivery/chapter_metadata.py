"""Canonical chapter marks spanning the complete audiovisual timeline."""
from __future__ import annotations

from dataclasses import dataclass

from rvideo.schema.timeline import Timeline


@dataclass(frozen=True)
class ChapterMark:
    id: str
    title: str
    start: float
    end: float


class ChapterMetadata:
    """Derives the delivery chapter list from timeline chapter boundaries."""

    @staticmethod
    def for_timeline(timeline: Timeline) -> tuple[ChapterMark, ...]:
        if not timeline.chapters:
            return ()
        ordered = sorted(timeline.chapters, key=lambda chapter: (chapter.start, chapter.end, chapter.id))
        marks: list[ChapterMark] = []
        first = ordered[0]
        if first.start > 0.0:
            marks.append(ChapterMark(id="introduction", title="Introduction", start=0.0, end=first.start))
        marks.extend(ChapterMark(id=chapter.id, title=chapter.title, start=chapter.start, end=chapter.end)
                     for chapter in ordered)
        last = ordered[-1]
        if last.end < timeline.duration:
            marks.append(ChapterMark(id="outro", title="Outro", start=last.end, end=timeline.duration))
        return tuple(marks)
