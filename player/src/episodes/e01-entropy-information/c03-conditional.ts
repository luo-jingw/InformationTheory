import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";

interface ProbabilityBar {
  mesh: Mesh<BoxGeometry, MeshBasicMaterial>;
  value: FormulaHandle;
  label: FormulaHandle;
  x: number;
}

/** Joint probabilities stay fixed while the selected row is normalized separately. */
export class ConditionalEntropyScene implements Scene {
  readonly id = "c03-conditional";
  private readonly cells: Mesh<BoxGeometry, MeshBasicMaterial>[] = [];
  private readonly entries: FormulaHandle[] = [];
  private readonly totals: FormulaHandle[] = [];
  private readonly tableLabels: FormulaHandle[] = [];
  private readonly bars: ProbabilityBar[] = [];
  private readonly comparisons: ProbabilityBar[] = [];
  private title!: FormulaHandle;
  private tableTitle!: FormulaHandle;
  private distributionTitle!: FormulaHandle;
  private entropy!: FormulaHandle;
  private equation!: FormulaHandle;
  private observation!: FormulaHandle;
  private columnTotals!: FormulaHandle;
  private baseline!: Mesh<BoxGeometry, MeshBasicMaterial>;

  setup(layers: SceneLayers): void {
    layers.stage.setView2D(0, 0, 10.8);
    this.title = layers.formulas.add({ text: "Can an observation increase uncertainty?", x: 960, y: 100, size: 47, weight: 650 });
    this.tableTitle = layers.formulas.add({ tex: "p_{X,Y}(x,y)", x: 500, y: 210, size: 37, color: Palette.blue });
    const labels: ReadonlyArray<readonly [string, number, number]> = [
      ["Y=0", 390, 285], ["Y=1", 650, 285], ["X=0", 160, 390], ["X=1", 160, 550], ["p_X(x)", 855, 285],
    ];
    for (const [tex, x, y] of labels) this.tableLabels.push(layers.formulas.add({ tex, x, y, size: 32, color: Palette.muted }));
    const probabilities = ["0.05", "0.05", "0.90", "0"];
    for (let index = 0; index < 4; index++) {
      const x = index % 2 === 0 ? 390 : 650;
      const y = index < 2 ? 390 : 550;
      this.cells.push(this.rectangle(layers, x, y, 225, 125, Palette.panel));
      this.entries.push(layers.formulas.add({ text: probabilities[index], x, y, size: 46 }));
    }
    this.totals.push(layers.formulas.add({ text: "0.10", x: 855, y: 390, size: 38, color: Palette.orange }));
    this.totals.push(layers.formulas.add({ text: "0.90", x: 855, y: 550, size: 38, color: Palette.green }));
    this.columnTotals = layers.formulas.add({ tex: "p_Y(0)=0.95,\\qquad p_Y(1)=0.05", x: 500, y: 685, size: 31, color: Palette.blue });
    this.distributionTitle = layers.formulas.add({ tex: "p_Y(y)", x: 1400, y: 210, size: 38, color: Palette.blue });
    this.baseline = this.rectangle(layers, 1400, 650, 660, 3, Palette.axis);
    for (let index = 0; index < 2; index++) this.bars.push(this.createBar(layers, 1240 + index * 300, `Y=${index}`, Palette.blue));
    const comparisonLabels = ["H(Y)", "H(Y\\mid X)", "H(Y\\mid X=0)"];
    const comparisonColors = [Palette.blue, Palette.green, Palette.orange];
    for (let index = 0; index < 3; index++) this.comparisons.push(this.createBar(layers, 1140 + index * 255, comparisonLabels[index], comparisonColors[index]));
    this.entropy = layers.formulas.add({ tex: "H(Y)=h_2(0.05)\\approx0.2864\\ \\text{bits}", x: 1400, y: 745, size: 32, color: Palette.yellow });
    this.equation = layers.formulas.add({ tex: "H(Y)=-\\sum_y p_Y(y)\\log_2p_Y(y)", x: 960, y: 805, size: 37, color: Palette.yellow, maxWidth: 1760 });
    this.observation = layers.formulas.add({ text: "Joint table: four events, total probability 1", x: 500, y: 745, size: 27, color: Palette.muted });
  }

