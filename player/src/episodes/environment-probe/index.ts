import type { SceneFactory } from "../../core/Scene";
import { conditionalScene } from "./conditional";

export const conditionalScenes: Record<string, SceneFactory> = {
  conditional: conditionalScene,
};
