import type { SceneFactory } from "../../core/Scene";
import { densityScaleScene } from "./c01-density";
import { jacobianScene } from "./c02-transform";
import { covarianceEllipseScene } from "./c03-covariance";
import { gaussianMaximumEntropyScene } from "./c04-gaussian";
import { estimationEntropyScene } from "./c05-maximum";
import { continuousAepScene } from "./c06-continuous-aep";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-density": densityScaleScene,
  "c02-transform": jacobianScene,
  "c03-covariance": covarianceEllipseScene,
  "c04-gaussian": gaussianMaximumEntropyScene,
  "c05-maximum": estimationEntropyScene,
  "c06-continuous-aep": continuousAepScene,
};
