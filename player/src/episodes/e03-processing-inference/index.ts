import type { SceneFactory } from "../../core/Scene";
import { markovFactorizationScene } from "./c01-markov";
import { dataProcessingScene } from "./c02-dpi";
import { sufficientStatisticScene } from "./c03-sufficiency";
import { fanoInequalityScene } from "./c04-fano";
import { estimationScene } from "./c05-estimation";

export const processingInferenceScenes: Record<string, SceneFactory> = {
  "c01-markov": markovFactorizationScene,
  "c02-dpi": dataProcessingScene,
  "c03-sufficiency": sufficientStatisticScene,
  "c04-fano": fanoInequalityScene,
  "c05-estimation": estimationScene,
};
