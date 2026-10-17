import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ChannelCell {
  readonly mesh: PanelMesh;
  readonly value: FormulaHandle;
}

export class AsymmetricChannelScene implements Scene {
  readonly id = "c05-asymmetric";
  private title!: FormulaHandle;
  private readonly cells: ChannelCell[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly formulas: FormulaHandle[] = [];
  private readonly axes: Polyline[] = [];
  private curve!: Polyline;
  private marker!: Polyline;
  private readonly plotLabels: FormulaHandle[] = [];
  private optimizer!:FormulaHandle;
  private curvature!:FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("The Z-channel capacity comes from optimizing its one input bias", 960, 100, 42);
    this.labels.push(
      d.text("Z channel", 400, 215, 31, Palette.blue),
      d.text("α=.3", 400, 255, 24, Palette.orange),
      d.text("y=0", 560, 270, 23, Palette.muted), d.text("y=1", 695, 270, 23, Palette.muted),
      d.text("x=0", 330, 345, 23, Palette.muted), d.text("x=1", 330, 445, 23, Palette.muted),
      d.text("q=P(X=1)", 450, 555, 27, Palette.orange),
    );
    const values = ["1", "0", ".3", ".7"];
    for (let i = 0; i < values.length; i++) {
      const x = 560 + (i % 2) * 135;
      const y = 345 + Math.floor(i / 2) * 100;
      this.cells.push({ mesh: d.rectangle(x, y, 105, 72, i === 1 ? "#301d2a" : Palette.panel), value: d.text(values[i], x, y, 31, Palette.text) });
    }
    this.formulas.push(
      d.tex("P(Y=1)=.7q", 470, 620, 33, Palette.yellow),
      d.tex("I(q)=h_2(.7q)-q h_2(.3)", 470, 680, 33, Palette.green),
      d.tex("I'(q)=.7\\log_2\\frac{1-.7q}{.7q}-h_2(.3)", 470, 740, 29, Palette.text),
      d.tex("q^*=.4210006,\\qquad C=.5036919\\;\\text{bits/use}", 470, 800, 28, Palette.yellow),
    );
    this.optimizer=d.tex("q^*=\\frac1{.7(1+2^{h_2(.3)/.7})}",1350,250,34,Palette.yellow);
    this.curvature=d.tex("I''(q)=-\\frac{.7^2}{\\ln2\\,r(1-r)}<0,\\quad r=.7q",1350,815,30,Palette.green);
    const plot = { left: 1000, right: 1700, top: 350, bottom: 700 };
    const xAt = (q: number): number => plot.left + (plot.right - plot.left) * q;
    const yAt = (v: number): number => plot.bottom - (plot.bottom - plot.top) * v / 0.6;
    this.axes.push(
      d.line([[plot.left, plot.bottom], [plot.right, plot.bottom]], Palette.axis, 3),
      d.line([[plot.left, plot.bottom], [plot.left, plot.top]], Palette.axis, 3),
    );
    const points: Array<readonly [number, number]> = [];
    for (let i = 0; i <= 100; i++) {
      const q = i / 100;
      points.push([xAt(q), yAt(this.mutualInformation(q))]);
    }
    this.curve = d.line(points, Palette.green, 5);
    this.marker = d.line([[xAt(0.4210006), plot.top], [xAt(0.4210006), plot.bottom]], Palette.yellow, 2);
    this.plotLabels.push(
      d.text("q=P(X=1)", 1350, 740, 25, Palette.muted),
      d.text("bits/use", 950, 300, 22, Palette.muted),
      d.text("0", plot.left, 720, 21, Palette.muted), d.text("1", plot.right, 720, 21, Palette.muted),
      d.text("I(X;Y)", 1110, 390, 25, Palette.green),
      d.text("maximum at q*=.4210006", 1390, 300, 24, Palette.yellow),
      d.text("I(0)=I(1)=0", 1380, 675, 24, Palette.muted),
      d.text("vertical scale: mutual information", 1350, 780, 20, Palette.muted),
      d.text("0", 980, plot.bottom, 19, Palette.muted), d.text(".2", 980, yAt(0.2), 19, Palette.muted),
      d.text(".4", 980, yAt(0.4), 19, Palette.muted), d.text(".6", 980, yAt(0.6), 19, Palette.muted),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const channel = c.p(0);
    const curve = c.p(10);
    const optimum = c.p(21);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime<c.s(10)?"Will a fair input still maximize this channel?":optimum > 0.5 ? "The derivative locates the best input probability" : curve > 0.5 ? "The input bias traces a strictly concave information curve" : "The Z-channel capacity comes from optimizing its one input bias");
    this.labels.forEach((label: FormulaHandle): void => label.set({ opacity: channel, y: label.current.y }));
    this.cells.forEach((entry: ChannelCell): void => { Diagram.show(entry.mesh, channel); entry.value.set({ opacity: channel }); });
    this.formulas[0].set({ opacity: c.p(5) * channel, x: 470, y: 620 });
    this.formulas[1].set({ opacity: c.p(9), x: 470, y: 680 });
    this.formulas[2].set({ opacity: c.p(14) * curve, x: 470, y: 740 });
    this.formulas[3].set({ opacity: optimum, x: 470, y: 800 });
    this.axes.forEach((line: Polyline): void => line.setOpacity(curve));
    this.curve.setOpacity(curve);
    this.marker.setOpacity(optimum);
    this.optimizer.set({opacity:c.p(18)});this.curvature.set({opacity:c.p(19)});
    this.plotLabels.forEach((label: FormulaHandle, i: number): void => label.set({ opacity: i===7?0:curve * (i === 5 ? optimum : 1) }));
  }

  teardown(_layers: SceneLayers): void {
    this.cells.length = 0;
    this.labels.length = 0;
    this.formulas.length = 0;
    this.axes.length = 0;
    this.plotLabels.length = 0;
  }

  private binaryEntropy(p: number): number {
    if (p <= 0 || p >= 1) return 0;
    return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  }

  private mutualInformation(q: number): number {
    return this.binaryEntropy(0.7 * q) - q * this.binaryEntropy(0.3);
  }
}

export function asymmetricChannelScene(): Scene {
  return new AsymmetricChannelScene();
}
