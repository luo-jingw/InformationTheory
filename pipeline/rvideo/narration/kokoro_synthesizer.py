"""Sentence-level Kokoro synthesis with content-addressed caching and provenance."""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import soundfile as sf

from rvideo.contracts.speech_backend import SpeechBackend
from rvideo.schema.pronunciation import PronunciationLexicon
from rvideo.schema.provenance import SentenceAudio, VoiceProvenance
from rvideo.schema.story import Story

SAMPLE_RATE = 24000


@dataclass(frozen=True)
class SynthesisJob:
    scene_index: int
    scene_id: str
    sentence_index: int
    text: str
    tts_text: str
    cache_key: str
    file_name: str


class KokoroSynthesizer:
    """Owns build/<eid>/en/audio/sentences/ and voice-provenance.json."""

    def __init__(self, lexicon: PronunciationLexicon, backend: SpeechBackend) -> None:
        self._lexicon = lexicon
        self._backend = backend

    def plan_jobs(self, story: Story) -> list[SynthesisJob]:
        identity = self._backend.identity(story.voice)
        identity_key = json.dumps(asdict(identity), sort_keys=True)
        jobs: list[SynthesisJob] = []
        for si, scene in enumerate(story.scenes):
            for ti, sentence in enumerate(scene.sentences):
                tts_text = self._lexicon.apply(sentence.en)
                key = hashlib.sha256(f"{identity_key}|{story.voice}|{story.rate}|{tts_text}".encode()).hexdigest()
                jobs.append(SynthesisJob(scene_index=si, scene_id=scene.id, sentence_index=ti, text=sentence.en,
                                         tts_text=tts_text, cache_key=key,
                                         file_name=f"{key[:20]}.wav"))   # content-addressed: survives reordering
        return jobs

    def run(self, story: Story, sentence_dir: Path, provenance_path: Path) -> tuple[VoiceProvenance, int, int]:
        """Returns (provenance, synthesized_count, reused_count)."""
        sentence_dir.mkdir(parents=True, exist_ok=True)
        jobs = self.plan_jobs(story)
        records: list[SentenceAudio] = []
        synthesized = 0
        reused = 0
        for job in jobs:
            path = sentence_dir / job.file_name
            if path.exists():
                reused += 1
                audio, sr = sf.read(path, dtype="float32")
                if sr != SAMPLE_RATE:
                    raise RuntimeError(f"{path}: sample rate {sr} != {SAMPLE_RATE}")
            else:
                result = self._backend.synthesize(job.tts_text, story.voice, story.rate)
                if result.sample_rate != SAMPLE_RATE:
                    raise ValueError(f"Unexpected synthesis sample rate {result.sample_rate}")
                audio = result.pcm
                sf.write(path, audio, SAMPLE_RATE, subtype="PCM_16")
                audio, sr = sf.read(path, dtype="float32")
                synthesized += 1
            if audio.ndim != 1 or audio.size == 0 or not np.isfinite(audio).all():
                raise ValueError(f"Invalid mono PCM: {path}")
            peak = float(np.abs(audio).max())
            records.append(SentenceAudio(
                scene_id=job.scene_id, index=job.sentence_index, text=job.text, text_sha256=job.cache_key,
                file=job.file_name, samples=int(audio.shape[0]), duration=audio.shape[0] / SAMPLE_RATE,
                peak_dbfs=20.0 * float(np.log10(max(peak, 1e-9)))))
        referenced = {j.file_name for j in jobs}
        for stale in sentence_dir.glob("*.wav"):
            if stale.name not in referenced:
                stale.unlink()
        identity = self._backend.identity(story.voice)
        provenance = VoiceProvenance(
            model_repo=identity.model_repo, model_revision=identity.model_revision,
            weights_sha256=identity.weights_sha256, voice=story.voice,
            voice_sha256=identity.voice_sha256, rate=story.rate,
            sample_rate=SAMPLE_RATE, kokoro_version=identity.kokoro_version,
            misaki_version=identity.misaki_version, torch_version=identity.torch_version,
            spacy_version=identity.spacy_version, sentences=tuple(records))
        provenance.save(provenance_path)
        return provenance, synthesized, reused