  draw(ctx: SceneContext): void {
    const cues = new Cues(ctx, ctx.localTime);
    const table = cues.p(4);
    const conditionZero = cues.p(22) * (1 - cues.p(30));
    const conditionOne = cues.p(30) * (1 - cues.p(35));
    const comparison = cues.p(35);
    const distribution = cues.p(13) * (1 - cues.p(22)) + cues.p(25) * (1 - cues.p(30)) + cues.p(32) * (1 - comparison);
    this.title.set({ opacity: cues.p(0) });
    this.tableTitle.set({ opacity: table });
    this.tableLabels.forEach((label: FormulaHandle): void => label.set({ opacity: table }));
    this.cells.forEach((cell: Mesh<BoxGeometry, MeshBasicMaterial>, index: number): void => {
      const selected = index < 2 ? conditionZero : conditionOne;
      cell.material.opacity = table * (0.7 + 0.3 * selected);
      cell.material.color.set(selected > 0.5 ? (index < 2 ? "#60412a" : "#224d40") : Palette.panel);
      this.entries[index].set({ opacity: cues.p(5 + index), color: selected > 0.5 ? (index < 2 ? Palette.orange : Palette.green) : Palette.text });
    });
    this.totals[0].set({ opacity: cues.p(10) });
    this.totals[1].set({ opacity: cues.p(11) });
    this.columnTotals.set({ opacity: cues.p(18) });
    this.observation.set({ opacity: table });
    this.observation.setContent(ctx.localTime >= cues.s(35) ? "Row weights: P(X=0)=0.1, P(X=1)=0.9" : ctx.localTime >= cues.s(22) ? "The joint table stays fixed; normalize a selected row" : "Joint table: four events, total probability 1");
    this.baseline.material.opacity = Math.max(distribution, comparison);
    const zeroNormalized = cues.p(25, 1.1);
    const oneNormalized = cues.p(32, 1.1);
    const firstProbability = 0.95 - 0.45 * zeroNormalized + 0.5 * oneNormalized;
    for (let index = 0; index < 2; index++) this.drawBar(this.bars[index], index === 0 ? firstProbability : 1 - firstProbability, distribution, 310, 650, true);
    this.distributionTitle.set({ opacity: Math.max(distribution, comparison), color: comparison > 0.5 ? Palette.text : conditionZero > 0.5 ? Palette.orange : conditionOne > 0.5 ? Palette.green : Palette.blue });
    this.distributionTitle.setContent(ctx.localTime >= cues.s(35) ? "\\text{Entropy in bits}" : ctx.localTime >= cues.s(30) ? "p_{Y\\mid X=1}(y)" : ctx.localTime >= cues.s(22) ? "p_{Y\\mid X=0}(y)" : "p_Y(y)");
    this.entropy.set({ opacity: cues.p(19) * (1 - cues.p(22)) + cues.p(27) * (1 - cues.p(30)) + cues.p(33) * (1 - comparison) });
    this.entropy.setContent(ctx.localTime >= cues.s(33) ? "H(Y\\mid X=1)=0\\ \\text{bits}" : ctx.localTime >= cues.s(27) ? "H(Y\\mid X=0)=1\\ \\text{bit}" : "H(Y)=h_2(0.05)\\approx0.2864\\ \\text{bits}");
    const entropies = [0.2863969571, 0.1, 1];
    for (let index = 0; index < 3; index++) this.drawBar(this.comparisons[index], entropies[index], comparison * cues.p(index === 1 ? 38 : 35), 310, 650, false);
    this.equation.set({ opacity: cues.p(1) });
    this.equation.setContent(this.equationAt(cues, ctx.localTime));
  }

  teardown(_layers: SceneLayers): void {
    this.cells.length = 0;
    this.entries.length = 0;
    this.totals.length = 0;
    this.tableLabels.length = 0;
    this.bars.length = 0;
    this.comparisons.length = 0;
  }

  private rectangle(layers: SceneLayers, x: number, y: number, width: number, height: number, color: string): Mesh<BoxGeometry, MeshBasicMaterial> {
    const mesh = new Mesh(new BoxGeometry(width / 100, height / 100, 0.02), new MeshBasicMaterial({ color, transparent: true, opacity: 0 }));
    mesh.position.set((x - 960) / 100, (540 - y) / 100, 0);
    layers.stage.root.add(mesh);
    return mesh;
  }

  private createBar(layers: SceneLayers, x: number, label: string, color: string): ProbabilityBar {
    return {
      mesh: this.rectangle(layers, x, 650, 110, 1, color), x,
      value: layers.formulas.add({ text: "0", x, y: 620, size: 34, color }),
      label: layers.formulas.add({ tex: label, x, y: 700, size: 28, color }),
    };
  }

  private drawBar(bar: ProbabilityBar, value: number, opacity: number, scale: number, baseline: number, probability: boolean): void {
    const height = Math.max(0.5, value * scale);
    bar.mesh.scale.y = height;
    bar.mesh.position.y = (540 - baseline + height / 2) / 100;
    bar.mesh.material.opacity = opacity;
    bar.value.setContent(probability ? value.toFixed(2) : value === 1 ? "1" : value.toFixed(4).replace(/0+$/, ""));
    bar.value.set({ y: baseline - height - 30, opacity });
    bar.label.set({ opacity });
  }

  private equationAt(cues: Cues, time: number): string {
    if (time >= cues.s(47)) return "H(X,Y)\\approx0.468996+0.1=0.568996\\ \\text{bits}";
    if (time >= cues.s(44)) return "H(X,Y)=H(X)+H(Y\\mid X)";
    if (time >= cues.s(39)) return "H(Y\\mid X)=0.1<0.2864\\approx H(Y),\\quad H(Y\\mid X=0)=1>H(Y)";
    if (time >= cues.s(38)) return "H(Y\\mid X)=0.1\\cdot1+0.9\\cdot0=0.1\\ \\text{bit}";
    if (time >= cues.s(35)) return "H(Y\\mid X)=\\sum_xp_X(x)H(Y\\mid X=x)";
    if (time >= cues.s(33)) return "H(Y\\mid X=1)=-1\\log_2 1-0\\log_2 0=0";
    if (time >= cues.s(30)) return "p_{Y\\mid X=1}=\\left(\\frac{0.9}{0.9},\\frac0{0.9}\\right)=(1,0)";
    if (time >= cues.s(27)) return "H(Y\\mid X=0)=-2\\left(\\tfrac12\\log_2\\tfrac12\\right)=1\\ \\text{bit}";
    if (time >= cues.s(22)) return "p_{Y\\mid X=0}=\\left(\\frac{0.05}{0.1},\\frac{0.05}{0.1}\\right)=(0.5,0.5)";
    if (time >= cues.s(19)) return "H(Y)=-0.95\\log_2 0.95-0.05\\log_2 0.05\\approx0.2864";
    if (time >= cues.s(13)) return "p_Y(y)=\\sum_xp_{X,Y}(x,y)";
    if (time >= cues.s(10)) return "p_X(x)=\\sum_yp_{X,Y}(x,y)";
    return "H(Y)=\\sum_yp_Y(y)\\log_2\\frac1{p_Y(y)}";
  }
}

export function conditionalEntropyScene(): Scene {
  return new ConditionalEntropyScene();
}
