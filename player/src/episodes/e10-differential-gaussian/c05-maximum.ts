import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class EstimationEntropyScene implements Scene {
  readonly id = "c05-maximum";
  private title!: FormulaHandle;
  private readonly curves: Polyline[] = [];
  private readonly arrows: Polyline[] = [];
  private readonly panels: PanelMesh[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Gaussian entropy bounds estimation error through conditional uncertainty", 960, 100, 41);
    this.panels.push(d.rectangle(960, 410, 1600, 420, "#131b2b"));
    this.panels.forEach((panel: PanelMesh): void => { panel.position.z = -0.1; });
    this.curves.push(
      d.line(this.bell(430, 375, 155, 95), Palette.blue, 4),
      d.line(this.bell(800, 375, 155, 95), Palette.orange, 4),
      d.line(this.bell(1340, 375, 155, 95), Palette.green, 4),
    );
    this.arrows.push(
      d.line([[520,380],[690,380],[670,363],[690,380],[670,397]], Palette.yellow, 4),
      d.line([[900,380],[1110,380],[1090,363],[1110,380],[1090,397]], Palette.axis, 3),
    );
    this.labels.push(
      d.text("X given observed Y=y", 430, 245, 25, Palette.blue),
      d.text("E=X−g(y): a translation", 800, 245, 25, Palette.orange),
      d.text("same conditional entropy", 610, 485, 24, Palette.yellow),
      d.text("g depends on Y only", 790, 535, 24, Palette.green),
      d.text("illustrative densities; no measurement", 1330, 500, 21, Palette.muted),
      d.text("exact Gaussian equality example", 960, 755, 25, Palette.green),
    );
    this.equations.push(
      d.tex("E=X-g(Y),\\qquad h(X\\mid Y)=h(E\\mid Y)", 960, 585, 30, Palette.yellow),
      d.tex("h(E\\mid Y)\\le h(E)\\le\\frac12\\log_2(2\\pi e\\,\\mathrm{Var}(E))", 960, 635, 27, Palette.text),
      d.tex("\\mathrm{Var}(E)\\le\\mathbb E[E^2]=\\mathrm{MSE}", 960, 680, 27, Palette.text),
      d.tex("\\mathrm{MSE}\\ge\\frac{2^{2h(X\\mid Y)}}{2\\pi e}", 960, 725, 31, Palette.green),
      d.tex("Y\\sim N(0,1),\\;E\\sim N(0,1/4),\\;E\\perp Y,\\;X=Y+E", 960, 790, 25, Palette.yellow),
      d.tex("g(Y)=Y,\\quad h(X\\mid Y)=\\frac12\\log_2(2\\pi e/4),\\quad\\mathrm{MSE}=1/4", 960, 835, 23, Palette.green),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const translation = c.during(0, 17);
    const bound = c.p(7);
    const example = c.p(22);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(example > 0.5 ? ctx.localTime<c.s(29)?"Can this observation model attain every bound in the chain?":"The bound is tight for a jointly Gaussian observation model" : bound > 0.5 ? "Each entropy relaxation yields a mean-square error bound" : "An estimator may use the observation, not the hidden value");
    this.panels.forEach((panel: PanelMesh): void => Diagram.show(panel, translation + bound));
    this.curves.forEach((line: Polyline, i: number): void => line.setOpacity(c.p(i === 0 ? 5 : i === 1 ? 7 : 22) * (i === 2 ? example : translation)));
    this.arrows.forEach((line: Polyline, i: number): void => line.setOpacity(i===0?c.p(5)*translation:0));
    this.labels.forEach((label: FormulaHandle, i: number): void => {
      const visible = i < 4 ? translation : i === 4 ? example : example;
      label.set({ opacity: visible });
    });
    this.equations[0].set({ opacity: c.p(7) * bound, x: 960, y: 565 });
    this.equations[1].set({ opacity: c.p(9) * bound, x: 960, y: 610 });
    this.equations[2].set({ opacity: c.p(12) * bound, x: 960, y: 655 });
    this.equations[3].set({ opacity: c.p(16) * bound, x: 960, y: 705 });
    this.equations[4].set({ opacity: c.p(23), x: 960, y: 790 });
    this.equations[5].set({ opacity: c.p(27), x: 960, y: 835 });
    this.labels[3].set({opacity:c.p(1)});
    this.labels[3].setContent(ctx.localTime >= c.s(22)?"Example: g(Y)=Y and zero-mean error is independent of Y":ctx.localTime >= c.s(21)
      ? "The unconditional h(X) bound uses a constant estimate"
      : ctx.localTime >= c.s(18) ? "No independent-noise assumption is needed" : "g depends on Y only");
  }

  teardown(_layers: SceneLayers): void {
    this.curves.length = 0;
    this.arrows.length = 0;
    this.panels.length = 0;
    this.labels.length = 0;
    this.equations.length = 0;
  }

  private bell(cx: number, baseline: number, width: number, height: number): ReadonlyArray<readonly [number, number]> {
    const points: Array<readonly [number, number]> = [];
    for (let i = 0; i <= 80; i++) {
      const z = -3 + 6 * i / 80;
      points.push([cx + z * width / 3, baseline - height * Math.exp(-z * z / 2)]);
    }
    return points;
  }
}

export function estimationEntropyScene(): Scene {
  return new EstimationEntropyScene();
}
