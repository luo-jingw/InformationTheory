import type { SceneFactory } from "../../core/Scene";
import { communicationScene } from "./c01-communication";
import { surprisalScene } from "./c02-surprisal";
import { conditionalEntropyScene } from "./c03-conditional";
import { mutualInformationScene } from "./c04-mutual";
import { recapScene } from "./c05-recap";

export const entropyInformationScenes: Record<string, SceneFactory> = {
  "c01-communication": communicationScene,
  "c02-surprisal": surprisalScene,
  "c03-conditional": conditionalEntropyScene,
  "c04-mutual": mutualInformationScene,
  "c05-recap": recapScene,
};
