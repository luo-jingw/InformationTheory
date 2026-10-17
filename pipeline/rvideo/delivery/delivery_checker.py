"""Checks encoded streams, chapters, durations, full decode and source identity."""
from __future__ import annotations

import hashlib
import json
import math
import re
import subprocess
from dataclasses import asdict
from pathlib import Path
from typing import TypedDict, cast

from rvideo.delivery.chapter_metadata import ChapterMark, ChapterMetadata
from rvideo.delivery.delivery_report import ChapterCheck, DeliveryReport, InputDigest
from rvideo.paths import ProjectPaths
from rvideo.schema.timeline import Timeline

DURATION_TOLERANCE_S = 0.2
CHAPTER_TOLERANCE_S = 0.02
EXPECTED_FPS = 30.0


class ProbeTag(TypedDict, total=False):
    title: str


class ProbeStream(TypedDict, total=False):
    index: int
    codec_type: str
    codec_name: str
    width: int
    height: int
    r_frame_rate: str
    avg_frame_rate: str
    duration: str
    nb_frames: str
    sample_rate: str
    channels: int


class ProbeChapter(TypedDict, total=False):
    id: int
    time_base: str
    start_time: str
    end_time: str
    tags: ProbeTag


class ProbeFormat(TypedDict, total=False):
    duration: str
    size: str


class ProbeOutput(TypedDict, total=False):
    streams: list[ProbeStream]
    chapters: list[ProbeChapter]
    format: ProbeFormat


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def _parse_rate(value: str) -> float:
    numerator_text, denominator_text = value.split("/", maxsplit=1)
    numerator = float(numerator_text)
    denominator = float(denominator_text)
    return numerator / denominator if denominator else 0.0


def _optional_float(value: str | None) -> float | None:
    if value is None or value == "N/A":
        return None
    try:
        return float(value)
    except ValueError:
        return None


