import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram } from "../e01-entropy-information/lib/Diagram";

export class CovarianceEllipseScene implements Scene {
  readonly id = "c03-covariance";
  private title!: FormulaHandle;
  private readonly contours: Polyline[] = [];
  private readonly axes: Polyline[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Covariance eigenvalues set the ellipsoid's principal scales", 960, 100, 42);
    this.contours.push(
      d.line(this.ellipse(480, 410, 150, 75, Math.PI / 5), Palette.blue, 5),
      d.line(this.ellipse(1280, 410, 150, 75, 0), Palette.green, 5),
      d.line(this.ellipse(1280, 410, 150, 0, 0), Palette.orange, 5),
    );
    this.axes.push(
      d.line([[300,410],[660,410]], Palette.axis, 2), d.line([[480,255],[480,565]], Palette.axis, 2),
      d.line([[1100,410],[1460,410]], Palette.axis, 2), d.line([[1280,255],[1280,565]], Palette.axis, 2),
      d.line([[480,410],[480+150*Math.cos(Math.PI/5),410-150*Math.sin(Math.PI/5)]], Palette.yellow, 3),
      d.line([[480,410],[480-75*Math.sin(Math.PI/5),410-75*Math.cos(Math.PI/5)]], Palette.orange, 3),
      d.line([[1280,410],[1430,410]], Palette.yellow, 3), d.line([[1280,410],[1280,335]], Palette.orange, 3),
    );
    this.labels.push(
      d.text("original coordinates", 480, 225, 26, Palette.blue),
      d.text("orthogonal eigenvector coordinates", 1280, 225, 25, Palette.green),
      d.text("λ₁=4", 1490, 395, 23, Palette.yellow),
      d.text("λ₂=1", 1340, 300, 23, Palette.orange),
      d.text("equal Mahalanobis distance", 960, 595, 25, Palette.muted),
      d.text("λ₂ = 0: full-dimensional area collapses", 960, 660, 25, Palette.orange),
      d.text("illustrative ellipsoid contours", 960, 700, 21, Palette.muted),
    );
    this.equations.push(
      d.tex("K=\\mathbb E[(X-\\mu)(X-\\mu)^T]", 960, 740, 32, Palette.yellow),
      d.tex("Q^TKQ=\\operatorname{diag}(\\lambda_1,\\lambda_2)", 960, 790, 30, Palette.green),
      d.tex("\\operatorname{Vol}(\\text{ellipsoid})\\propto\\sqrt{\\det K}=\\prod_i\\sqrt{\\lambda_i}", 960, 835, 27, Palette.text),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const rotate = c.p(5);
    const collapse = c.p(23);
    const finish = c.p(31);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime>=c.s(22)&&ctx.localTime<c.s(23)?"What happens when the small eigenvalue reaches zero?":collapse > 0.5 ? "A zero eigenvalue removes a full-dimensional density" : rotate > 0.5 ? "Orthogonal eigenvectors expose the variance along each axis" : "Covariance eigenvalues set the ellipsoid's principal scales");
    this.contours[0].setOpacity(c.p(2) * (1 - rotate * 0.3));
    this.contours[1].setOpacity(rotate * (1 - collapse));
    this.contours[2].setOpacity(collapse);
    this.axes.forEach((line: Polyline, i: number): void => line.setOpacity(i < 2 ? c.p(2) : i < 4 ? rotate : i < 6 ? c.p(4) : i===7?rotate*(1-collapse):rotate));
    this.labels.forEach((label: FormulaHandle, i: number): void => {
      const visible = i < 1 ? c.p(2) : i < 4 ? rotate*(1-collapse) : i===4?rotate : i === 5 ? collapse : c.p(10);
      label.set({ opacity: visible });
    });
    this.equations[0].set({ opacity: c.p(2), x: 960, y: 740 });
    this.equations[1].set({ opacity: c.p(8), x: 960, y: 790 });
    this.equations[2].set({ opacity: c.p(13) + finish * 0.25, x: 960, y: 835 });
  }

  teardown(_layers: SceneLayers): void {
    this.contours.length = 0;
    this.axes.length = 0;
    this.labels.length = 0;
    this.equations.length = 0;
  }

  private ellipse(cx: number, cy: number, a: number, b: number, angle: number): ReadonlyArray<readonly [number, number]> {
    const points: Array<readonly [number, number]> = [];
    for (let i = 0; i <= 96; i++) {
      const t = 2 * Math.PI * i / 96;
      const x = a * Math.cos(t);
      const y = b * Math.sin(t);
      points.push([cx + x * Math.cos(angle) - y * Math.sin(angle), cy - x * Math.sin(angle) - y * Math.cos(angle)]);
    }
    return points;
  }
}

export function covarianceEllipseScene(): Scene {
  return new CovarianceEllipseScene();
}
