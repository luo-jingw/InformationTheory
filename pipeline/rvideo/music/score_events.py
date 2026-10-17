"""Explicit note and section contracts for the original instrumental score."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

InstrumentName = Literal['piano', 'strings', 'electric', 'bass', 'kick', 'shaker']


@dataclass(frozen=True)
class ScoreNote:
    instrument: InstrumentName
    midi: int
    start_s: float
    hold_s: float
    release_s: float
    level: float
    pan: float
    reverb_send: float


@dataclass(frozen=True)
class ScoreSection:
    start_s: float
    end_s: float
    name: str
    category: str
    silence: bool = False


@dataclass(frozen=True)
class ScorePlan:
    title: str
    duration: float
    bpm: float
    notes: tuple[ScoreNote, ...]
    sections: tuple[ScoreSection, ...]
