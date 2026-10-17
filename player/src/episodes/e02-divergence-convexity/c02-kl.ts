import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface DistributionBar { mesh: PanelMesh; value: FormulaHandle; label: FormulaHandle; x: number; }

export class DivergenceScene implements Scene {
  readonly id = "c02-kl";
  private title!: FormulaHandle;
  private definition!: FormulaHandle;
  private readonly bars: DistributionBar[] = [];
  private readonly costBars: PanelMesh[] = [];
  private readonly costs: FormulaHandle[] = [];
  private sum!: FormulaHandle;
  private note!: FormulaHandle;
  private readonly triangle: Polyline[] = [];
  private readonly simplexLabels: FormulaHandle[] = [];
  private barycenter!: PanelMesh;
  private binaryLine!: Polyline;
  private directedArrow!: Polyline;
  private readonly binaryLabels: FormulaHandle[] = [];
  private readonly binaryPoints: PanelMesh[] = [];
  private readonly binaryPointLabels: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A directed comparison of probability models", 960, 100, 47);
    this.definition = d.tex("D(P\\Vert Q)=\\sum_i p_i\\log_2\\frac{p_i}{q_i}", 960, 220, 46, Palette.yellow);
    const xs = [265, 445, 735, 915];
    for (let i = 0; i < 4; i++) this.bars.push({mesh: d.rectangle(xs[i], 630, 110, 1, i % 2 === 0 ? Palette.blue : Palette.purple), x: xs[i], value: d.text("", xs[i], 330, 36), label: d.tex(i % 2 === 0 ? `p_${Math.floor(i / 2) + 1}` : `q_${Math.floor(i / 2) + 1}`, xs[i], 675, 34, i % 2 === 0 ? Palette.blue : Palette.purple)});
    this.costBars.push(d.rectangle(1350, 385, 1, 35, Palette.green), d.rectangle(1350, 545, 1, 35, Palette.orange));
    this.costs.push(d.tex("", 1420, 330, 33), d.tex("", 1420, 490, 33));
    this.sum = d.tex("D(P\\Vert Q)\\approx0.278072", 1420, 710, 39, Palette.yellow);
    this.note = d.text("P supplies the averaging weights", 960, 810, 30, Palette.muted);
    this.directedArrow = d.line([[784, 705], [587.5, 705], [607.5, 693], [587.5, 705], [607.5, 717]], Palette.yellow, 4);
    this.binaryLine = d.line([[260, 725], [915, 725]], Palette.axis, 5);
    this.binaryLabels.push(d.tex("(0,1)", 260, 780, 30), d.tex("(1,0)", 915, 780, 30));
    this.binaryPoints.push(d.rectangle(784, 725, 17, 17, Palette.blue), d.rectangle(587.5, 725, 17, 17, Palette.purple));
    this.binaryPointLabels.push(d.tex("P", 784, 760, 34, Palette.blue), d.tex("Q", 587.5, 760, 34, Palette.purple));
    this.triangle.push(d.line([[250, 665], [900, 665], [575, 315], [250, 665]], Palette.axis, 5));
    this.simplexLabels.push(d.tex("(1,0,0)", 250, 715, 30), d.tex("(0,1,0)", 900, 715, 30), d.tex("(0,0,1)", 575, 265, 30));
    this.simplexLabels.push(d.tex("p=(0.2,0.3,0.5)", 600, 430, 33, Palette.yellow));
    this.simplexLabels.push(d.tex("p=0.2v_1+0.3v_2+0.5v_3", 580, 755, 30, Palette.yellow));
    this.barycenter = d.rectangle(607.5, 490, 18, 18, Palette.yellow);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const simplex = c.p(21) * (1 - c.p(33));
    const triangle = c.p(23) * (1 - c.p(30));
    const support = c.p(33, 4) * (1 - c.p(38));
    const reverse = c.p(17) * (1 - c.p(21));
    const paired = c.p(1) * (1 - simplex);
    const p = 0.8 - 0.3 * reverse;
    const q = (0.5 + 0.3 * reverse) * (1 - support);
    const probabilities = [p, q, 1 - p, 1 - q];
    this.title.set({opacity: c.p(0)});
    this.title.setContent(ctx.localTime >= c.s(33) && ctx.localTime < c.s(38) ? "When the model rules out a possible event" : ctx.localTime >= c.s(21) && ctx.localTime < c.s(30) ? "Probability vectors form a simplex" : "A directed comparison of probability models");
    this.definition.set({opacity: c.p(2)});
    this.definition.setContent(ctx.localTime >= c.s(26) && ctx.localTime < c.s(30) ? "D(\\operatorname{Ber}(0.1)\\Vert\\operatorname{Ber}(0.3))=0.167817>0.090056=D(0.1\\Vert0.2)+D(0.2\\Vert0.3)" : triangle > 0.5 ? "\\Delta_{n-1}=\\{p_i\\ge0:\\sum_i p_i=1\\}" : "D(P\\Vert Q)=\\sum_i p_i\\log_2\\frac{p_i}{q_i}");
    this.definition.set({scale: ctx.localTime >= c.s(26) && ctx.localTime < c.s(30) ? 0.7 : 1});
    this.directedArrow.setOpacity(c.p(32) * (1 - c.p(33)));
    this.bars.forEach((bar: DistributionBar, i: number): void => {
      const height = probabilities[i] * 300;
      Diagram.bar(bar.mesh, bar.x, 630, height, paired);
      bar.value.setContent(probabilities[i].toFixed(3));
      bar.value.set({y: 600 - height, opacity: paired});
      bar.label.set({opacity: paired});
    });
    const firstCost = q > 0 ? p * Math.log2(p / q) : Infinity;
    const secondCost = (1 - p) * Math.log2((1 - p) / (1 - q));
    const contributions = [firstCost, secondCost];
    this.costBars.forEach((bar: PanelMesh, i: number): void => {
      const width = Math.min(380, Math.abs(contributions[i]) * 500);
      bar.scale.x = width;
      bar.position.x = (1350 + Math.sign(contributions[i]) * width / 2 - 960) / 100;
      Diagram.show(bar, c.p(15) * (1 - simplex) * (1 - support));
      this.costs[i].setContent(`p_${i + 1}\\log_2(p_${i + 1}/q_${i + 1})=${Number.isFinite(contributions[i]) ? contributions[i].toFixed(6) : "\\infty"}`);
      this.costs[i].set({opacity: c.p(15) * (1 - simplex)});
    });
    this.sum.set({opacity: c.p(7), x: simplex > 0.5 ? 1410 : 1420, y: simplex > 0.5 ? 530 : 710});
    this.sum.setContent(ctx.localTime >= c.s(38) ? "D(P\\Vert Q)\\approx0.278072\\ \\text{bits}" : q === 0 ? "p_1>0,\\ q_1=0\\quad\\Rightarrow D=\\infty" : simplex > 0.5 ? triangle > 0.5 ? "n=3:\\quad\\dim\\Delta_2=2" : "n=2:\\quad\\dim\\Delta_1=1" : ctx.localTime >= c.s(13) ? `D(P\\Vert Q)\\approx${(firstCost + secondCost).toFixed(6)}\\ \\text{bits}` : ctx.localTime >= c.s(8) ? "p_i>0,q_i=0:\\quad D=\\infty" : "p_i=0:\\text{ contribution }0");
    this.note.set({opacity: c.p(4)});
    this.note.setContent(ctx.localTime >= c.s(38) ? "Individual contributions can be negative; the sum needs a proof" : ctx.localTime >= c.s(33) ? "Finite KL requires support(P) contained in support(Q)" : ctx.localTime >= c.s(26) && ctx.localTime < c.s(30) ? "KL is asymmetric and can fail the triangle inequality" : triangle > 0.5 ? "Vertices are deterministic distributions; mixtures fill the triangle" : "P supplies the averaging weights");
    this.binaryLine.setOpacity(simplex * (1 - triangle) + support);
    this.binaryLabels.forEach((label: FormulaHandle): void => label.set({opacity: simplex * (1 - triangle)}));
    this.binaryPoints.forEach((point: PanelMesh, i: number): void => {
      const x = 260 + 655 * (i === 0 ? 0.8 : 0.5 * (1 - support));
      point.position.x = (x - 960) / 100;
      Diagram.show(point, c.p(31) * ((1 - triangle) * simplex + support));
      this.binaryPointLabels[i].set({x, opacity: c.p(31) * ((1 - triangle) * simplex + support)});
    });
    this.triangle.forEach((line: Polyline): void => line.setOpacity(triangle));
    this.simplexLabels.forEach((label: FormulaHandle, i: number): void => label.set({opacity: triangle * c.p(i < 3 ? 23 : 25)}));
    Diagram.show(this.barycenter, triangle * c.p(25));
  }

  teardown(_layers: SceneLayers): void {
    this.bars.length = 0; this.costBars.length = 0; this.costs.length = 0; this.triangle.length = 0;
    this.simplexLabels.length = 0; this.binaryLabels.length = 0; this.binaryPoints.length = 0; this.binaryPointLabels.length = 0;
  }
}

export function divergenceScene(): Scene { return new DivergenceScene(); }
