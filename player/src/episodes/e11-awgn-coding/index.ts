import type { SceneFactory } from "../../core/Scene";
import { realAwgnScene } from "./c01-awgn";
import { awgnUpperBoundScene } from "./c02-upper";
import { gaussianCodebookSelectionScene } from "./c03-codebook";
import { gaussianVolumeGeometryScene } from "./c04-geometry";
import { binaryGaussianInputScene } from "./c05-bpsk";
import { gaussianBinaryComparisonScene } from "./c06-comparison";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-awgn": realAwgnScene,
  "c02-upper": awgnUpperBoundScene,
  "c03-codebook": gaussianCodebookSelectionScene,
  "c04-geometry": gaussianVolumeGeometryScene,
  "c05-bpsk": binaryGaussianInputScene,
  "c06-comparison": gaussianBinaryComparisonScene,
};
