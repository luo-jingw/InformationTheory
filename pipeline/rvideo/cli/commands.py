"""Pipeline command implementations; each command owns one production step."""
from __future__ import annotations

import json
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Literal

import numpy as np
import soundfile as sf

from rvideo.audio.narration_mixer import MixSettings, NarrationMixer
from rvideo.contracts.speech_backend import SpeechBackend
from rvideo.delivery.delivery_checker import DeliveryChecker
from rvideo.delivery.muxer import Muxer, MuxResult
from rvideo.music.instrument_bank import InstrumentBank
from rvideo.music.cue_compiler import CueCompiler
from rvideo.music.music_composer import MusicComposer
from rvideo.music.score_settings import SAMPLE_RATE as MUSIC_RATE
from rvideo.narration.kokoro_backend import KokoroBackend
from rvideo.narration.kokoro_synthesizer import KokoroSynthesizer
from rvideo.paths import ProjectPaths
from rvideo.schema.pronunciation import PronunciationLexicon
from rvideo.schema.provenance import VoiceProvenance
from rvideo.schema.score_cues import CueSheet
from rvideo.schema.story import Story
from rvideo.schema.timeline import Timeline
from rvideo.subtitles.srt_writer import SrtWriter
from rvideo.timing.timeline_builder import TimelineBuilder, TimelineLayout
from rvideo.validate.content_validator import ContentValidator
from rvideo.validate.transcript_checker import TranscriptChecker

CommandName = Literal["validate", "narrate", "timeline", "subtitles", "music", "mix", "audio",
                      "transcribe", "mux", "check", "deliver"]


@dataclass(frozen=True)
class CommandOptions:
    command: CommandName
    episode: str
    root: Path
    version: int = 1
    workers: int = 1
    port: int = 5300
    device: str = "cuda"


