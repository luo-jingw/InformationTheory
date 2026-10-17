"""Build a narration, score, and review mix for a selected chapter interval."""
from __future__ import annotations

import argparse
import json
from dataclasses import asdict, replace
from pathlib import Path

from rvideo.audio.narration_mixer import MixSettings, NarrationMixer
from rvideo.music.cue_compiler import CueCompiler
from rvideo.music.instrument_bank import InstrumentBank
from rvideo.music.music_composer import MusicComposer
from rvideo.music.score_events import ScoreNote, ScorePlan, ScoreSection
from rvideo.paths import ProjectPaths
from rvideo.review.excerpt_builder import ExcerptBuilder
from rvideo.schema.provenance import VoiceProvenance
from rvideo.schema.score_cues import CueSheet
from rvideo.schema.timeline import Timeline
from rvideo.subtitles.srt_writer import SrtWriter


def _clip_score(plan: ScorePlan, source_start: float, duration: float) -> ScorePlan:
    source_end = source_start + duration
    notes: list[ScoreNote] = []
    for note in plan.notes:
        if not source_start <= note.start_s < source_end:
            continue
        remaining = source_end - note.start_s
        hold_s = min(note.hold_s, remaining)
        release_s = min(note.release_s, max(0.0, remaining - hold_s))
        notes.append(replace(note, start_s=note.start_s - source_start, hold_s=hold_s, release_s=release_s))
    sections: list[ScoreSection] = []
    for section in plan.sections:
        start = max(source_start, section.start_s)
        end = min(source_end, section.end_s)
        if end > start:
            sections.append(replace(section, start_s=start - source_start, end_s=end - source_start))
    return ScorePlan(plan.title, duration, plan.bpm, tuple(notes), tuple(sections))


def build(root: Path, episode: str, chapter_id: str, last_sentence: int, output_dir: Path) -> None:
    paths = ProjectPaths(root.resolve())
    if output_dir.exists():
        raise FileExistsError(f"excerpt output already exists: {output_dir}")
    timeline = Timeline.load(paths.timeline_file(episode))
    provenance = VoiceProvenance.load(paths.provenance_file(episode))
    excerpt = ExcerptBuilder().build(timeline, provenance, chapter_id, last_sentence)
    sheet = CueSheet.load(paths.episode_content(episode) / "score-cues.json")
    full_plan = CueCompiler().compile(sheet, timeline)
    excerpt_score = _clip_score(full_plan, excerpt.spec.source_start, excerpt.spec.duration)

    output_dir.mkdir(parents=True, exist_ok=False)
    spec_path = output_dir / "excerpt.json"
    spec_path.write_text(json.dumps({
        "episode": excerpt.spec.episode, "sourceStart": excerpt.spec.source_start,
        "duration": excerpt.spec.duration, "fps": excerpt.spec.fps,
    }, ensure_ascii=False, indent=1, allow_nan=False), encoding="utf-8")
    excerpt.timeline.save(output_dir / "timeline.json")
    SrtWriter().write(excerpt.timeline, output_dir / "captions.srt")
    (output_dir / "score.json").write_text(
        json.dumps(asdict(excerpt_score), ensure_ascii=False, indent=1, allow_nan=False), encoding="utf-8")

    bank = InstrumentBank.load(root / "assets" / "music" / "instrument-bank.json")
    music = MusicComposer(bank).render(excerpt_score)
    mixer = NarrationMixer(MixSettings())
    narration = mixer.build_narration(excerpt.timeline, excerpt.provenance, paths.sentence_dir(episode))
    leveled_narration, mix, mix_report = mixer.mix(narration, music)
    NarrationMixer.save(output_dir / "music.wav", music)
    NarrationMixer.save(output_dir / "narration.wav", leveled_narration)
    NarrationMixer.save(output_dir / "mix.wav", mix)
    (output_dir / "mix-report.json").write_text(
        json.dumps(asdict(mix_report), ensure_ascii=False, indent=1, allow_nan=False), encoding="utf-8")
    print(f"[build-excerpt] {episode}/{chapter_id}[0..{last_sentence}]: "
          f"source={excerpt.spec.source_start:.3f}s duration={excerpt.spec.duration:.3f}s "
          f"frames={round(excerpt.spec.duration * excerpt.spec.fps)} notes={len(excerpt_score.notes)} "
          f"-> {output_dir} (spec {spec_path})")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, type=Path)
    parser.add_argument("--episode", required=True)
    parser.add_argument("--chapter", required=True)
    parser.add_argument("--last-sentence", required=True, type=int)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    build(args.root, args.episode, args.chapter, args.last_sentence, args.out)


if __name__ == "__main__":
    main()
