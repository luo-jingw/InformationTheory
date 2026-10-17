"""Kokoro inference from explicit local public weights, without account or hub lookup."""
from __future__ import annotations

import hashlib
from importlib.metadata import version
from pathlib import Path

import numpy as np
import torch
from kokoro import KModel, KPipeline

from rvideo.contracts.speech_backend import SpeechIdentity, SpeechSamples


class KokoroBackend:
    def __init__(self, model_dir: Path, device: str) -> None:
        self._model_dir = model_dir.resolve(strict=True)
        self._device = device
        self._pipeline: KPipeline | None = None

    @staticmethod
    def _sha256(path: Path) -> str:
        digest = hashlib.sha256()
        with path.open('rb') as source:
            for block in iter(lambda: source.read(1 << 20), b''):
                digest.update(block)
        return digest.hexdigest()

    def _voice_path(self, voice: str) -> Path:
        if voice != 'af_heart':
            raise ValueError(f'Unconfigured voice {voice!r}; the validated voice is af_heart')
        return self._model_dir / 'voices' / f'{voice}.pt'

    def identity(self, voice: str) -> SpeechIdentity:
        return SpeechIdentity(
            model_repo='hexgrad/Kokoro-82M', model_revision=self._model_dir.name,
            weights_sha256=self._sha256(self._model_dir / 'kokoro-v1_0.pth'),
            voice_sha256=self._sha256(self._voice_path(voice)),
            kokoro_version=version('kokoro'), misaki_version=version('misaki'),
            torch_version=version('torch'), spacy_version=version('spacy'))

    def _load(self) -> KPipeline:
        if self._pipeline is None:
            if self._device == 'cuda' and not torch.cuda.is_available():
                raise RuntimeError('Configured CUDA device is unavailable')
            model = KModel(repo_id='hexgrad/Kokoro-82M', config=str(self._model_dir / 'config.json'),
                           model=str(self._model_dir / 'kokoro-v1_0.pth')).to(self._device).eval()
            self._pipeline = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M', model=model)
        return self._pipeline

    def synthesize(self, text: str, voice: str, rate: float) -> SpeechSamples:
        pipeline = self._load()
        chunks: list[np.ndarray] = []
        with torch.inference_mode():
            for result in pipeline(text, voice=str(self._voice_path(voice)), speed=rate, split_pattern=None):
                if result.audio is None:
                    raise RuntimeError(f'No waveform for {text!r}')
                chunks.append(result.audio.detach().cpu().numpy())
        if not chunks:
            raise RuntimeError(f'Kokoro produced no audio for {text!r}')
        pcm = np.concatenate(chunks).astype(np.float32)
        if pcm.ndim != 1 or pcm.size == 0 or not np.isfinite(pcm).all():
            raise ValueError('Invalid synthesized mono PCM')
        return SpeechSamples(pcm=pcm, sample_rate=24000)
