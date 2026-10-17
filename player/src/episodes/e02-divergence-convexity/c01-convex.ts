import type { ChapterTiming, Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

import { BitBillExperiment } from "./lib/BitBillExperiment";

interface DisplayEquation { label: FormulaHandle; y: number; }

export class ConvexityScene implements Scene {
  readonly id = "c01-convex";
  private title!: FormulaHandle;
  private bill!: BitBillExperiment;
  private legacyTiming!: ChapterTiming;
  private curve!: Polyline;
  private chord!: Polyline;
  private mixtureHull!: Polyline;
  private concaveCurve!: Polyline;
  private concaveChord!: Polyline;
  private concaveAxes!: Polyline;
  private tangent!: Polyline;
  private readonly axes: Polyline[] = [];
  private readonly points: PanelMesh[] = [];
  private readonly equations: DisplayEquation[] = [];
  private graphPoint!: PanelMesh;
  private chordPoint!: PanelMesh;
  private gap!: PanelMesh;
  private readout!: FormulaHandle;
  private isolatedLabel!: FormulaHandle;
  private readonly isolatedPoints: PanelMesh[] = [];
  private missingSegment!: Polyline;
  private meanLabel!: FormulaHandle;

  setup(layers: SceneLayers, timing: ChapterTiming): void {
    const d = new Diagram(layers);
    this.bill = new BitBillExperiment(d);
    this.legacyTiming = { duration: timing.duration, sentenceStarts: timing.sentenceStarts.slice(8), sentenceEnds: timing.sentenceEnds.slice(8) };
    this.title = d.text("A curve, a chord, and an average", 960, 100, 47);
    this.axes.push(d.line([[200, 230], [200, 700], [930, 700]], Palette.axis));
    this.axes.push(d.line([[550, 700], [550, 240]], Palette.grid, 2));
    this.curve = d.line(Array.from({length: 161}, (_: unknown, i: number): readonly [number, number] => {
      const x = -2 + i / 40;
      return [550 + x * 160, 700 - x * x * 100];
    }), Palette.blue, 5);
    this.concaveCurve = d.line(Array.from({length: 161}, (_: unknown, i: number): readonly [number, number] => {
      const x = -2 + i / 40;
      return [550 + x * 160, 300 + x * x * 100];
    }), Palette.purple, 5);
    this.concaveAxes = d.line([[200, 230], [200, 710], [200, 300], [930, 300]], Palette.axis);
    this.concaveChord = d.line([[310, 525], [790, 525]], Palette.orange, 5);
    this.chord = d.line([[310, 475], [790, 475]], Palette.orange, 5);
    this.mixtureHull = d.line([[310, 475], [582, 696], [790, 475], [310, 475]], Palette.orange, 3);
    this.tangent = d.line([[230, 806.25], [870, 606.25]], Palette.green, 4);
    for (const [x, y] of [[310, 475], [790, 475], [582, 696]] as const) this.points.push(d.rectangle(x, y, 15, 15, Palette.blue));
    this.graphPoint = d.rectangle(550, 700, 18, 18, Palette.yellow);
    this.chordPoint = d.rectangle(550, 475, 18, 18, Palette.orange);
    this.gap = d.rectangle(550, 700, 4, 1, Palette.yellow);
    this.readout = d.tex("f(x)=x^2", 550, 225, 35, Palette.blue);
    this.meanLabel = d.tex("\\mu=\\lambda x+(1-\\lambda)y", 550, 765, 31, Palette.yellow);
    this.isolatedPoints.push(d.rectangle(320, 450, 23, 23, Palette.blue), d.rectangle(800, 450, 23, 23, Palette.blue));
    this.missingSegment = d.line([[335, 450], [785, 450]], Palette.red, 4);
    this.isolatedLabel = d.text("The open segment is missing from this set", 550, 570, 30, Palette.red);
    for (const y of [270, 420, 570, 745]) this.equations.push({ label: d.tex("", 1410, y, 35, Palette.text), y });
  }

  draw(ctx: SceneContext): void {
    this.bill.draw(ctx);
    const c = new Cues(this.legacyTiming, ctx.localTime);
    const isolated = c.p(11) * (1 - c.p(18));
    const concave = c.p(9) * (1 - c.p(11)) + c.p(19) * (1 - c.p(20));
    const plot = 1 - isolated;
    this.title.set({opacity: c.p(0)});
    this.title.setContent(ctx.localTime >= c.s(47) ? "A local minimum of a convex function is global" : ctx.localTime >= c.s(36) ? "The supporting tangent" : ctx.localTime >= c.s(27) ? "Jensen: combine more than two points" : ctx.localTime >= c.s(11) && ctx.localTime < c.s(18) ? "A nonconvex set is missing a segment" : "A curve, a chord, and an average");
    this.axes.forEach((axis: Polyline): void => axis.setOpacity(c.p(2) * plot * (1 - concave)));
    this.curve.setOpacity(c.p(6) * plot * (1 - concave));
    this.concaveCurve.setOpacity(concave);
    this.concaveAxes.setOpacity(concave);
    this.concaveChord.setOpacity(concave);
    this.chord.setOpacity(c.p(6) * (1 - c.p(27)) * plot * (1 - concave));
    this.mixtureHull.setOpacity(c.p(27) * (1 - c.p(36)));
    this.tangent.setOpacity(c.p(37) * (1 - c.p(47)) * plot);
    this.isolatedPoints.forEach((point: PanelMesh): void => Diagram.show(point, isolated));
    this.missingSegment.setOpacity(isolated * 0.7);
    this.isolatedLabel.set({opacity: isolated});
    const three = c.p(27);
    const lambda = 0.5 - 0.25 * c.p(22) + 0.5 * c.over(25);
    const local = c.p(47);
    const mean = ((1.5 - 3 * lambda) * (1 - three) + 0.25 * three) * (1 - local);
    const expected = 2.25 * (1 - three) + 1.145 * three;
    const px = 550 + mean * 160;
    const graphY = (700 - 100 * mean * mean) * (1 - concave) + (300 + 100 * mean * mean) * concave;
    const chordY = (700 - 100 * expected) * (1 - concave) + (300 + 100 * expected) * concave;
    this.points.forEach((point: PanelMesh, i: number): void => Diagram.show(point, c.p(i < 2 ? 6 : 27) * plot * (1 - c.p(47)) * (1 - concave)));
    this.graphPoint.position.set((px - 960) / 100, (540 - graphY) / 100, 0.1);
    this.chordPoint.position.set((px - 960) / 100, (540 - chordY) / 100, 0.1);
    Diagram.show(this.graphPoint, c.p(6) * plot);
    Diagram.show(this.chordPoint, c.p(6) * (1 - c.p(36)) * plot);
    const gapHeight = Math.abs(graphY - chordY);
    this.gap.scale.y = Math.max(0.001, gapHeight);
    this.gap.position.set((px - 960) / 100, (540 - (graphY + chordY) / 2) / 100, 0.05);
    Diagram.show(this.gap, c.p(7) * (1 - c.p(36)) * plot * 0.65);
    this.readout.set({opacity: c.p(6) * plot});
    this.readout.setContent(local > 0.5 ? "f(x)=x^2,\\quad x_*=0,\\quad f(x_*)=0" : concave > 0.5 ? "g(x)=-x^2,\\quad g(\\mu)\\ge\\lambda g(x)+(1-\\lambda)g(y)" : ctx.localTime >= c.s(27) ? "f(\\mathbb E[X])=0.0625\\le1.145=\\mathbb E[f(X)]" : `\\lambda=${lambda.toFixed(2)},\\quad f(\\mu)=${(mean * mean).toFixed(3)}\\le2.25`);
    this.readout.set({scale: three > 0.5 ? 0.78 : 1});
    this.meanLabel.set({opacity: c.p(7) * plot});
    this.meanLabel.setContent(local > 0.5 ? "x_*\\text{ is the global minimum of this example}" : ctx.localTime >= c.s(36) ? "a=\\mathbb E[X]=0.25" : ctx.localTime >= c.s(27) ? "w=(0.2,0.5,0.3),\\quad x=(-1.5,0.2,1.5)" : "\\mu=\\lambda x+(1-\\lambda)y");
    this.meanLabel.set({scale: three > 0.5 ? 0.85 : 1});
    const lines = this.equationsAt(c, ctx.localTime);
    this.equations.forEach((equation: DisplayEquation, i: number): void => {
      equation.label.setContent(lines[i]);
      equation.label.set({opacity: c.p(3), color: i === 3 ? Palette.yellow : Palette.text, y: equation.y, scale: i === 0 ? 0.9 : 1});
    });
  }

  teardown(_layers: SceneLayers): void {
    this.axes.length = 0; this.points.length = 0; this.equations.length = 0; this.isolatedPoints.length = 0;
  }

  private equationsAt(c: Cues, time: number): readonly string[] {
    if (time >= c.s(47)) return ["x_*\\text{ local minimum},\\quad f(y)<f(x_*)?", "z=(1-t)x_*+ty,\\quad0<t\\ll1", "f(z)\\le(1-t)f(x_*)+tf(y)<f(x_*)", "\\text{Contradiction: }x_*\\text{ is global}"];
    if (time >= c.s(41)) return ["f\\in C^2,\\quad\\text{open convex domain}", "f\\text{ convex}\\iff\\nabla^2 f\\succeq0", "\\text{One dimension: }f''(x)\\ge0", "\\text{Finite convex }f:\\text{ continuous inside}"];
    if (time >= c.s(36)) return ["f(x)\\ge f(a)+f'(a)(x-a)", "a=\\mathbb E[X]\\quad\\text{at a differentiable interior point}", "\\mathbb E[X-a]=0", "f(\\mathbb E[X])\\le\\mathbb E[f(X)]"];
    if (time >= c.s(27)) return ["\\lambda_i\\ge0,\\quad\\sum_i\\lambda_i=1", "\\mu=\\sum_i\\lambda_i x_i", "f(\\mu)\\le\\sum_i\\lambda_i f(x_i)", "f(\\mathbb E[X])\\le\\mathbb E[f(X)]"];
    if (time >= c.s(11) && time < c.s(18)) return ["S=\\{a,b\\},\\quad a\\ne b", "(a+b)/2\\notin S", "\\text{Nonconvex set}", "\\text{Convex / concave describe function shape}"];
    if ((time >= c.s(9) && time < c.s(11)) || (time >= c.s(19) && time < c.s(20))) return ["g=-f\\text{ is concave}", "g(\\lambda x+(1-\\lambda)y)", "\\ge\\lambda g(x)+(1-\\lambda)g(y)", "\\text{A reversed chord inequality}"];
    return ["0\\le\\lambda\\le1,\\quad x,y\\in C", "\\lambda x+(1-\\lambda)y\\in C", "f(\\lambda x+(1-\\lambda)y)", "\\le\\lambda f(x)+(1-\\lambda)f(y)"];
  }
}

export function convexityScene(): Scene { return new ConvexityScene(); }
