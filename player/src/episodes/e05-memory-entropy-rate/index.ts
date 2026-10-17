import type { SceneFactory } from "../../core/Scene";
import { memoryComparisonScene } from "./c01-memory";
import { entropyRateLimitScene } from "./c02-rate";
import { markovClassesScene } from "./c03-classes";
import { stationaryDistributionScene } from "./c04-stationary";
import { markovEntropyRateScene } from "./c05-markov-rate";
import { ergodicEquipartitionScene } from "./c06-ergodic-aep";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-memory": memoryComparisonScene,
  "c02-rate": entropyRateLimitScene,
  "c03-classes": markovClassesScene,
  "c04-stationary": stationaryDistributionScene,
  "c05-markov-rate": markovEntropyRateScene,
  "c06-ergodic-aep": ergodicEquipartitionScene,
};
