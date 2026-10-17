import type { SceneFactory } from "../../core/Scene";
import { convexityScene } from "./c01-convex";
import { divergenceScene } from "./c02-kl";
import { gibbsScene } from "./c03-gibbs";
import { entropyConcavityScene } from "./c04-jensen";
import { informationShapeScene } from "./c05-mi-shape";
import { codingMismatchScene } from "./c06-mismatch";

export const divergenceConvexityScenes: Record<string, SceneFactory> = {
  "c01-convex": convexityScene,
  "c02-kl": divergenceScene,
  "c03-gibbs": gibbsScene,
  "c04-jensen": entropyConcavityScene,
  "c05-mi-shape": informationShapeScene,
  "c06-mismatch": codingMismatchScene,
};
