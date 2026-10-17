import type { SceneFactory } from "../../core/Scene";
import { dmcOptimalityScene } from "./c01-dmc-optimum";
import { concavePowerKktScene } from "./c02-kkt";
import { independentGaussianModesScene } from "./c03-parallel";
import { waterFillingDerivationScene } from "./c04-waterfill";
import { waterFillingAuditScene } from "./c05-check";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-dmc-optimum": dmcOptimalityScene,
  "c02-kkt": concavePowerKktScene,
  "c03-parallel": independentGaussianModesScene,
  "c04-waterfill": waterFillingDerivationScene,
  "c05-check": waterFillingAuditScene,
};
