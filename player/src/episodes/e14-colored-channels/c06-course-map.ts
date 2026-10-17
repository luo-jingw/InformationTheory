import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface LabeledBlock {
  readonly panel: PanelMesh;
  readonly label: FormulaHandle;
}

export class CourseMapScene implements Scene {
  readonly id = "c06-course-map";
  private title!: FormulaHandle;
  private readonly blocks: LabeledBlock[] = [];
  private readonly equations: FormulaHandle[] = [];
  private readonly notes: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A rate comparison connects sources, channels, and spectral models", 960, 100, 41);
    const source = d.rectangle(555, 340, 400, 150, "#263650");
    const channel = d.rectangle(1365, 340, 400, 150, "#35402c");
    this.blocks.push(
      { panel: source, label: d.text("m source symbols", 555, 315, 30, Palette.text) },
      { panel: channel, label: d.text("n channel uses", 1365, 315, 30, Palette.text) },
    );
    this.blocks.push(
      { panel: d.rectangle(555, 370, 300, 62, "#172338"), label: d.tex("m\\,\\bar H\\;\\text{bits}", 555, 370, 29, Palette.yellow) },
      { panel: d.rectangle(1365, 370, 300, 62, "#20291d"), label: d.tex("nC\\;\\text{bits}", 1365, 370, 29, Palette.green) },
    );
    this.blocks.push(
      { panel: d.rectangle(960, 340, 180, 70, "#302b26"), label: d.text("reliable", 960, 340, 25, Palette.orange) },
    );
    this.notes.push(
      d.text("source: stationary ergodic, finite alphabet", 555, 465, 19, Palette.muted),
      d.text("channel: coding theorem assumptions apply", 1365, 465, 19, Palette.muted),
      d.text("bits per source symbol", 555, 435, 20, Palette.blue),
      d.text("bits per channel use", 1365, 435, 20, Palette.blue),
      d.text("strict slack lets source and channel error vanish", 960, 510, 23, Palette.yellow),
      d.text("converse: reliable transmission requires source rate ≤ channel capacity", 960, 550, 21, Palette.orange),
      d.text("spectral limit: Toeplitz covariance plus stated regularity", 960, 625, 21, Palette.blue),
      d.text("feedback comparison: finite real Gaussian block, causal noiseless feedback", 960, 670, 20, Palette.purple),
      d.text("continuous-time capacity is bits/second; discrete capacity is bits/use", 960, 715, 20, Palette.green),
      d.text("models and hypotheses travel with every conclusion", 960, 835, 23, Palette.yellow),
    );
    this.equations.push(
      d.tex("m\\bar H<nC,\\qquad \\rho=\\frac mn\\;\\Rightarrow\\;\\rho\\bar H<C", 960, 595, 30, Palette.yellow),
      d.tex("\\bar H:\\;\\text{bits/source symbol}\\qquad C:\\;\\text{bits/channel use}", 960, 755, 25, Palette.text),
      d.tex("\\text{source rate}\\times\\text{source symbols/use}<C", 960, 795, 24, Palette.green),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const setup = c.p(0);
    const rates = c.p(9);
    const scope = c.p(21);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(rates > 0.5 ? "A strict source-to-channel rate gap supports reliable separation" : "Compare rates only after matching models and units");
    this.blocks.forEach((block: LabeledBlock, i: number): void => {
      const alpha = i < 2 ? setup : rates;
      Diagram.show(block.panel, alpha);
      block.label.set({ opacity: alpha });
    });
    this.notes.forEach((note: FormulaHandle, i: number): void => {
      const alpha = i === 0 ? c.p(2) : i < 4 ? setup : i < 6 ? rates : scope;
      note.set({ opacity: alpha });
    });
    this.equations[0].set({ opacity: c.p(13) * rates, x: 960, y: 595 });
    this.equations[1].set({ opacity: c.p(19) * Math.max(rates, scope), x: 960, y: 755 });
    this.equations[2].set({ opacity: c.p(22) * scope, x: 960, y: 795 });
  }

  teardown(_layers: SceneLayers): void {
    this.blocks.length = 0;
    this.equations.length = 0;
    this.notes.length = 0;
  }
}

export function courseMapScene(): Scene {
  return new CourseMapScene();
}
