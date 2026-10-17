import type { SceneFactory } from "../core/Scene";
import { conditionalScenes } from "./environment-probe";
import { entropyInformationScenes } from "./e01-entropy-information";
import { divergenceConvexityScenes } from "./e02-divergence-convexity";

import { processingInferenceScenes } from "./e03-processing-inference";

import { episodeScenes as typicalCompressionScenes } from "./e04-typical-compression";

import { episodeScenes as memoryEntropyRateScenes } from "./e05-memory-entropy-rate";

import { episodeScenes as prefixKraftScenes } from "./e06-prefix-kraft";

import { episodeScenes as huffmanUniversalScenes } from "./e07-huffman-universal";

import { episodeScenes as channelCapacityScenes } from "./e08-channel-capacity";

import { episodeScenes as channelCodingScenes } from "./e09-channel-coding";

import { episodeScenes as differentialGaussianScenes } from "./e10-differential-gaussian";

import { episodeScenes as awgnCodingScenes } from "./e11-awgn-coding";

import { episodeScenes as bandwidthEnergyScenes } from "./e12-bandwidth-energy";

import { episodeScenes as kktWaterfillingScenes } from "./e13-kkt-waterfilling";

import { episodeScenes as coloredChannelsScenes } from "./e14-colored-channels";

/** Explicitly registered scenes; production episode IDs remain absent until their scenes are implemented. */
export const EPISODE_SCENES: Record<string, Record<string, SceneFactory>> = {
  "environment-probe": conditionalScenes,
  "e01-entropy-information": entropyInformationScenes,
  "e02-divergence-convexity": divergenceConvexityScenes,
  "e03-processing-inference": processingInferenceScenes,
  "e04-typical-compression": typicalCompressionScenes,
  "e05-memory-entropy-rate": memoryEntropyRateScenes,
  "e06-prefix-kraft": prefixKraftScenes,
  "e07-huffman-universal": huffmanUniversalScenes,
  "e08-channel-capacity": channelCapacityScenes,
  "e09-channel-coding": channelCodingScenes,
  "e10-differential-gaussian": differentialGaussianScenes,
  "e11-awgn-coding": awgnCodingScenes,
  "e12-bandwidth-energy": bandwidthEnergyScenes,
  "e13-kkt-waterfilling": kktWaterfillingScenes,
  "e14-colored-channels": coloredChannelsScenes,
};
