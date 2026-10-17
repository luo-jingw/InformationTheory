import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";

const INITIAL = [0.25, 0.25, 0.25, 0.25] as const;
const FINAL = [0.5, 0.25, 0.125, 0.125] as const;
const CENTERS = [-3.3, -1.1, 1.1, 3.3] as const;
const BASELINE = -2.1;
const HEIGHT_SCALE = 5;

/** Lightweight technical fixture: sentence-cued probability bars and one entropy equation. */
export class ConditionalScene implements Scene {
  readonly id = "conditional";
  private readonly bars: Mesh[] = [];
  private readonly values: FormulaHandle[] = [];
  private readonly symbols: FormulaHandle[] = [];
  private formula!: FormulaHandle;

  setup(layers: SceneLayers): void {
    layers.stage.setView2D(0, 0, 9);
    const baseline = new Mesh(new BoxGeometry(7.8, 0.025, 0.06), new MeshBasicMaterial({ color: Palette.axis }));
    baseline.position.y = BASELINE;
    layers.stage.root.add(baseline);

    for (let index = 0; index < INITIAL.length; index++) {
      const material = new MeshBasicMaterial({ color: index === 0 ? Palette.orange : Palette.blue });
      const bar = new Mesh(new BoxGeometry(0.72, 1, 0.12), material);
      layers.stage.root.add(bar);
      this.bars.push(bar);

      const pixelX = 960 + CENTERS[index] * 120;
      this.values.push(layers.formulas.add({
        text: INITIAL[index].toFixed(2), x: pixelX, y: 540 - (BASELINE + 0.4) * 120,
        size: 28, color: Palette.text, align: "center", valign: "bottom", opacity: 0,
      }));
      this.symbols.push(layers.formulas.add({
        tex: `x_{${index + 1}}`, x: pixelX, y: 835, size: 31, color: Palette.muted,
        align: "center", opacity: 0,
      }));
    }
    this.formula = layers.formulas.add({
      tex: "H(X)=-\\sum_{i=1}^{4}p_i\\log_2 p_i", x: 960, y: 245, size: 50,
      color: Palette.yellow, align: "center", boxed: true, opacity: 0,
    });
  }

  draw(ctx: SceneContext): void {
    const cues = new Cues(ctx, ctx.localTime);
    const reveal = cues.p(0, 0.65);
    const morph = cues.p(1, 1.1);
    for (let index = 0; index < this.bars.length; index++) {
      const probability = INITIAL[index] + (FINAL[index] - INITIAL[index]) * morph;
      const height = probability * HEIGHT_SCALE;
      const bar = this.bars[index];
      bar.scale.y = height;
      bar.position.set(CENTERS[index], BASELINE + height / 2, 0);
      const displayed = probability.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
      this.values[index].setContent(displayed);
      this.values[index].set({ y: 540 - (BASELINE + height + 0.16) * 120, opacity: reveal });
      this.symbols[index].set({ opacity: reveal });
    }
    this.formula.set({ opacity: reveal });
  }

  teardown(_layers: SceneLayers): void {
    this.bars.length = 0;
    this.values.length = 0;
    this.symbols.length = 0;
  }
}

export function conditionalScene(): Scene {
  return new ConditionalScene();
}
