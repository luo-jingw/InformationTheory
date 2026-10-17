import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "./lib/Diagram";

export class SurprisalScene implements Scene {
  readonly id = "c02-surprisal";
  private title!: FormulaHandle;
  private formula!: FormulaHandle;
  private detail!: FormulaHandle;
  private readonly axes: Polyline[] = [];
  private surprisal!: Polyline;
  private binary!: Polyline;
  private marker!: PanelMesh;
  private readout!: FormulaHandle;
  private readonly plotLabels: FormulaHandle[] = [];
  private readonly treeEdges: Polyline[] = [];
  private readonly treeAnswers: FormulaHandle[] = [];
  private readonly treeNodes: PanelMesh[] = [];
  private readonly treeLabels: FormulaHandle[] = [];
  private readonly contributions: PanelMesh[] = [];
  private readonly contributionLabels: FormulaHandle[] = [];
  private average!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("From one outcome to average uncertainty", 960, 100, 47);
    this.axes.push(d.line([[200, 260], [200, 680], [920, 680]], Palette.axis));
    this.surprisal = d.line(Array.from({ length: 101 }, (_: unknown, i: number): readonly [number, number] => {
      const p = 0.125 + 0.875 * i / 100;
      return [200 + 700 * p, 680 - Math.log2(1 / p) * 120];
    }), Palette.orange, 5);
    this.binary = d.line(Array.from({ length: 101 }, (_: unknown, i: number): readonly [number, number] => [200 + 700 * i / 100, 680 - 340 * this.binaryEntropy(i / 100)]), Palette.green, 5);
    this.marker = d.rectangle(900, 680, 16, 16, Palette.yellow);
    this.plotLabels.push(d.tex("p", 930, 700, 32));
    this.plotLabels.push(d.tex("0", 200, 720, 28, Palette.muted));
    this.plotLabels.push(d.tex("1/2", 550, 720, 28, Palette.muted));
    this.plotLabels.push(d.tex("1", 900, 720, 28, Palette.muted));
    this.readout = d.tex("p=1,\\quad I=0", 550, 230, 34, Palette.yellow);
    this.formula = d.tex("I(x)=\\log_2\\frac1{p(x)}", 1410, 330, 49, Palette.orange);
    this.detail = d.tex("p(A\\cap B)=p(A)p(B)", 1400, 530, 36, Palette.blue);
    this.average = d.tex("H(X)=\\mathbb E[I(X)]", 1410, 730, 42, Palette.yellow);
    const nodes: ReadonlyArray<readonly [number, number, string, string]> = [
      [400, 270, "Is it A?", Palette.muted], [230, 440, "A: 1/2", Palette.blue], [600, 440, "Is it B?", Palette.muted],
      [470, 600, "B: 1/4", Palette.green], [760, 600, "Is it C?", Palette.muted],
      [660, 745, "C: 1/8", Palette.orange], [900, 745, "D: 1/8", Palette.purple],
    ];
    for (const [x, y, text, color] of nodes) {
      this.treeNodes.push(d.rectangle(x, y, 155, 62));
      this.treeLabels.push(d.text(text, x, y, 28, color));
    }
    for (const [a, b] of [[0, 1], [0, 2], [2, 3], [2, 4], [4, 5], [4, 6]]) this.treeEdges.push(d.line([[nodes[a][0], nodes[a][1] + 35], [nodes[b][0], nodes[b][1] - 35]], Palette.axis, 4));
    for (const [text, x, y] of [["yes", 275, 345], ["no", 550, 345], ["yes", 510, 510], ["no", 720, 510], ["yes", 680, 665], ["no", 870, 665]] as const) this.treeAnswers.push(d.text(text, x, y, 24, Palette.muted));
    for (let i = 0; i < 4; i++) {
      const x = 1170 + i * 170;
      this.contributions.push(d.rectangle(x, 600, 100, 1, [Palette.blue, Palette.green, Palette.orange, Palette.purple][i]));
      this.contributionLabels.push(d.tex(["\\frac12\\cdot1", "\\frac14\\cdot2", "\\frac18\\cdot3", "\\frac18\\cdot3"][i], x, 650, 30));
    }
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const tree = c.p(24);
    const plot = 1 - tree;
    const hb = c.p(16);
    const single = c.p(1) * (1 - hb);
    this.title.set({ opacity: c.p(0) });
    this.axes.forEach((axis: Polyline): void => axis.setOpacity(c.p(1) * plot));
    this.surprisal.setOpacity(single * plot);
    this.binary.setOpacity(hb * plot);
    this.plotLabels.forEach((label: FormulaHandle): void => label.set({ opacity: c.p(1) * plot }));
    const p = ctx.localTime < c.s(16) ? 1 - 0.5 * c.p(4) - 0.25 * c.p(5) - 0.125 * c.p(6) : c.p(19) - 0.5 * c.p(20);
    const value = ctx.localTime < c.s(16) ? Math.log2(1 / p) : this.binaryEntropy(p);
    this.marker.position.set((200 + 700 * p - 960) / 100, (540 - (680 - value * (hb > 0.5 ? 340 : 120))) / 100, 0.1);
    Diagram.show(this.marker, c.p(3) * plot);
    this.readout.set({ opacity: c.p(3) * plot });
    this.readout.setContent(`p=${p.toFixed(3)},\\quad ${hb > 0.5 ? "H_b" : "I"}=${value.toFixed(3)}\\ \\text{bits}`);
    this.formula.set({ opacity: c.p(1), y: tree > 0.5 ? 310 : 330, x: 1410 });
    this.formula.setContent(ctx.localTime >= c.s(30) ? "\\text{Depths: }1,2,3,3" : ctx.localTime >= c.s(24) ? "\\text{Yes-or-no questions}" : ctx.localTime >= c.s(16) ? "H_b(p)=-p\\log_2p-(1-p)\\log_2(1-p)" : ctx.localTime >= c.s(12) ? "H(X)=-\\sum_xp(x)\\log_2p(x)" : "I(x)=\\log_2\\frac1{p(x)}");
    this.formula.set({ scale: ctx.localTime >= c.s(16) && ctx.localTime < c.s(24) ? 0.68 : 0.9 });
    this.detail.set({ opacity: c.p(7) * (1 - tree) });
    this.detail.setContent(ctx.localTime >= c.s(16) ? "H_b(0)=H_b(1)=0,\\quad H_b(1/2)=1" : ctx.localTime >= c.s(14) ? "\\lim_{p\\downarrow0}p\\log_2p=0" : ctx.localTime >= c.s(12) ? "H(X)=\\sum_xp(x)I(x)" : ctx.localTime >= c.s(9) ? "I(A\\cap B)=I(A)+I(B)\\quad(A\\perp B)" : "p(A\\cap B)=p(A)p(B)");
    this.detail.set({ scale: 0.85 });
    this.average.set({ opacity: c.p(11), x: tree > 0.5 ? 1450 : 1410, y: tree > 0.5 ? 755 : 730 });
    this.average.setContent(ctx.localTime >= c.s(32) ? "\\mathbb E[\\text{depth}]=H(X)=\\frac74=1.75" : ctx.localTime >= c.s(24) ? "p=(1/2,1/4,1/8,1/8)" : "H(X)=\\mathbb E[I(X)]");
    this.average.set({ scale: tree > 0.5 ? 0.9 : 1 });
    const nodeCues = [25, 27, 27, 29, 29, 29, 29];
    this.treeNodes.forEach((node: PanelMesh, i: number): void => Diagram.show(node, c.p(nodeCues[i]) * tree));
    this.treeLabels.forEach((label: FormulaHandle, i: number): void => label.set({ opacity: c.p(nodeCues[i]) * tree }));
    this.treeEdges.forEach((edge: Polyline, i: number): void => edge.setOpacity(c.p(i < 2 ? 26 : i < 4 ? 28 : 29) * tree));
    this.treeAnswers.forEach((label: FormulaHandle, i: number): void => label.set({ opacity: c.p(i < 2 ? 26 : i < 4 ? 28 : 29) * tree }));
    const terms = [0.5, 0.5, 0.375, 0.375];
    this.contributions.forEach((bar: PanelMesh, i: number): void => Diagram.bar(bar, 1170 + i * 170, 600, terms[i] * 350, c.p(31) * tree));
    this.contributionLabels.forEach((label: FormulaHandle): void => label.set({ opacity: c.p(31) * tree }));
  }

  teardown(_layers: SceneLayers): void {
    this.axes.length = 0; this.plotLabels.length = 0; this.treeEdges.length = 0; this.treeNodes.length = 0;
    this.treeAnswers.length = 0; this.treeLabels.length = 0; this.contributions.length = 0; this.contributionLabels.length = 0;
  }

  private binaryEntropy(p: number): number {
    return p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  }
}

export function surprisalScene(): Scene { return new SurprisalScene(); }
