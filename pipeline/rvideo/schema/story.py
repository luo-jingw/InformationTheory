"""Per-episode English script: scenes with explicit sentence list and Chinese translation."""
from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

MusicCategory = Literal["motivation", "definition", "proof", "counterexample", "recap"]
EPISODE_MUSIC: tuple[MusicCategory, ...] = ("motivation", "definition", "proof", "counterexample", "recap")
MUSIC_CATEGORIES: tuple[MusicCategory, ...] = EPISODE_MUSIC


@dataclass(frozen=True)
class StorySentence:
    en: str
    zh: str
    hold_after_s: float = 0.0

    def __post_init__(self) -> None:
        if (not isinstance(self.hold_after_s, (int, float)) or isinstance(self.hold_after_s, bool) or
                not math.isfinite(self.hold_after_s) or self.hold_after_s < 0.0):
            raise ValueError("hold_after_s must be finite and nonnegative")


@dataclass(frozen=True)
class StoryScene:
    id: str
    chapter: str
    title: str
    music: MusicCategory
    terms: tuple[str, ...]
    sentences: tuple[StorySentence, ...]


@dataclass(frozen=True)
class Story:
    episode: str
    title: str
    voice: str
    rate: float
    scenes: tuple[StoryScene, ...]

    @staticmethod
    def load(path: Path) -> Story:
        raw = json.loads(path.read_text(encoding="utf-8"))
        scenes: list[StoryScene] = []
        for s in raw["scenes"]:
            music = s["music"]
            if music not in MUSIC_CATEGORIES:
                raise ValueError(f"scene {s['id']}: invalid music category {music!r}")
            sentences_list: list[StorySentence] = []
            for index, value in enumerate(s["sentences"]):
                raw_hold: object = value.get("hold_after_s", 0.0)
                if not isinstance(raw_hold, (int, float)) or isinstance(raw_hold, bool):
                    raise ValueError(f"{s['id']} sentence {index}: hold_after_s must be numeric")
                sentences_list.append(StorySentence(en=str(value["en"]), zh=str(value["zh"]),
                                                   hold_after_s=float(raw_hold)))
            sentences = tuple(sentences_list)
            scenes.append(StoryScene(id=str(s["id"]), chapter=str(s["chapter"]), title=str(s["title"]),
                                     music=music, terms=tuple(str(t) for t in s.get("terms", [])),
                                     sentences=sentences))
        return Story(episode=str(raw["episode"]), title=str(raw["title"]), voice=str(raw["voice"]),
                     rate=float(raw["rate"]), scenes=tuple(scenes))
