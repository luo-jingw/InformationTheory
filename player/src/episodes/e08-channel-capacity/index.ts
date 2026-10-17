import type { SceneFactory } from "../../core/Scene";
import { dmcDefinitionScene } from "./c01-dmc";
import { bscCapacityScene } from "./c02-bsc";
import { becCapacityScene } from "./c03-bec";
import { weakSymmetryScene } from "./c04-symmetric";
import { asymmetricChannelScene } from "./c05-asymmetric";
import { capacityPropertiesScene } from "./c06-properties";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-dmc": dmcDefinitionScene,
  "c02-bsc": bscCapacityScene,
  "c03-bec": becCapacityScene,
  "c04-symmetric": weakSymmetryScene,
  "c05-asymmetric": asymmetricChannelScene,
  "c06-properties": capacityPropertiesScene,
};
