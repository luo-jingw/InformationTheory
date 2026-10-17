"""Orchestration levels for the original piano-led chamber-electronic score."""
from __future__ import annotations

from dataclasses import dataclass

SAMPLE_RATE: int = 48_000
BPM: float = 78.0
MASTER_PEAK: float = 0.86


@dataclass(frozen=True)
class ScoreProfile:
    piano: float
    electric: float
    strings: float
    bass: float
    percussion: float
    lead: float


_PROFILES: dict[str, ScoreProfile] = {
    'motivation': ScoreProfile(1.0, .78, .85, .82, .45, .75),
    'definition': ScoreProfile(.86, .68, .70, .75, .22, .28),
    'proof': ScoreProfile(.72, .62, .62, .64, 0.0, .14),
    'counterexample': ScoreProfile(.90, .74, .76, .80, .28, .40),
    'recap': ScoreProfile(.96, .78, .86, .82, .36, .48),
}


def profile_for_category(category: str) -> ScoreProfile:
    try:
        return _PROFILES[category]
    except KeyError as exc:
        raise ValueError(f'Unknown music category: {category}') from exc
