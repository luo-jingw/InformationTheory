import type { SceneFactory } from "../../core/Scene";
import { decodingDistinctionsScene } from "./c01-decoding";
import { kraftConstructionScene } from "./c02-kraft";
import { mcMillanCountingScene } from "./c03-mcmillan";
import { codeLengthLowerBoundScene } from "./c04-length";
import { shannonLengthScene } from "./c05-shannon";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-decoding": decodingDistinctionsScene,
  "c02-kraft": kraftConstructionScene,
  "c03-mcmillan": mcMillanCountingScene,
  "c04-length": codeLengthLowerBoundScene,
  "c05-shannon": shannonLengthScene,
};
