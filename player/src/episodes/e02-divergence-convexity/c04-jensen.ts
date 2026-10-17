import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface MixBar { mesh: PanelMesh; label: FormulaHandle; value: FormulaHandle; x: number; }
interface ProofLine { label: FormulaHandle; sentence: number; }

export class EntropyConcavityScene implements Scene {
  readonly id = "c04-jensen";
  private title!: FormulaHandle;
  private readonly plot: Polyline[] = [];
  private curveLabel!: FormulaHandle;
  private readonly proof: ProofLine[] = [];
  private readonly bars: MixBar[] = [];
  private readonly groupLabels: FormulaHandle[] = [];
  private weight!: FormulaHandle;
  private readonly gapBars: PanelMesh[] = [];
  private readonly gapLabels: FormulaHandle[] = [];
  private result!: FormulaHandle;
  private support!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Mixing probability models increases entropy", 960, 100, 47);
    this.plot.push(d.line([[170, 650], [790, 650]], Palette.axis));
    this.plot.push(d.line(Array.from({length: 101}, (_: unknown, i: number): readonly [number, number] => {
      const u = i / 100;
      return [170 + 620 * u, 650 - (u > 0 ? -u * Math.log2(u) : 0) * 600];
    }), Palette.blue, 5));
    this.plot.push(d.line([[170, 650], [790, 650]], Palette.orange, 4));
    this.curveLabel = d.tex("\\phi(u)=-u\\log_2u,\\quad\\phi''(u)=-1/(u\\ln2)<0", 480, 245, 30, Palette.blue);
    const proof: ReadonlyArray<readonly [string, number]> = [
      ["p_i=\\sum_j\\lambda_jp_{ji},\\quad\\sum_j\\lambda_j=1", 2],
      ["\\phi(p_i)\\ge\\sum_j\\lambda_j\\phi(p_{ji})", 7],
      ["H(P)\\ge\\sum_j\\lambda_jH(P_j)", 11],
      ["\\sum_{j:\\lambda_j>0}\\lambda_jD(P_j\\Vert P)", 16],
      ["=\\sum_{j,i}\\lambda_jp_{ji}\\log_2p_{ji}-\\sum_i p_i\\log_2p_i", 22],
      ["=H(P)-\\sum_j\\lambda_jH(P_j)\\ge0", 25],
    ];
    for (let i = 0; i < proof.length; i++) this.proof.push({label: d.tex(proof[i][0], 1330, 255 + (i % 3) * 180, i === 4 ? 30 : 36, i % 3 === 2 ? Palette.yellow : Palette.text), sentence: proof[i][1]});
    this.support = d.tex("\\lambda_j>0:\\quad p_i\\ge\\lambda_jp_{ji}\\quad\\Rightarrow\\quad P_j\\ll P", 960, 780, 34, Palette.green);
    const xs = [260, 390, 760, 890, 1310, 1440];
    for (let i = 0; i < xs.length; i++) this.bars.push({mesh: d.rectangle(xs[i], 570, 88, 1, i < 2 ? Palette.blue : i < 4 ? Palette.purple : Palette.green), label: d.tex(i % 2 === 0 ? "0" : "1", xs[i], 615, 30), value: d.text("", xs[i], 300, 34), x: xs[i]});
    this.groupLabels.push(d.tex("P_1=(1,0)", 325, 240, 36, Palette.blue), d.tex("P_2=(0,1)", 825, 240, 36, Palette.purple), d.tex("P=\\lambda P_1+(1-\\lambda)P_2", 1375, 240, 30, Palette.green));
    this.weight = d.tex("\\lambda=0.5", 960, 710, 39, Palette.yellow);
    this.gapBars.push(d.rectangle(400, 785, 340, 1, Palette.orange), d.rectangle(1375, 785, 340, 1, Palette.green));
    this.gapLabels.push(d.tex("\\sum_j\\lambda_jH(P_j)=0", 400, 740, 32, Palette.orange), d.tex("H(P)=1", 1375, 710, 34, Palette.green));
    this.result = d.tex("H(P)-\\sum_j\\lambda_jH(P_j)=\\sum_{j:\\lambda_j>0}\\lambda_jD(P_j\\Vert P)", 960, 810, 34, Palette.yellow);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const scalar = 1 - c.p(15);
    const algebra = 1 - c.p(29);
    const example = c.p(29);
    const lambda = 0.5 + 0.3 * c.p(35);
    const h = -lambda * Math.log2(lambda) - (1 - lambda) * Math.log2(1 - lambda);
    this.title.set({opacity: c.p(0)});
    this.title.setContent(ctx.localTime >= c.s(29) ? "Two certain components, one uncertain mixture" : ctx.localTime >= c.s(15) ? "Divergence gives the exact mixing gap" : "Scalar concavity proves entropy concavity");
    this.plot.forEach((line: Polyline): void => line.setOpacity(c.p(4) * scalar));
    this.curveLabel.set({opacity: c.p(4) * scalar});
    this.proof.forEach((line: ProofLine, i: number): void => line.label.set({opacity: c.p(line.sentence) * algebra * (i < 3 ? scalar : 1 - scalar)}));
    this.support.set({opacity: c.p(19) * algebra});
    this.support.setContent(ctx.localTime >= c.s(28) ? "\\text{Equality iff all positive-weight components coincide}" : "\\lambda_j>0:\\quad p_i\\ge\\lambda_jp_{ji}\\quad\\Rightarrow\\quad P_j\\ll P");
    const ps = [1, 0, 0, 1, lambda, 1 - lambda];
    this.bars.forEach((bar: MixBar, i: number): void => { const height = ps[i] * 250; Diagram.bar(bar.mesh, bar.x, 570, height, example); bar.value.setContent(ps[i].toFixed(2)); bar.value.set({y: 535 - height, opacity: example}); bar.label.set({opacity: example}); });
    this.groupLabels.forEach((label: FormulaHandle): void => label.set({opacity: example}));
    this.weight.set({opacity: example}); this.weight.setContent(`\\lambda=${lambda.toFixed(2)}`);
    this.gapBars.forEach((bar: PanelMesh, i: number): void => Diagram.bar(bar, i === 0 ? 400 : 1375, 785, i === 0 ? 2 : h * 70, c.p(32) * example));
    this.gapLabels.forEach((label: FormulaHandle, i: number): void => label.set({opacity: c.p(32) * example, y: i === 0 ? 710 : 680}));
    this.gapLabels[1].setContent(`H(P)=h_2(${(1 - lambda).toFixed(2)})=${h.toFixed(5)}`);
    this.result.set({opacity: c.p(34) * example});
  }

  teardown(_layers: SceneLayers): void { this.plot.length = 0; this.proof.length = 0; this.bars.length = 0; this.groupLabels.length = 0; this.gapBars.length = 0; this.gapLabels.length = 0; }
}

export function entropyConcavityScene(): Scene { return new EntropyConcavityScene(); }
