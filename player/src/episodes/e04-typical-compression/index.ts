import type { SceneFactory } from "../../core/Scene";
import { equipartitionScene } from "./c01-aep";
import { typicalCountingScene } from "./c02-counting";
import { randomBinningScene } from "./c03-binning";
import { compressionAchievabilityScene } from "./c04-achievability";
import { compressionConverseScene } from "./c05-converse";
import { compressionBoundaryScene } from "./c06-boundaries";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-aep": equipartitionScene,
  "c02-counting": typicalCountingScene,
  "c03-binning": randomBinningScene,
  "c04-achievability": compressionAchievabilityScene,
  "c05-converse": compressionConverseScene,
  "c06-boundaries": compressionBoundaryScene,
};
