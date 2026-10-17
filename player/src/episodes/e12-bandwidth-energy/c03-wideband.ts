import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class WidebandLimitScene implements Scene {
  readonly id = "c03-wideband";
  private title!: FormulaHandle;
  private readonly axes: Polyline[] = [];
  private curve!: Polyline;
  private asymptote!: Polyline;
  private operatingPoint!: PanelMesh;
  private operatingValues!: FormulaHandle;
  private readonly labels: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("More bandwidth gives more uses but less power per use", 960, 100, 42);
    const plot = { left: 430, right: 1510, top: 300, bottom: 650 };
    const xAt = (u: number): number => plot.left + (plot.right - plot.left) * u / 6;
    const yAt = (v: number): number => plot.bottom - (plot.bottom - plot.top) * v / 1.6;
    this.axes.push(
      d.line([[plot.left, plot.bottom],[plot.right, plot.bottom]], Palette.axis, 3),
      d.line([[plot.left, plot.bottom],[plot.left, plot.top]], Palette.axis, 3),
    );
    const points: Array<readonly [number, number]> = [];
    for (let i = 1; i <= 120; i++) {
      const u = 0.025 + 5.975 * i / 120;
      points.push([xAt(u), yAt(u * Math.log2(1 + 1 / u))]);
    }
    this.curve = d.line(points, Palette.green, 5);
    this.operatingPoint = d.rectangle(xAt(.1), yAt(.1 * Math.log2(11)), 15, 15, Palette.yellow);
    this.operatingValues = d.tex("", 1230, 555, 26, Palette.yellow);
    this.asymptote = d.line([[plot.left, yAt(1 / Math.LN2)],[plot.right, yAt(1 / Math.LN2)]], Palette.orange, 2);
    this.labels.push(
      d.text("u=N₀W/P  (dimensionless)", 970, 700, 25, Palette.muted),
      d.text("C ÷ (P/N₀)  (dimensionless rate)", 430, 270, 23, Palette.blue),
      d.text("fixed P>0 and N₀", 1370, 245, 24, Palette.yellow),
      d.text("limit = 1/ln 2", 1390, 405, 24, Palette.orange),
      d.text("spectral efficiency C/W → 0", 960, 735, 25, Palette.purple),
      d.text("formula-evaluated normalized curve; not measured", 960, 215, 20, Palette.muted),
    );
    this.equations.push(
      d.tex("x=\\frac{P}{N_0W}=\\frac1u", 960, 775, 28, Palette.text),
      d.tex("C=W\\log_2(1+x)=\\frac{P}{N_0}\\frac{\\log_2(1+x)}x", 960, 810, 27, Palette.yellow),
      d.tex("\\log_2(1+x)=\\frac{x}{\\ln2}-\\frac{x^2}{2\\ln2}+O(x^3)", 960, 845, 25, Palette.green),
      d.tex("P=0\\;\\Longrightarrow\\;C(W,0)=0\\;\\text{for every }W", 1250, 570, 22, Palette.orange),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const increasing = c.p(0);
    const expansion = c.p(5);
    const edge = c.p(29);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime<c.s(1)?"Can unlimited bandwidth overcome a fixed power budget?":edge > 0.5 ? "Zero power stays at zero capacity" : expansion > 0.5 ? "The first logarithm term fixes the wideband limit" : "More bandwidth gives more uses but less power per use");
    this.axes.forEach((line: Polyline): void => line.setOpacity(increasing));
    this.curve.setOpacity(c.p(1) * increasing);
    const u = .1 + 5.9 * c.p(2, c.s(5) - c.s(2));
    const efficiency = Math.log2(1 + 1 / u);
    const rate = u * efficiency;
    const x = 430 + 1080 * u / 6;
    const y = 650 - 350 * rate / 1.6;
    this.operatingPoint.position.set((x - 960) / 100, (540 - y) / 100, .1);
    Diagram.show(this.operatingPoint, c.p(1));
    this.operatingValues.set({opacity:c.p(1)});
    this.operatingValues.setContent(`\\begin{gathered}u=${u.toFixed(2)}\\\\C/(P/N_0)=${rate.toFixed(4)}\\\\C/W=${efficiency.toFixed(4)}\\end{gathered}`);
    this.asymptote.setOpacity(c.p(7) * increasing);
    this.labels.forEach((label: FormulaHandle, i: number): void => {
      const visible = i < 3 ? increasing : i === 3 ? c.p(7) : i === 4 ? expansion : c.p(10);
      label.set({ opacity: visible });
    });
    this.equations[0].set({ opacity: c.p(3) * expansion, x: 960, y: 775 });
    this.equations[1].set({ opacity: c.p(5) * expansion, x: 960, y: 810 });
    this.equations[2].set({ opacity: c.p(6) * expansion, x: 960, y: 845 });
    this.equations[3].set({ opacity: edge, x: 790, y: 555 });
    if (ctx.localTime >= c.s(29)) this.labels[5].setContent("The normalized plot assumes P>0; P=0 is a separate case");
    else this.labels[5].setContent("formula-evaluated curve; finite W stays below limit");
  }

  teardown(_layers: SceneLayers): void {
    this.axes.length = 0;
    this.labels.length = 0;
    this.equations.length = 0;
  }
}

export function widebandLimitScene(): Scene {
  return new WidebandLimitScene();
}
