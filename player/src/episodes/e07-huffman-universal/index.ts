import type { SceneFactory } from "../../core/Scene";
import { shannonMismatchScene } from "./c01-shannon-mismatch";
import { huffmanMergeScene } from "./c02-huffman";
import { huffmanOptimalityScene } from "./c03-optimality";
import { sfeIntervalScene } from "./c04-sfe";
import { universalCodingCriteriaScene } from "./c05-universal";
import { lempelZivDictionaryScene } from "./c06-lz78";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-shannon-mismatch": shannonMismatchScene,
  "c02-huffman": huffmanMergeScene,
  "c03-optimality": huffmanOptimalityScene,
  "c04-sfe": sfeIntervalScene,
  "c05-universal": universalCodingCriteriaScene,
  "c06-lz78": lempelZivDictionaryScene,
};
