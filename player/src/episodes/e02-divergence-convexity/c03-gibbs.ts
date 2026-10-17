import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class GibbsScene implements Scene {
  readonly id = "c03-gibbs";
  private title!: FormulaHandle;
  private readonly plot: Polyline[] = [];
  private marker!: PanelMesh;
  private plotLabel!: FormulaHandle;
  private readonly proof: ProofLine[] = [];
  private readonly cells: PanelMesh[] = [];
  private readonly cellValues: FormulaHandle[] = [];
  private readonly gridLabels: FormulaHandle[] = [];
  private readonly information: ProofLine[] = [];
  private readonly entropyBars: PanelMesh[] = [];
  private readonly entropyLabels: FormulaHandle[] = [];
  private readonly consequences: ProofLine[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A logarithm inequality proves nonnegative divergence", 960, 100, 45);
    this.plot.push(d.line([[160, 650], [790, 650]], Palette.axis), d.line([[160, 680], [160, 230]], Palette.axis));
    this.plot.push(d.line(Array.from({length: 150}, (_: unknown, i: number): readonly [number, number] => {
      const t = 0.08 + i * 0.02;
      return [160 + t * 200, 650 - (t - 1 - Math.log(t)) * 160];
    }), Palette.blue, 5));
    this.marker = d.rectangle(360, 650, 18, 18, Palette.yellow);
    this.plotLabel = d.tex("g(t)=t-1-\\ln t\\ge0,\\quad g(1)=0", 480, 740, 34, Palette.yellow);
    const proof: ReadonlyArray<readonly [string, number]> = [
      ["g'(t)=1-1/t:\\quad -\\;|_{t=1}\\;+", 1],
      ["-\\ln(q_i/p_i)\\ge1-q_i/p_i", 6],
      ["p_i\\ln(p_i/q_i)\\ge p_i-q_i", 8],
      ["S=\\{i:p_i>0\\},\\quad r=\\sum_{i\\notin S}q_i", 13],
      ["\\sum_{i\\in S}p_i\\ln(p_i/q_i)\\ge1-(1-r)=r\\ge0", 15],
      ["D_2(P\\Vert Q)\\ge r/\\ln2\\ge0", 17],
    ];
    for (let i = 0; i < proof.length; i++) this.proof.push({label: d.tex(proof[i][0], 1320, 250 + i * 100, i === 4 ? 30 : 34, i === 5 ? Palette.yellow : Palette.text), sentence: proof[i][1]});
    for (let group = 0; group < 2; group++) {
      const center = group === 0 ? 430 : 1090;
      this.gridLabels.push(d.tex(group === 0 ? "P_{XY}" : "P_XP_Y", center, 245, 40, group === 0 ? Palette.blue : Palette.purple));
      for (let i = 0; i < 4; i++) {
        const x = center + (i % 2 === 0 ? -95 : 95);
        const y = i < 2 ? 365 : 510;
        this.cells.push(d.rectangle(x, y, 175, 125, group === 0 ? "#203952" : "#3e304b"));
        this.cellValues.push(d.text((group === 0 ? [0.3, 0.2, 0.1, 0.4] : [0.2, 0.3, 0.2, 0.3])[i].toFixed(2), x, y, 38));
      }
    }
    const information: ReadonlyArray<readonly [string, number, number]> = [
      ["D(P_{XY}\\Vert P_XP_Y)=H(X)+H(Y)-H(X,Y)", 26, 660],
      ["=I(X;Y)\\ge0,\\quad =0\\iff P_{XY}=P_XP_Y", 29, 755],
      ["I(X;Y\\mid Z)=\\sum_{z:p_Z(z)>0}p_Z(z)D(P_{XY|z}\\Vert P_{X|z}P_{Y|z})\\ge0", 31, 400],
    ];
    for (const [tex, sentence, y] of information) this.information.push({label: d.tex(tex, 960, y, sentence === 31 ? 35 : 39, Palette.yellow), sentence});
    this.entropyBars.push(d.rectangle(360, 570, 130, 1, Palette.blue), d.rectangle(650, 570, 130, 1, Palette.green));
    this.entropyLabels.push(d.tex("H(P)=0.7219", 360, 665, 32, Palette.blue), d.tex("H(U)=1", 650, 665, 32, Palette.green), d.tex("D(P\\Vert U)=\\log_2k-H(P)", 505, 275, 34, Palette.yellow));
    const consequences: ReadonlyArray<readonly [string, number]> = [
      ["0\\le H(X)\\le\\log_2k", 40],
      ["H(X)=\\log_2k\\iff P_X=U", 41],
      ["H(X)=0\\iff\\text{one outcome has probability }1", 44],
      ["0\\le I(X;Y)\\le\\min\\{H(X),H(Y)\\}", 47],
      ["I(X;X)=H(X)", 51],
    ];
    for (let i = 0; i < consequences.length; i++) this.consequences.push({label: d.tex(consequences[i][0], 1340, 285 + i * 110, i === 2 ? 30 : 36, i === 3 ? Palette.yellow : Palette.text), sentence: consequences[i][1]});
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const proof = 1 - c.p(25);
    const joint = c.p(25) * (1 - c.p(31));
    const conditional = c.p(31) * (1 - c.p(35));
    const bounds = c.p(35);
    this.title.set({opacity: c.p(0)});
    this.title.setContent(ctx.localTime >= c.s(35) ? "Entropy and information bounds" : ctx.localTime >= c.s(31) ? "Conditional information averages nonnegative divergences" : ctx.localTime >= c.s(25) ? "Mutual information is a divergence" : ctx.localTime >= c.s(20) ? "Equality forces the distributions to match" : "A logarithm inequality proves nonnegative divergence");
    this.plot.forEach((line: Polyline): void => line.setOpacity(c.p(0) * proof));
    Diagram.show(this.marker, c.p(2) * proof);
    this.plotLabel.set({opacity: c.p(2) * proof});
    this.plotLabel.setContent(ctx.localTime >= c.s(20) ? "D(P\\Vert Q)=0\\iff r=0,\\ q_i=p_i\\ (i\\in S)" : "g(t)=t-1-\\ln t\\ge0,\\quad g(1)=0");
    this.plotLabel.set({scale: ctx.localTime >= c.s(20) ? 0.82 : 1});
    this.proof.forEach((line: ProofLine): void => line.label.set({opacity: c.p(line.sentence) * proof}));
    this.cells.forEach((cell: PanelMesh, i: number): void => { Diagram.show(cell, joint); this.cellValues[i].set({opacity: joint}); });
    this.gridLabels.forEach((label: FormulaHandle): void => label.set({opacity: joint}));
    this.information.forEach((line: ProofLine, i: number): void => line.label.set({opacity: c.p(line.sentence) * (i < 2 ? joint : conditional)}));
    this.entropyBars.forEach((bar: PanelMesh, i: number): void => Diagram.bar(bar, i === 0 ? 360 : 650, 570, (i === 0 ? 0.721928 : 1) * 230, bounds));
    this.entropyLabels.forEach((label: FormulaHandle): void => label.set({opacity: bounds}));
    this.consequences.forEach((line: ProofLine): void => line.label.set({opacity: c.p(line.sentence) * bounds}));
  }

  teardown(_layers: SceneLayers): void {
    this.plot.length = 0; this.proof.length = 0; this.cells.length = 0; this.cellValues.length = 0;
    this.gridLabels.length = 0; this.information.length = 0; this.entropyBars.length = 0; this.entropyLabels.length = 0; this.consequences.length = 0;
  }
}

export function gibbsScene(): Scene { return new GibbsScene(); }
