"""Mix and loudness settings per episode kind."""
from __future__ import annotations

from dataclasses import dataclass

from rvideo.audio.narration_mixer import MixSettings


@dataclass(frozen=True)
class MixProfile:
    mix: MixSettings
    target_lufs: float

    @staticmethod
    def for_kind(kind: str) -> MixProfile:
        if kind != "episode":
            raise ValueError(f"Unsupported episode kind {kind!r}")
        return MixProfile(mix=MixSettings(), target_lufs=-16.0)
