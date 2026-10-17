"""Typed observations recorded by the delivery checker."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class InputDigest:
    name: str
    path: str
    sha256: str


@dataclass(frozen=True)
class ChapterCheck:
    chapter_id: str
    expected_title: str
    actual_title: str | None
    expected_start: float
    expected_end: float
    actual_start: float | None
    actual_end: float | None
    matches: bool


@dataclass(frozen=True)
class DeliveryReport:
    episode: str
    version: int
    mp4: str
    timeline_duration: float
    video_duration: float
    audio_duration: float
    video_frames: int
    width: int
    height: int
    video_codec: str
    video_fps: float
    audio_codec: str
    audio_sample_rate: int
    audio_channels: int
    subtitle_stream: bool
    subtitle_codec: str | None
    expected_chapters: int
    actual_chapters: int
    chapter_checks: tuple[ChapterCheck, ...]
    decode_exit: int
    decode_stderr: str
    decode_stderr_bytes: int
    integrated_lufs: float
    peak_dbfs: float
    source_hashes: tuple[InputDigest, ...]
    sample_frames: tuple[str, ...]
    problems: tuple[str, ...]
