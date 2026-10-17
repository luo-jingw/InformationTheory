import type { SceneFactory } from "../../core/Scene";
import { timeBandwidthScene } from "./c01-dimensions";
import { continuousAwgnCapacityScene } from "./c02-capacity";
import { widebandLimitScene } from "./c03-wideband";
import { energyEfficiencyScene } from "./c04-energy";
import { signalingFamiliesScene } from "./c05-signaling";
import { capacityTradeoffScene } from "./c06-tradeoff";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-dimensions": timeBandwidthScene,
  "c02-capacity": continuousAwgnCapacityScene,
  "c03-wideband": widebandLimitScene,
  "c04-energy": energyEfficiencyScene,
  "c05-signaling": signalingFamiliesScene,
  "c06-tradeoff": capacityTradeoffScene,
};
