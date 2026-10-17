import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ModeMark {
  readonly tick: Polyline;
}

export class TimeBandwidthScene implements Scene {
  readonly id = "c01-dimensions";
  private title!: FormulaHandle;
  private readonly panels: PanelMesh[] = [];
  private readonly windowLines: Polyline[] = [];
  private readonly bandLines: Polyline[] = [];
  private readonly leakageLines: Polyline[] = [];
  private readonly modeMarks: ModeMark[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly formulas: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A finite observation window and a lowpass band suggest about 2WT real modes", 960, 100, 39);

    this.panels.push(
      d.rectangle(520, 390, 710, 320, "#131b2b"),
      d.rectangle(1400, 390, 710, 320, "#131b2b"),
      d.rectangle(960, 730, 1280, 150, "#131b2b"),
    );

    const timeLeft = 240;
    const timeRight = 850;
    const obsStart = 400;
    const obsEnd = 710;
    const timeAxisY = 455;
    this.windowLines.push(
      d.line([[timeLeft, timeAxisY], [timeRight, timeAxisY]], Palette.axis, 3),
      d.line([[obsStart, 340], [obsStart, 485]], Palette.blue, 3),
      d.line([[obsEnd, 340], [obsEnd, 485]], Palette.blue, 3),
      d.line([[obsStart, 330], [obsEnd, 330]], Palette.blue, 3),
    );
    const fullWave: Array<readonly [number, number]> = [];
    const observedWave: Array<readonly [number, number]> = [];
    for (let i = 0; i <= 100; i++) {
      const x = timeLeft + (timeRight - timeLeft) * i / 100;
      const y = 410 - 29 * Math.sin((x - timeLeft) * 2 * Math.PI / 82);
      fullWave.push([x, y]);
      if (x >= obsStart && x <= obsEnd) observedWave.push([x, y]);
    }
    this.windowLines.push(
      d.line(fullWave, Palette.muted, 2),
      d.line(observedWave, Palette.blue, 4),
      d.line([[obsStart, 320], [obsStart, 340]], Palette.blue, 3),
      d.line([[obsEnd, 320], [obsEnd, 340]], Palette.blue, 3),
    );

    const bandLeft = 1190;
    const zero = 1400;
    const bandRight = 1610;
    const freqAxisY = 455;
    const bandTop = 335;
    this.bandLines.push(
      d.line([[1080, freqAxisY], [1720, freqAxisY]], Palette.axis, 3),
      d.line([[1080, bandTop], [1080, freqAxisY]], Palette.axis, 2),
      d.line([[bandLeft, 355], [bandLeft, 470]], Palette.yellow, 2),
      d.line([[bandRight, 355], [bandRight, 470]], Palette.yellow, 2),
      d.line([[bandLeft, 360], [bandLeft, 390], [bandRight, 390], [bandRight, 360]], Palette.green, 5),
    );
    this.leakageLines.push(
      d.line([[1090, 452], [1125, 448], [1155, 439], [1180, 420], [1190, 400]], Palette.orange, 4),
      d.line([[1190, 400], [1240, 381], [1290, 394], [1345, 386], [1400, 392], [1455, 386], [1510, 394], [1560, 381], [1610, 400]], Palette.orange, 3),
      d.line([[1610, 400], [1620, 420], [1645, 439], [1675, 448], [1710, 452]], Palette.orange, 4),
    );

    const rulerLeft = 390;
    const rulerRight = 1530;
    const rulerY = 740;
    const boundaryWidth = 125;
    const leftBoundary = d.rectangle(rulerLeft + boundaryWidth / 2, rulerY, boundaryWidth, 32, "#563d2b");
    const centerModes = d.rectangle((rulerLeft + rulerRight) / 2, rulerY, rulerRight - rulerLeft - 2 * boundaryWidth, 32, "#284c3b");
    const rightBoundary = d.rectangle(rulerRight - boundaryWidth / 2, rulerY, boundaryWidth, 32, "#563d2b");
    this.panels.push(leftBoundary, centerModes, rightBoundary);
    this.panels.forEach((panel: PanelMesh, i: number): void => { panel.position.z = i < 3 ? -.1 : -.05; });
    for (let i = 0; i <= 24; i++) {
      const x = rulerLeft + (rulerRight - rulerLeft) * i / 24;
      const tickHeight = i < 3 || i > 21 ? 26 : 15;
      const tick = d.line([[x, rulerY - tickHeight / 2], [x, rulerY + tickHeight / 2]], Palette.text, 2);
      this.modeMarks.push({ tick });
    }

    this.labels.push(
      d.text("time observation", 520, 265, 25, Palette.blue),
      d.text("observed interval [0,T]", 555, 300, 22, Palette.blue),
      d.text("unobserved continuation", 520, 510, 19, Palette.muted),
      d.text("time t (seconds)", 520, 535, 20, Palette.muted),
      d.text("0", obsStart, 485, 19, Palette.blue),
      d.text("T", obsEnd, 485, 19, Palette.blue),
      d.text("ideal real lowpass support", 1400, 265, 24, Palette.green),
      d.text("two-sided frequency interval [−W,W]", 1400, 300, 22, Palette.yellow),
      d.text("−W", bandLeft, 485, 19, Palette.yellow),
      d.text("0", zero, 485, 19, Palette.muted),
      d.text("+W", bandRight, 485, 19, Palette.yellow),
      d.text("frequency f (Hz)", 1400, 510, 20, Palette.muted),
      d.text("after finite-time truncation: illustrative spectral tails", 1400, 535, 20, Palette.orange),
      d.text("Strict time and band limits cannot both hold for a nonzero signal", 960, 570, 23, Palette.red),
      d.text("effective real modes; the center is strongly concentrated", 960, 650, 22, Palette.green),
      d.text("boundary modes transition gradually; ruler ticks are schematic, not eigenvalues", 960, 705, 18, Palette.muted),
      d.text("each orthonormal coefficient is one real channel use", 960, 815, 20, Palette.blue),
      d.text("positive and negative frequencies are not separate complex uses", 960, 580, 18, Palette.muted),
    );
    this.formulas.push(
      d.tex("2W\\;\\text{samples/s}\\times T\\;\\text{s}\\approx 2WT\\;\\text{real samples}", 960, 685, 26, Palette.yellow),
      d.tex("N_{\\mathrm{eff}}\\approx 2WT\\qquad (WT\\text{ large})", 960, 785, 31, Palette.green),
      d.text("prolate spheroidal modes justify concentration; theorem invoked, not proved", 960, 610, 19, Palette.text),
      d.tex("2W\\;\\text{real uses/s}\\quad\\Rightarrow\\quad R_{\\mathrm{bits/s}}=(2W)R_{\\mathrm{bits/use}}", 960, 840, 22, Palette.yellow),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const overview = c.p(0);
    const sampling = Math.max(c.during(3, 6), c.p(27));
    const leakage = Math.max(c.during(7, 12), c.p(27));
    const modes = Math.max(c.during(12, 17), c.p(27));
    const uses = Math.max(c.during(17, 23), c.p(27));
    const end = c.p(27);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime>=c.s(6)&&ctx.localTime<c.s(7)?"Is 2WT an exact finite-window dimension?":leakage > 0.5 ? "Finite observation makes the dimension count approximate" : modes > 0.5 ? "Prolate modes concentrate energy, with a gradual boundary" : "A real lowpass interval of duration T suggests about 2WT modes");

    const persistent = c.p(0);
    this.windowLines.forEach((line: Polyline, i: number): void => {
      line.setOpacity(i < 4 ? persistent : i === 4 ? Math.max(overview, leakage, modes, uses, end) : persistent);
    });
    this.bandLines.forEach((line: Polyline): void => line.setOpacity(persistent));
    this.leakageLines.forEach((line: Polyline): void => line.setOpacity(Math.max(leakage, modes, uses, end)));
    this.modeMarks.forEach((mark: ModeMark): void => mark.tick.setOpacity(c.p(3)));
    this.panels.forEach((panel: PanelMesh, i: number): void => {
      const alpha = i < 3 ? persistent : c.p(3);
      Diagram.show(panel, alpha);
    });
    this.labels.forEach((label: FormulaHandle, i: number): void => {
      const alpha = i < 12 ? persistent : i === 12 ? Math.max(leakage, modes, uses, end) : i === 13 ? leakage : i === 14 ? Math.max(modes, uses, end) : i === 15 ? c.p(12) : i === 17 ? 0 : Math.max(uses, end);
      label.set({ opacity: alpha });
    });
    this.formulas[0].set({ opacity: c.p(3) * Math.max(sampling, leakage, modes, uses, end), x: 960, y: 685 });
    this.formulas[1].set({ opacity: c.p(14) * Math.max(modes, uses, end), x: 960, y: 785 });
    this.formulas[2].set({ opacity: c.p(12) * Math.max(modes, uses, end), x: 960, y: 610 });
    this.formulas[3].set({ opacity: c.p(18) * Math.max(uses, end), x: 960, y: 840 });
  }

  teardown(_layers: SceneLayers): void {
    this.panels.length = 0;
    this.windowLines.length = 0;
    this.bandLines.length = 0;
    this.leakageLines.length = 0;
    this.modeMarks.length = 0;
    this.labels.length = 0;
    this.formulas.length = 0;
  }
}

export function timeBandwidthScene(): Scene {
  return new TimeBandwidthScene();
}
