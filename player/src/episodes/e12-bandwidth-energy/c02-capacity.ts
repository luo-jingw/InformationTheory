import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class ContinuousAwgnCapacityScene implements Scene {
  readonly id = "c02-capacity";
  private title!: FormulaHandle;
  private readonly band: PanelMesh[] = [];
  private readonly coefficients: PanelMesh[] = [];
  private readonly axes: Polyline[] = [];
  private readonly noiseSpectrum: Polyline[] = [];
  private readonly arrows: Polyline[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Two real uses per second-hertz convert AWGN capacity to bits per second", 960, 100, 40);
    this.axes.push(d.line([[430,400],[1490,400]], Palette.axis, 3), d.line([[960,400],[960,220]], Palette.axis, 3));
    this.band.push(d.rectangle(960, 320, 900, 70, "#25354d"));
    this.noiseSpectrum.push(
      d.line([[510,280],[510,340]], Palette.purple, 5), d.line([[960,280],[960,340]], Palette.purple, 5), d.line([[1410,280],[1410,340]], Palette.purple, 5),
      d.line([[510,280],[1410,280]], Palette.purple, 2),
    );
    for (let i = 0; i < 6; i++) this.coefficients.push(d.rectangle(610 + i * 140, 480, 48, 48, i % 2 === 0 ? "#31435f" : "#263955"));
    this.arrows.push(
      d.line([[960,390],[960,455],[943,435],[960,455],[977,435]], Palette.green, 4),
      d.line([[530,535],[740,535],[720,518],[740,535],[720,552]], Palette.orange, 4),
    );
    this.labels.push(
      d.text("real lowpass band [−W,W] Hz", 960, 205, 28, Palette.blue),
      d.text("two-sided white-noise PSD N₀/2 watts/Hz", 960, 255, 24, Palette.purple),
      d.text("−W",510,425,19,Palette.muted), d.text("0",960,425,19,Palette.muted), d.text("+W",1410,425,19,Palette.muted),
      d.text("frequency (Hz)",1640,400,20,Palette.muted),
      d.text("integrated noise power = N₀W watts", 960, 355, 24, Palette.text),
      d.text("about 2W real coefficients per second", 960, 555, 25, Palette.green),
      d.text("uniform signal allocation across coefficients", 600, 585, 22, Palette.orange),
      d.text("P watts total over one second", 430, 665, 22, Palette.muted),
      d.text("not P watts in each coefficient", 430, 705, 22, Palette.red),
      d.text("capacity unit: bits/second", 960, 845, 24, Palette.green),
    );
    this.equations.push(
      d.tex("\\mathbb E[X_k^2]=P/(2W)\\quad\\text{per real coefficient}", 960, 610, 28, Palette.yellow),
      d.tex("\\mathrm{Var}(Z_k)=N_0/2\\quad\\text{for a unit-energy basis function}", 960, 655, 27, Palette.text),
      d.tex("\\mathrm{SNR}_{k}=\\frac{P/(2W)}{N_0/2}=\\frac{P}{N_0W}", 960, 710, 29, Palette.orange),
      d.tex("C_{use}=\\frac12\\log_2(1+P/(N_0W))\\quad\\text{bits/real use}", 960, 760, 27, Palette.yellow),
      d.tex("C_{sec}\\approx 2W C_{use}=W\\log_2(1+P/(N_0W))\\quad\\text{bits/s}", 960, 810, 27, Palette.green),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const spectrum = c.p(0);
    const modes = c.p(1);
    const allocation = c.p(2);
    const result = c.p(18);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime>=c.s(18)&&ctx.localTime<c.s(19)?"What happens to the real Gaussian factor one half?":result > 0.5 ? "Multiply capacity per real use by the real use rate" : allocation > 0.5 ? "Each coefficient receives only its share of power" : "A two-sided PSD integrates over both halves of the band");
    this.axes.forEach((line: Polyline): void => line.setOpacity(spectrum));
    this.band.forEach((mesh: PanelMesh): void => Diagram.show(mesh, spectrum));
    this.noiseSpectrum.forEach((line: Polyline): void => line.setOpacity(c.p(7) * spectrum));
    this.coefficients.forEach((mesh: PanelMesh, i: number): void => Diagram.show(mesh, c.p(3 + i) * modes));
    this.arrows.forEach((line: Polyline, i: number): void => line.setOpacity(c.p(i === 0 ? 10 : 24) * allocation));
    this.labels.forEach((label: FormulaHandle, i: number): void => {
      const visible = i < 7 ? spectrum : i === 9 || i === 10 ? 0 : i === 8 ? c.during(2, 5) : result;
      label.set({ opacity: visible });
    });
    const starts: ReadonlyArray<number> = [3, 12, 14, 16, 20];
    const ys: ReadonlyArray<number> = [610, 655, 710, 760, 810];
    this.equations[0].setContent(ctx.localTime < c.s(5) ? "\\sum_k\\mathbb E[X_k^2]\\le PT,\\quad N_{eff}\\approx2WT" : "\\mathbb E[X_k^2]=P/(2W)\\quad\\text{per real coefficient}");
    this.equations.forEach((formula: FormulaHandle, i: number): void => formula.set({ opacity: c.p(starts[i]) * (i < 3 ? allocation : result), x: 960, y: ys[i] }));
  }

  teardown(_layers: SceneLayers): void {
    this.band.length = 0;
    this.coefficients.length = 0;
    this.axes.length = 0;
    this.noiseSpectrum.length = 0;
    this.arrows.length = 0;
    this.labels.length = 0;
    this.equations.length = 0;
  }
}

export function continuousAwgnCapacityScene(): Scene {
  return new ContinuousAwgnCapacityScene();
}
