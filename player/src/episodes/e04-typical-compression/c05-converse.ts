import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";
import { BernoulliBlocks } from "./lib/BernoulliBlocks";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class CompressionConverseScene implements Scene {
  readonly id = "c05-converse";
  private title!: FormulaHandle;
  private readonly budget: PanelMesh[] = [];
  private readonly budgetLabels: FormulaHandle[] = [];
  private readonly proof: ProofLine[] = [];
  private readonly axes: Polyline[] = [];
  private readonly plotLabels: FormulaHandle[] = [];
  private boundCurve!: Polyline;
  private marker!: PanelMesh;
  private finiteExample!: FormulaHandle;
  private result!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Fano turns a message budget into an error floor", 960, 100, 46);
    this.budget.push(d.rectangle(170, 300, 1, 70, Palette.blue), d.rectangle(170, 480, 1, 70, Palette.green), d.rectangle(170, 630, 1, 70, Palette.orange));
    this.budgetLabels.push(d.tex("nH=72.1928\\text{ bits}", 510, 235, 34, Palette.blue), d.tex("\\log_2M=50\\text{ bits}", 510, 415, 34, Palette.green), d.tex("1+P_en\\log_2K\\ge22.1928\\text{ bits}", 510, 565, 30, Palette.orange));
    const proof: ReadonlyArray<readonly [string, number]> = [
      ["H(X^n)=nH\\quad[\\text{IID},\\ K\\ge2]", 1],
      ["H(X^n\\mid\\widehat X^n)\\le1+P_e\\log_2(K^n-1)", 7],
      ["\\le1+P_en\\log_2K", 8],
      ["I(X^n;\\widehat X^n)\\le H(\\widehat X^n)\\le\\log_2M", 9],
      ["nH\\le\\log_2M+1+P_en\\log_2K", 13],
      ["R_n\\ge H-1/n-P_e\\log_2K", 16],
    ];
    for (let i = 0; i < proof.length; i++) this.proof.push({ label: d.tex(proof[i][0], 1340, 225 + i * 100, i === 1 || i === 3 ? 31 : 35, i === 5 ? Palette.yellow : Palette.text), sentence: proof[i][1] });
    this.axes.push(d.line([[180, 330], [180, 700], [850, 700]], Palette.axis));
    this.plotLabels.push(d.text("horizontal: Rₙ (bits/symbol)",510,260,22,Palette.muted),d.text("vertical: error-probability lower bound",510,300,22,Palette.orange),d.text("0",160,710,19,Palette.muted),d.text(".5",505,720,19,Palette.muted),d.text("1",830,720,19,Palette.muted),d.text(".5",150,525,19,Palette.muted),d.text("1",150,350,19,Palette.muted));
    const h = BernoulliBlocks.entropy(0.2);
    this.boundCurve = d.line(Array.from({ length: 101 }, (_: unknown, i: number): readonly [number, number] => [180 + i * 6.5, 700 - 350 * Math.max(0, h - i / 100 - 0.01)]), Palette.orange, 5);
    this.marker = d.rectangle(505, 700 - 350 * (h - 0.5 - 0.01), 19, 19, Palette.yellow);
    this.finiteExample = d.tex("n=100,\\quad K=2,\\quad R_n=0.5:\\quad P_e\\ge0.211928", 510, 770, 29, Palette.orange);
    this.result = d.tex("P_e\\to0\\quad\\Longrightarrow\\quad\\liminf_nR_n\\ge H", 960, 805, 41, Palette.yellow);
    this.note = d.text("", 960, 845, 23, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime), plot = c.p(22), ledger = 1 - plot;
    this.title.set({ opacity: c.p(0) });
    const widths = [72.1928095, 50, 22.1928095];
    this.budget.forEach((bar: PanelMesh, i: number): void => { const width = widths[i] * 8; bar.scale.x = width; bar.position.x = (170 + width / 2 - 960) / 100; Diagram.show(bar, c.p(i === 0 ? 1 : i === 1 ? 10 : 13) * ledger); this.budgetLabels[i].set({ opacity: c.p(i === 0 ? 1 : i === 1 ? 10 : 13) * ledger }); });
    this.proof.forEach((line: ProofLine, i: number): void => {
      if (i === 5) line.label.setContent(plot > .5 ? "P_e\\ge\\frac{H-R_n-1/n}{\\log_2K}" : "R_n\\ge H-1/n-P_e\\log_2K");
      line.label.set({ opacity: c.p(line.sentence) });
    });
    this.axes.forEach((axis: Polyline): void => axis.setOpacity(plot)); this.boundCurve.setOpacity(plot); Diagram.show(this.marker, plot); this.finiteExample.set({ opacity: plot });
    this.plotLabels.forEach((label: FormulaHandle): void => label.set({opacity:plot}));
    this.result.set({ opacity: c.p(17) }); this.result.setContent(plot > 0.5 ? "\\text{when }H-R_n-1/n>0" : "P_e\\to0\\quad\\Longrightarrow\\quad\\liminf_nR_n\\ge H");
    this.result.set({ x: plot > 0.5 ? 1340 : 960, y: plot > 0.5 ? 800 : 805, scale: plot > 0.5 ? 0.65 : 1 });
    this.note.set({ opacity: c.p(19) }); this.note.setContent("Weak converse: below H the error stays bounded away from zero; this argument does not force error to one");
  }

  teardown(_layers: SceneLayers): void { this.budget.length = 0; this.budgetLabels.length = 0; this.proof.length = 0; this.axes.length = 0; this.plotLabels.length = 0; }
}
export function compressionConverseScene(): Scene { return new CompressionConverseScene(); }
