import type { SceneFactory } from "../../core/Scene";
import { toeplitzModesScene } from "./c01-toeplitz";
import { toeplitzSpectrumScene } from "./c02-spectrum";
import { frequencyWaterfillScene } from "./c03-frequency";
import { filteredChannelScene } from "./c04-filter";
import { feedbackBoundaryScene } from "./c05-feedback-boundary";
import { courseMapScene } from "./c06-course-map";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-toeplitz": toeplitzModesScene,
  "c02-spectrum": toeplitzSpectrumScene,
  "c03-frequency": frequencyWaterfillScene,
  "c04-filter": filteredChannelScene,
  "c05-feedback-boundary": feedbackBoundaryScene,
  "c06-course-map": courseMapScene,
};