class PipelineCommands:
    """Owns dispatch and orchestration among typed single-step command methods."""

    def dispatch(self, options: CommandOptions) -> int:
        paths = ProjectPaths(root=options.root.resolve())
        if options.command == "validate":
            return self.validate(paths, options.episode)
        if options.command == "narrate":
            return self.narrate(paths, options.episode, options.device)
        if options.command == "timeline":
            return self.timeline(paths, options.episode)
        if options.command == "subtitles":
            return self.subtitles(paths, options.episode)
        if options.command == "music":
            return self.music(paths, options.episode)
        if options.command == "mix":
            return self.mix(paths, options.episode)
        if options.command == "audio":
            return self.audio(paths, options.episode, options.device)
        if options.command == "transcribe":
            return self.transcribe(paths, options.episode, options.device)
        if options.command == "mux":
            return self.mux(paths, options.episode, options.version)
        if options.command == "check":
            return self.check(paths, options.episode, options.version)
        return self.deliver(paths, options)

    def validate(self, paths: ProjectPaths, episode: str) -> int:
        report = ContentValidator(paths).validate_episode(episode)
        print(f"[validate] {episode}: scenes={report.scenes} sentences={report.sentences} words={report.words} "
              f"est_minutes={report.estimated_minutes:.1f} errors={len(report.errors)} warnings={len(report.warnings)}")
        for error in report.errors:
            print("  ERROR", error)
        for warning in report.warnings:
            print("  warn ", warning)
        return 1 if report.errors else 0

    def narrate(self, paths: ProjectPaths, episode: str, device: str) -> int:
        story = Story.load(paths.story_file(episode))
        lexicon = PronunciationLexicon.load(paths.pronunciation_file)
        backend: SpeechBackend = KokoroBackend(model_dir=paths.root / ".models" / "kokoro", device=device)
        synthesizer = KokoroSynthesizer(lexicon=lexicon, backend=backend)
        provenance, made, reused = synthesizer.run(
            story, paths.sentence_dir(episode), paths.provenance_file(episode))
        durations = np.asarray([sentence.duration for sentence in provenance.sentences], dtype=np.float64)
        peaks = np.asarray([sentence.peak_dbfs for sentence in provenance.sentences], dtype=np.float64)
        total = float(durations.sum())
        minimum = float(durations.min()) if durations.size else 0.0
        median = float(np.median(durations)) if durations.size else 0.0
        maximum = float(durations.max()) if durations.size else 0.0
        peak_max = float(peaks.max()) if peaks.size else float("nan")
        print(f"[narrate] {episode}: sentences={len(provenance.sentences)} synthesized={made} reused={reused} "
              f"speech_total={total:.1f}s dur[min/med/max]={minimum:.2f}/{median:.2f}/{maximum:.2f}s "
              f"peak_max={peak_max:.1f}dBFS sr={provenance.sample_rate} voice={provenance.voice} device={device}")
        return 0

    def timeline(self, paths: ProjectPaths, episode: str) -> int:
        story = Story.load(paths.story_file(episode))
        provenance = VoiceProvenance.load(paths.provenance_file(episode))
        timeline = TimelineBuilder(TimelineLayout()).build(story, provenance)
        timeline.save(paths.timeline_file(episode))
        print(f"[timeline] {episode}: duration={timeline.duration:.2f}s chapters={len(timeline.chapters)} "
              f"captions={len(timeline.captions)} -> {paths.timeline_file(episode)}")
        return 0

    def subtitles(self, paths: ProjectPaths, episode: str) -> int:
        timeline = Timeline.load(paths.timeline_file(episode))
        count = SrtWriter().write(timeline, paths.srt_file(episode))
        print(f"[subtitles] {episode}: cues={count} -> {paths.srt_file(episode)}")
        return 0

    def music(self, paths: ProjectPaths, episode: str) -> int:
        timeline = Timeline.load(paths.timeline_file(episode))
        cue_sheet = CueSheet.load(paths.episode_content(episode) / "score-cues.json")
        missing = {chapter.id for chapter in timeline.chapters} - {cue.start.chapter for cue in cue_sheet.cues}
        if missing:
            raise ValueError(f"full episode requires an explicit score cue for every chapter; missing {sorted(missing)}")
        plan = CueCompiler().compile(cue_sheet, timeline)
        bank = InstrumentBank.load(paths.root / "assets" / "music" / "instrument-bank.json")
        music = MusicComposer(bank).render(plan)
        output = paths.music_wav(episode)
        output.parent.mkdir(parents=True, exist_ok=True)
        resolved_score = output.parent / "resolved-score.json"
        resolved_score.write_text(json.dumps(asdict(plan), ensure_ascii=False, indent=1, allow_nan=False), encoding="utf-8")
        sf.write(output, music, MUSIC_RATE, subtype="PCM_24")
        peak = float(np.abs(music).max()) if music.size else 0.0
        peak_dbfs = 20.0 * float(np.log10(max(peak, 1e-12)))
        gaps: list[tuple[float, float]] = []
        cursor = 0.0
        for section in plan.sections:
            if section.start_s > cursor:
                gaps.append((cursor, section.start_s))
            section_note_count = sum(section.start_s <= note.start_s < section.end_s for note in plan.notes)
            if section_note_count == 0:
                gaps.append((section.start_s, section.end_s))
            cursor = section.end_s
        if cursor < plan.duration:
            gaps.append((cursor, plan.duration))
        sections = [(section.name, round(section.start_s, 3), round(section.end_s, 3),
                     sum(note.start_s >= section.start_s and note.start_s < section.end_s for note in plan.notes))
                    for section in plan.sections]
        print(f"[music] {episode}: duration={music.shape[0] / MUSIC_RATE:.2f}s notes={len(plan.notes)} "
              f"peak={peak_dbfs:.1f}dBFS sections={sections} note_gaps_or_silent={[(round(a, 3), round(b, 3)) for a, b in gaps]} "
              f"score={resolved_score} wav={output}")
        return 0

    def mix(self, paths: ProjectPaths, episode: str) -> int:
        timeline = Timeline.load(paths.timeline_file(episode))
        provenance = VoiceProvenance.load(paths.provenance_file(episode))
        mixer = NarrationMixer(MixSettings())
        narration = mixer.build_narration(timeline, provenance, paths.sentence_dir(episode))
        music, sample_rate = sf.read(paths.music_wav(episode), dtype="float64")
        if sample_rate != MUSIC_RATE:
            raise RuntimeError(f"music sample rate {sample_rate} != {MUSIC_RATE}")
        narration, mix, report = mixer.mix(narration, music)
        mixer.save(paths.narration_wav(episode), narration)
        mixer.save(paths.mix_wav(episode), mix)
        print(f"[mix] {episode}: {json.dumps(asdict(report), ensure_ascii=False)}")
        return 0

    def audio(self, paths: ProjectPaths, episode: str, device: str) -> int:
        result = self.validate(paths, episode)
        if result != 0:
            return result
        result = self.narrate(paths, episode, device)
        if result != 0:
            return result
        result = self.timeline(paths, episode)
        if result != 0:
            return result
        result = self.subtitles(paths, episode)
        if result != 0:
            return result
        result = self.music(paths, episode)
        if result != 0:
            return result
        result = self.mix(paths, episode)
        if result != 0:
            return result
        return 0

    def transcribe(self, paths: ProjectPaths, episode: str, device: str) -> int:
        provenance = VoiceProvenance.load(paths.provenance_file(episode))
        checker = TranscriptChecker(model_dir=paths.root / ".models" / "whisper", device=device)
        results = checker.check(provenance, paths.sentence_dir(episode))
        output = paths.build_dir(episode) / "qa" / "transcript-check.json"
        TranscriptChecker.save(results, output)
        similarities = [result.similarity for result in results]
        minimum = min(similarities) if similarities else 1.0
        mean = sum(similarities) / len(similarities) if similarities else 1.0
        below = sum(result.similarity < 0.9 for result in results)
        print(f"[transcribe] {episode}: sentences={len(results)} similarity[min/mean]={minimum:.3f}/{mean:.3f} "
              f"below_0.9={below} -> {output}")
        for result in sorted(results, key=lambda item: item.similarity)[:12]:
            if result.similarity < 1.0:
                print(f"  {result.similarity:.3f} {result.scene_id}[{result.index}] {result.differing}")
        return 0

    def mux(self, paths: ProjectPaths, episode: str, version: int) -> int:
        result: MuxResult = Muxer(paths).mux(episode, version)
        print(f"[mux] {episode}: {json.dumps(asdict(result), ensure_ascii=False)}")
        return 0

    def check(self, paths: ProjectPaths, episode: str, version: int) -> int:
        report = DeliveryChecker(paths).check(episode, version)
        print(f"[check] {episode} v{version}: video={report.video_duration:.2f}s "
              f"audio={report.audio_duration:.2f}s timeline={report.timeline_duration:.2f}s "
              f"frames={report.video_frames} {report.width}x{report.height} fps={report.video_fps:g} "
              f"video={report.video_codec} audio={report.audio_codec} subs={report.subtitle_codec} "
              f"chapters={report.actual_chapters}/{report.expected_chapters} decode_exit={report.decode_exit} "
              f"lufs={report.integrated_lufs:.2f} peak={report.peak_dbfs:.2f}dBFS problems={report.problems}")
        return 1 if report.problems else 0

    def deliver(self, paths: ProjectPaths, options: CommandOptions) -> int:
        if options.workers < 1:
            raise ValueError("--workers must be positive")
        if self.audio(paths, options.episode, options.device) != 0:
            return 1
        video = paths.render_video(options.episode)
        video.parent.mkdir(parents=True, exist_ok=True)
        player_dir = paths.root / "player"
        tsx_cli = player_dir / "node_modules" / "tsx" / "dist" / "cli.mjs"
        if not tsx_cli.is_file():
            raise FileNotFoundError(f"local tsx CLI is missing: {tsx_cli}")
        capture = subprocess.run(
            ["node", str(tsx_cli), "render/capture.ts", "--episode", options.episode, "--out", str(video),
             "--workers", str(options.workers), "--port", str(options.port)],
            cwd=player_dir, check=False,
        )
        if capture.returncode != 0:
            print(f"[deliver] capture failed with exit {capture.returncode}")
            return 1
        if self.mux(paths, options.episode, options.version) != 0:
            return 1
        return self.check(paths, options.episode, options.version)
