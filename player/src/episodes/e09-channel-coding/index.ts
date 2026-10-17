import type { SceneFactory } from "../../core/Scene";
import { blockCodeScene } from "./c01-code";
import { jointTypicalityScene } from "./c02-joint";
import { randomCodebookScene } from "./c03-random";
import { expurgationScene } from "./c04-expurgation";
import { channelConverseScene } from "./c05-converse";
import { sourceChannelSeparationScene } from "./c06-separation";
import { causalFeedbackScene } from "./c07-feedback";

export const episodeScenes: Record<string, SceneFactory> = {
  "c01-code": blockCodeScene,
  "c02-joint": jointTypicalityScene,
  "c03-random": randomCodebookScene,
  "c04-expurgation": expurgationScene,
  "c05-converse": channelConverseScene,
  "c06-separation": sourceChannelSeparationScene,
  "c07-feedback": causalFeedbackScene,
};
