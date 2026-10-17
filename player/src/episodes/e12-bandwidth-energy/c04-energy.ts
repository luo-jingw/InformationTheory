import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram } from "../e01-entropy-information/lib/Diagram";

export class EnergyEfficiencyScene implements Scene {
  readonly id = "c04-energy";
  private title!: FormulaHandle;
  private readonly axes: Polyline[] = [];
  private curve!: Polyline;
  private limit!: Polyline;
  private readonly labels: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Energy per bit rises as spectral efficiency increases", 960, 100, 42);
    const plot = { left: 460, right: 1530, top: 280, bottom: 620 };
    const etaAt = (eta: number): number => plot.bottom - (plot.bottom - plot.top) * eta / 8;
    const dbAt = (db: number): number => plot.left + (plot.right - plot.left) * (db + 2) / 18;
    this.axes.push(
      d.line([[plot.left,plot.bottom],[plot.right,plot.bottom]], Palette.axis, 3),
      d.line([[plot.left,plot.bottom],[plot.left,plot.top]], Palette.axis, 3),
    );
    const values: Array<readonly [number, number]> = [];
    for (let i = 1; i <= 160; i++) {
      const eta = 8 * i / 160;
      const ratio = Math.expm1(eta * Math.LN2) / eta;
      values.push([dbAt(10 * Math.log10(ratio)), etaAt(eta)]);
    }
    this.curve = d.line(values, Palette.green, 5);
    this.limit = d.line([[dbAt(10*Math.log10(Math.LN2)),plot.bottom],[dbAt(10*Math.log10(Math.LN2)),plot.top]], Palette.orange, 2);
    this.labels.push(
      d.text("E_b/N₀  (dB)", 990, 675, 25, Palette.muted),
      d.text("η=R/W  (bits/s/Hz)", 460, 250, 23, Palette.blue),
      d.text("wideband limit: ln 2", 770, 340, 24, Palette.orange),
      d.text("−1.591745 dB", 770, 375, 24, Palette.yellow),
      d.text("finite η > 0 requires strictly more energy", 1170, 555, 23, Palette.green),
      d.text("formula-derived Shannon frontier; R>0; not measured", 960, 200, 20, Palette.muted),
      d.text("0", dbAt(0), 645, 18, Palette.muted),
      d.text("5", dbAt(5), 645, 18, Palette.muted),
      d.text("10", dbAt(10), 645, 18, Palette.muted),
      d.text("−1.59", dbAt(-1.591745), 645, 18, Palette.orange),
      d.text("0", 430, etaAt(0), 18, Palette.muted),
      d.text("2", 430, etaAt(2), 18, Palette.muted),
      d.text("4", 430, etaAt(4), 18, Palette.muted),
      d.text("8", 430, etaAt(8), 18, Palette.muted),
    );
    this.equations.push(
      d.tex("E_b=P/R,\\qquad\\eta=R/W,\\qquad R\\le C", 960, 715, 29, Palette.yellow),
      d.tex("\\frac{P}{N_0W}\\ge2^\\eta-1", 960, 755, 31, Palette.text),
      d.tex("\\frac{E_b}{N_0}=\\frac{P}{N_0R}\\ge\\frac{2^\\eta-1}{\\eta}", 960, 800, 29, Palette.green),
      d.tex("\\lim_{\\eta\\downarrow0}\\frac{2^\\eta-1}{\\eta}=\\ln2\\approx0.693147", 960, 840, 22, Palette.yellow),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const definitions = c.p(0);
    const frontier = c.p(5);
    const limit = c.p(15);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime>=c.s(14)&&ctx.localTime<c.s(15)?"Can energy per bit vanish with spectral efficiency?":limit > 0.5 ? "Vanishing spectral efficiency approaches the minimum energy" : frontier > 0.5 ? "The energy frontier uses an actual operating rate" : "Energy per bit is defined using an actual positive rate");
    this.axes.forEach((line: Polyline): void => line.setOpacity(frontier));
    this.curve.setOpacity(c.p(8) * frontier);
    this.limit.setOpacity(limit * frontier);
    this.labels.forEach((label: FormulaHandle, i: number): void => {
      const visible = i < 2 ? Math.max(definitions, frontier) : i < 4 ? limit : frontier;
      label.set({ opacity: visible });
    });
    this.equations[0].set({ opacity: c.p(5) * definitions, x: 960, y: 715 });
    this.equations[1].set({ opacity: c.p(8) * frontier, x: 960, y: 755 });
    this.equations[2].set({ opacity: c.p(10) * frontier, x: 960, y: 800 });
    this.equations[3].set({ opacity: c.p(15) * limit, x: 960, y: 840 });
  }

  teardown(_layers: SceneLayers): void {
    this.axes.length = 0;
    this.labels.length = 0;
    this.equations.length = 0;
  }
}

export function energyEfficiencyScene(): Scene {
  return new EnergyEfficiencyScene();
}
