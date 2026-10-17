import type { ChapterTiming, Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "./lib/Diagram";

import { SecretQuestionExperiment } from "./lib/SecretQuestionExperiment";

export class CommunicationScene implements Scene {
  readonly id = "c01-communication";
  private title!: FormulaHandle;
  private secret!: SecretQuestionExperiment;
  private legacyTiming!: ChapterTiming;
  private readonly boxes: PanelMesh[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly arrows: Polyline[] = [];
  private noise!: FormulaHandle;
  private readonly sourceTiles: PanelMesh[] = [];
  private readonly sourceLabels: FormulaHandle[] = [];
  private channel!: FormulaHandle;
  private readonly codeLabels: FormulaHandle[] = [];
  private equation!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers, timing: ChapterTiming): void {
    const d = new Diagram(layers);
    this.secret = new SecretQuestionExperiment(d);
    this.legacyTiming = { duration: timing.duration, sentenceStarts: timing.sentenceStarts.slice(8), sentenceEnds: timing.sentenceEnds.slice(8) };
    this.title = d.text("Where does uncertainty enter communication?", 960, 100, 47);
    for (const [index, label] of ["SOURCE  X", "CHANNEL", "RECEIVER  Y"].entries()) {
      const x = 400 + index * 560;
      this.boxes.push(d.rectangle(x, 310, 330, 150));
      this.labels.push(d.text(label, x, 310, 37, index === 1 ? Palette.orange : Palette.blue));
      if (index < 2) this.arrows.push(d.line([[x + 180, 310], [x + 370, 310], [x + 345, 290], [x + 370, 310], [x + 345, 330]], Palette.blue, 4));
    }
    this.noise = d.text("noise ↓", 960, 205, 32, Palette.orange);
    this.sourceLabels.push(d.text("Same alphabet, different source probabilities", 520, 450, 29));
    for (let row = 0; row < 2; row++) {
      this.sourceLabels.push(d.tex(row === 0 ? "p_X=(0.5,0.5)" : "p_X=(0.9,0.1)", 520, 500 + row * 160, 32, Palette.blue));
      for (let column = 0; column < 10; column++) this.sourceTiles.push(d.rectangle(240 + column * 62, 555 + row * 160, 52, 60, column < (row === 0 ? 5 : 9) ? Palette.blue : Palette.purple));
    }
    this.channel = d.tex("p_{Y\\mid X}(y\\mid x)\\quad\\text{describes the channel}", 1390, 520, 33, Palette.orange);
    this.sourceLabels.push(d.text("0 = blue     1 = purple", 520, 770, 26, Palette.muted));
    this.sourceLabels.push(d.text("Probabilities describe a model, not a fixed schedule", 520, 805, 25, Palette.muted));
    this.codeLabels.push(d.text("4 messages", 360, 470, 32, Palette.blue));
    this.codeLabels.push(d.text("3 channel uses per message", 1060, 470, 32, Palette.green));
    const words = ["00    →    000", "01    →    011", "10    →    101", "11    →    110"];
    words.forEach((word: string, i: number): void => { this.codeLabels.push(d.text(word, 700, 540 + i * 60, 35, Palette.text)); });
    this.codeLabels.push(d.tex("M=4,\\quad n=3,\\quad R=\\frac{\\log_2 4}{3}=\\frac23", 1400, 645, 36, Palette.yellow));
    this.equation = d.tex("\\underbrace{p_X(x)}_{\\text{source}}\\qquad\\underbrace{p_{Y\\mid X}(y\\mid x)}_{\\text{channel}}", 1280, 700, 39, Palette.yellow);
    this.note = d.text("Source probabilities and channel noise are different models", 1290, 780, 27, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    this.secret.draw(ctx);
    const c = new Cues(this.legacyTiming, ctx.localTime);
    this.title.set({ opacity: c.p(0) });
    const model = 1 - c.p(18);
    const code = c.p(18) * (1 - c.p(28));
    const question = c.p(28);
    this.boxes.forEach((box: PanelMesh, i: number): void => Diagram.show(box, c.p(i) * (1 - 0.4 * question)));
    this.labels.forEach((label: FormulaHandle, i: number): void => label.set({ opacity: c.p(i) }));
    this.arrows.forEach((line: Polyline, i: number): void => line.setOpacity(c.p(i + 1)));
    this.noise.set({ opacity: c.p(2) });
    this.sourceTiles.forEach((tile: PanelMesh, i: number): void => Diagram.show(tile, c.p(i < 10 ? 8 : 9) * model));
    this.sourceLabels.forEach((label: FormulaHandle, i: number): void => label.set({ opacity: c.p(i === 2 ? 9 : 8) * model }));
    this.channel.set({ opacity: c.p(12) * model });
    this.codeLabels.forEach((label: FormulaHandle, i: number): void => label.set({ opacity: c.p(i === 6 ? 21 : 19) * code }));
    this.equation.set({ opacity: c.p(7), y: question > 0.5 ? 585 : code > 0.5 ? 790 : 700 });
    this.equation.setContent(ctx.localTime >= c.s(28) ? "\\text{How much information is in one source outcome?}" : ctx.localTime >= c.s(23) ? "P_e=\\Pr(\\widehat M\\ne M),\\quad R=\\frac{\\log_2 M}{n}" : ctx.localTime >= c.s(18) ? "\\text{message}\\longrightarrow\\text{codeword}\\longrightarrow\\text{decoded message}" : "\\underbrace{p_X(x)}_{\\text{source}}\\qquad\\underbrace{p_{Y\\mid X}(y\\mid x)}_{\\text{channel}}");
    this.note.set({ opacity: c.p(7), x: question > 0.5 ? 960 : 1290, y: question > 0.5 ? 710 : code > 0.5 ? 835 : 780 });
    this.equation.set({ x: question > 0.5 || code > 0.5 ? 960 : 1280 });
    this.note.setContent(ctx.localTime >= c.s(28) ? "Common and rare outcomes call for different information values" : ctx.localTime >= c.s(26) ? "Capacity requires a coding theorem" : ctx.localTime >= c.s(18) ? "Rate and decoding reliability are separate quantities" : "Source probabilities and channel noise are different models");
  }

  teardown(_layers: SceneLayers): void {
    this.boxes.length = 0; this.labels.length = 0; this.arrows.length = 0;
    this.sourceTiles.length = 0; this.sourceLabels.length = 0; this.codeLabels.length = 0;
  }
}

export function communicationScene(): Scene { return new CommunicationScene(); }
