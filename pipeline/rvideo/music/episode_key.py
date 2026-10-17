"""Tonal centers for variations of the shared original course theme."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class EpisodeKey:
    root_midi: int

    @staticmethod
    def for_order(order: int) -> EpisodeKey:
        if order < 1:
            raise ValueError('Episode order must be positive')
        transpositions: tuple[int, ...] = (0, 3, -2, 5, -5, 2, -3)
        return EpisodeKey(50 + transpositions[(order - 1) % len(transpositions)])

    @property
    def transpose(self) -> int:
        return self.root_midi - 50