class DeliveryChecker:
    def __init__(self, paths: ProjectPaths) -> None:
        self._paths = paths

    def check(self, episode: str, version: int) -> DeliveryReport:
        output_dir = self._paths.output_dir(episode, version)
        mp4 = output_dir / f"{episode}.en.mp4"
        if not mp4.is_file():
            raise FileNotFoundError(mp4)
        timeline_path = self._paths.timeline_file(episode)
        timeline = Timeline.load(timeline_path)
        if timeline.episode != episode:
            raise ValueError(f"timeline episode {timeline.episode!r} != {episode!r}")

        probe = self._probe(mp4)
        streams = probe.get("streams", [])
        video = next((stream for stream in streams if stream.get("codec_type") == "video"), None)
        audio = next((stream for stream in streams if stream.get("codec_type") == "audio"), None)
        subtitle = next((stream for stream in streams if stream.get("codec_type") == "subtitle"), None)
        if video is None or audio is None:
            raise ValueError("delivery MP4 must contain video and audio streams")

        video_duration = _optional_float(video.get("duration"))
        audio_duration = _optional_float(audio.get("duration"))
        if video_duration is None or audio_duration is None:
            missing = [name for name, duration in (("video", video_duration), ("audio", audio_duration))
                       if duration is None]
            raise ValueError(f"ffprobe did not provide independent stream duration for {', '.join(missing)}")

        decode = subprocess.run(
            ["ffmpeg", "-hide_banner", "-v", "error", "-i", str(mp4), "-map", "0:v:0", "-map", "0:a:0",
             "-f", "null", "-"],
            capture_output=True, text=True, check=False,
        )
        loudness_text = subprocess.run(
            ["ffmpeg", "-hide_banner", "-nostats", "-i", str(mp4), "-map", "0:a:0", "-af",
             "ebur128=peak=true", "-f", "null", "-"],
            capture_output=True, text=True, check=False,
        ).stderr
        integrated_lufs, peak_dbfs = self._parse_loudness(loudness_text)

        expected_chapters = ChapterMetadata.for_timeline(timeline)
        encoded_chapters = probe.get("chapters", [])
        chapters = self._chapter_checks(expected_chapters, encoded_chapters)
        width = int(video.get("width", 0))
        height = int(video.get("height", 0))
        video_codec = str(video.get("codec_name", ""))
        video_fps = _parse_rate(str(video.get("avg_frame_rate", video.get("r_frame_rate", "0/1"))))
        audio_codec = str(audio.get("codec_name", ""))
        audio_rate = int(audio.get("sample_rate", 0))
        audio_channels = int(audio.get("channels", 0))
        subtitle_codec = str(subtitle.get("codec_name", "")) if subtitle else None
        frames = int(video.get("nb_frames", "0"))

        problems: list[str] = []
        if abs(video_duration - timeline.duration) > DURATION_TOLERANCE_S:
            problems.append(f"video duration {video_duration:.2f}s differs from timeline {timeline.duration:.2f}s")
        if abs(audio_duration - timeline.duration) > DURATION_TOLERANCE_S:
            problems.append(f"audio duration {audio_duration:.2f}s differs from timeline {timeline.duration:.2f}s")
        if decode.returncode != 0 or decode.stderr.strip():
            problems.append(f"full decode exit {decode.returncode}: {decode.stderr.strip()[:1000]}")
        if subtitle is None:
            problems.append("no subtitle stream")
        if video_codec != "h264":
            problems.append(f"video codec {video_codec!r}, expected 'h264'")
        if audio_codec != "aac":
            problems.append(f"audio codec {audio_codec!r}, expected 'aac'")
        if subtitle_codec != "mov_text":
            problems.append(f"subtitle codec {subtitle_codec!r}, expected 'mov_text'")
        if (width, height) != (1920, 1080):
            problems.append(f"frame size {width}x{height}, expected 1920x1080")
        if abs(video_fps - EXPECTED_FPS) > 1e-6:
            problems.append(f"video frame rate {video_fps:g}, expected {EXPECTED_FPS:g}")
        if audio_rate != 48000 or audio_channels != 2:
            problems.append(f"audio format {audio_rate} Hz/{audio_channels} channels, expected 48000 Hz/stereo")
        for chapter in chapters:
            if not chapter.matches:
                problems.append(f"chapter {chapter.chapter_id!r} metadata differs from timeline")
        actual_chapter_count = len(encoded_chapters)
        if actual_chapter_count != len(expected_chapters):
            problems.append(f"chapter count {actual_chapter_count} differs from expected {len(expected_chapters)}")
        if not math.isfinite(integrated_lufs) or not math.isfinite(peak_dbfs):
            problems.append("could not parse loudness measurements")

        sample_frames = self._sample_frames(episode, version, mp4, timeline)
        inputs = (("video", self._paths.render_video(episode)), ("mix", self._paths.mix_wav(episode)),
                  ("srt", self._paths.srt_file(episode)), ("timeline", timeline_path),
                  ("story", self._paths.story_file(episode)), ("delivered_mp4", mp4),
                  ("music", self._paths.music_wav(episode)),
                  ("score_cues", self._paths.episode_content(episode) / "score-cues.json"),
                  ("resolved_score", self._paths.music_wav(episode).parent / "resolved-score.json"),
                  ("voice_provenance", self._paths.provenance_file(episode)),
                  ("instrument_manifest", self._paths.root / "assets/music/instrument-bank.json"))
        hashes = tuple(InputDigest(name=name, path=str(path), sha256=_sha256(path))
                       for name, path in inputs if path.is_file())
        report = DeliveryReport(
            episode=episode, version=version, mp4=str(mp4), timeline_duration=timeline.duration,
            video_duration=video_duration, audio_duration=audio_duration, video_frames=frames,
            width=width, height=height, video_codec=video_codec, video_fps=video_fps,
            audio_codec=audio_codec, audio_sample_rate=audio_rate, audio_channels=audio_channels,
            subtitle_stream=subtitle is not None, subtitle_codec=subtitle_codec,
            expected_chapters=len(expected_chapters), actual_chapters=actual_chapter_count,
            chapter_checks=chapters, decode_exit=decode.returncode, decode_stderr=decode.stderr,
            decode_stderr_bytes=len(decode.stderr.encode("utf-8")),
            integrated_lufs=integrated_lufs, peak_dbfs=peak_dbfs, source_hashes=hashes,
            sample_frames=sample_frames, problems=tuple(problems),
        )
        report_path = self._paths.build_dir(episode) / "qa" / f"delivery-v{version}.json"
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(asdict(report), ensure_ascii=False, indent=1), encoding="utf-8")
        return report

    @staticmethod
    def _probe(mp4: Path) -> ProbeOutput:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries",
             "format=duration,size:stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,duration,nb_frames,sample_rate,channels:chapter=id,time_base,start_time,end_time:chapter_tags=title",
             "-of", "json", str(mp4)], capture_output=True, text=True, check=False,
        )
        if result.returncode != 0:
            raise RuntimeError(f"ffprobe exit {result.returncode}: {result.stderr.strip()}")
        return cast(ProbeOutput, json.loads(result.stdout))

    @staticmethod
    def _parse_loudness(text: str) -> tuple[float, float]:
        summary = text[text.rfind("Summary:"):]
        integrated = re.search(r"I:\s+(-?[\d.]+) LUFS", summary)
        peak = re.search(r"Peak:\s+(-?[\d.]+) dBFS", summary)
        return (float(integrated.group(1)) if integrated else float("nan"),
                float(peak.group(1)) if peak else float("nan"))

    @staticmethod
    def _chapter_checks(expected: tuple[ChapterMark, ...], encoded: list[ProbeChapter]) -> tuple[ChapterCheck, ...]:
        checks: list[ChapterCheck] = []
        for index, chapter in enumerate(expected):
            actual = encoded[index] if index < len(encoded) else None
            start = _optional_float(actual.get("start_time")) if actual else None
            end = _optional_float(actual.get("end_time")) if actual else None
            tags = actual.get("tags", {}) if actual else {}
            actual_title = tags.get("title")
            matches = bool(
                actual is not None and start is not None and end is not None and actual_title == chapter.title
                and abs(start - chapter.start) <= CHAPTER_TOLERANCE_S
                and abs(end - chapter.end) <= CHAPTER_TOLERANCE_S
            )
            checks.append(ChapterCheck(
                chapter_id=chapter.id, expected_title=chapter.title, actual_title=actual_title,
                expected_start=chapter.start, expected_end=chapter.end, actual_start=start,
                actual_end=end, matches=matches,
            ))
        return tuple(checks)

    def _sample_frames(self, episode: str, version: int, mp4: Path, timeline: Timeline) -> tuple[str, ...]:
        """Save an intro frame, one frame per chapter and an outro frame for visual review."""
        output_dir = self._paths.build_dir(episode) / "qa" / f"delivery-v{version}-frames"
        output_dir.mkdir(parents=True, exist_ok=True)
        times = [2.5] + [chapter.start + 0.55 * (chapter.end - chapter.start)
                         for chapter in timeline.chapters] + [timeline.duration - 2.0]
        files: list[str] = []
        for time_s in times:
            time_s = min(max(time_s, 0.0), max(0.0, timeline.duration - 0.05))
            frame = output_dir / f"t{time_s:08.2f}.png"
            result = subprocess.run(
                ["ffmpeg", "-hide_banner", "-v", "error", "-y", "-ss", f"{time_s:.2f}",
                 "-i", str(mp4), "-frames:v", "1", str(frame)],
                capture_output=True, text=True, check=False,
            )
            if result.returncode != 0:
                raise RuntimeError(f"frame extraction at {time_s:.2f}s failed: {result.stderr.strip()}")
            files.append(str(frame))
        return tuple(files)
