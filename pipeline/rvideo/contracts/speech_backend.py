"""Explicit synthesis boundary shared by narration orchestration and a voice backend."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

import numpy as np
from numpy.typing import NDArray


@dataclass(frozen=True)
class SpeechIdentity:
    model_repo: str
    model_revision: str
    weights_sha256: str
    voice_sha256: str
    kokoro_version: str
    misaki_version: str
    torch_version: str
    spacy_version: str


@dataclass(frozen=True)
class SpeechSamples:
    pcm: NDArray[np.float32]
    sample_rate: int


class SpeechBackend(Protocol):
    def identity(self, voice: str) -> SpeechIdentity: ...

    def synthesize(self, text: str, voice: str, rate: float) -> SpeechSamples: ...
