import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "./lib/Diagram";

interface ProbabilityBar {
  readonly mesh: PanelMesh;
  readonly value: FormulaHandle;
  readonly label: FormulaHandle;
  readonly x: number;
  readonly color: string;
}

/** Recomputes the table, conditional distributions, entropy sums, and MI checks from cue time. */
class EntropyRecapScene implements Scene {
  readonly id = "c05-recap";

  private diagram!: Diagram;
  private title!: FormulaHandle;
  private tableTitle!: FormulaHandle;
  private rightTitle!: FormulaHandle;
  private rightSubtitle!: FormulaHandle;
  private readonly rowLabels: FormulaHandle[] = [];
  private readonly columnLabels: FormulaHandle[] = [];
  private readonly rowTotals: FormulaHandle[] = [];
  private readonly columnTotals: FormulaHandle[] = [];
  private readonly cells: PanelMesh[] = [];
  private readonly entries: FormulaHandle[] = [];
  private readonly bars: ProbabilityBar[] = [];
  private readonly barGroupTitles: FormulaHandle[] = [];
  private readonly calculations: FormulaHandle[] = [];
  private readonly separators: ReturnType<Diagram["line"]>[] = [];

  setup(layers: SceneLayers): void {
    this.diagram = new Diagram(layers);
    this.title = this.diagram.text("Compute Entropy and Shared Information", 960, 100, 45, Palette.text);
    this.tableTitle = this.diagram.tex("p_{X,Y}(x,y)", 500, 200, 37, Palette.blue);
    this.rightTitle = this.diagram.text("Marginals", 1390, 200, 35, Palette.blue);
    this.rightSubtitle = this.diagram.text("Sum rows and columns", 1390, 244, 25, Palette.muted);

    const columnX: readonly number[] = [395, 595];
    const rowY: readonly number[] = [340, 465];
    this.columnLabels.push(this.diagram.tex("Y=0", columnX[0], 265, 30, Palette.muted));
    this.columnLabels.push(this.diagram.tex("Y=1", columnX[1], 265, 30, Palette.muted));
    this.rowLabels.push(this.diagram.tex("X=0", 220, rowY[0], 30, Palette.muted));
    this.rowLabels.push(this.diagram.tex("X=1", 220, rowY[1], 30, Palette.muted));
    this.rowLabels.push(this.diagram.tex("p_X(x)", 820, 265, 27, Palette.muted));
    this.columnLabels.push(this.diagram.tex("p_Y(y)", 500, 630, 27, Palette.muted));
    this.rowTotals.push(this.diagram.text("0.50", 820, rowY[0], 32, Palette.orange));
    this.rowTotals.push(this.diagram.text("0.50", 820, rowY[1], 32, Palette.orange));
    this.columnTotals.push(this.diagram.text("0.40", columnX[0], 675, 32, Palette.teal));
    this.columnTotals.push(this.diagram.text("0.60", columnX[1], 675, 32, Palette.teal));

    const cellColors: readonly string[] = [Palette.panel, Palette.panel, Palette.panel, Palette.panel];
    for (let index = 0; index < 4; index++) {
      const x: number = columnX[index % 2];
      const y: number = rowY[Math.floor(index / 2)];
      this.cells.push(this.diagram.rectangle(x, y, 174, 106, cellColors[index]));
      this.entries.push(this.diagram.text("0.00", x, y, 42, Palette.text));
    }
    this.separators.push(
      this.diagram.line([[300, 405], [700, 405]], Palette.grid, 2),
      this.diagram.line([[495, 285], [495, 525]], Palette.grid, 2),
      this.diagram.line([[1030, 570], [1770, 570]], Palette.axis, 2),
    );

    this.barGroupTitles.push(
      this.diagram.text("p_X", 1197.5, 330, 28, Palette.blue),
      this.diagram.text("p_Y", 1577.5, 330, 28, Palette.orange),
    );
    const barX: readonly number[] = [1125, 1270, 1505, 1650];
    const barColors: readonly string[] = [Palette.blue, Palette.orange, Palette.blue, Palette.orange];
    for (let index = 0; index < 4; index++) {
      const x: number = barX[index];
      const color: string = barColors[index];
      this.bars.push({
        mesh: this.diagram.rectangle(x, 570, 74, 1, color),
        value: this.diagram.text("0.00", x, 550, 30, color),
        label: this.diagram.text("", x, 613, 28, Palette.muted),
        x,
        color,
      });
    }
    this.calculations.push(
      this.diagram.tex("H(X)=1\\quad H(Y)=h_2(0.6)\\approx0.97095", 1390, 690, 32, Palette.yellow),
      this.diagram.tex("H(Y\\mid X)=0.5h_2(0.4)+0.5h_2(0.8)\\approx0.84644", 1390, 745, 29, Palette.green),
      this.diagram.tex("I(X;Y)=H(Y)-H(Y\\mid X)\\approx0.12451\\ \\mathrm{bits}", 1390, 800, 29, Palette.yellow),
    );
    const contributionTexts: readonly string[] = [
      "0.3\\log_2(1/0.3)\\approx0.52109",
      "0.2\\log_2(1/0.2)\\approx0.46439",
      "0.1\\log_2(1/0.1)\\approx0.33219",
      "0.4\\log_2(1/0.4)\\approx0.52877",
    ];
    for (let index = 0; index < contributionTexts.length; index++) {
      this.calculations.push(this.diagram.tex(contributionTexts[index], 1390, 315 + index * 68, 32, Palette.text));
    }
    this.calculations.push(
      this.diagram.tex("H(X,Y)\\approx1.84644\\ \\mathrm{bits}", 1390, 610, 31, Palette.yellow),
      this.diagram.tex("\\begin{gathered}I=H(Y)-H(Y\\mid X)\\\\0.97095-0.84644=0.12451\\end{gathered}", 1390, 700, 29, Palette.yellow),
      this.diagram.tex("\\begin{gathered}I=H(X)+H(Y)-H(X,Y)\\\\1+0.97095-1.84644=0.12451\\end{gathered}", 1390, 765, 28, Palette.green),
    );
    this.calculations.push(
      this.diagram.tex("I(X;Y)=0\\quad\\text{independent}", 1390, 780, 32, Palette.green),
      this.diagram.tex("I(X;Y)=1\\ \\mathrm{bit}\\quad Y=X", 1390, 780, 32, Palette.yellow),
      this.diagram.tex("I(X;Y)\\approx0.12451\\ \\mathrm{bits}", 1390, 780, 32, Palette.yellow),
    );
  }

  draw(ctx: SceneContext): void {
    const cues: Cues = new Cues(ctx, ctx.localTime);
    const time: number = ctx.localTime;
    const independentMix: number = cues.p(40, 0.9) * (1 - cues.p(42, 0.9));
    const deterministicMix: number = cues.p(42, 0.9) * (1 - cues.p(45, 0.9));
    const originalMix: number = Math.max(cues.p(45, 0.9), 1 - independentMix - deterministicMix);
    const contributionPhase: number = cues.p(30, 0.8) * (1 - cues.p(40, 0.8));
    const marginalPhase: number = cues.p(5, 0.8) * (1 - cues.p(13, 0.8));
    const rowPhase: number = cues.p(13, 0.8) * (1 - cues.p(23, 0.8));
    const columnPhase: number = cues.p(23, 0.8) * (1 - cues.p(29, 0.8));
    const conditionalPhase: number = Math.max(rowPhase, columnPhase);
    const examplePhase: number = cues.p(40, 0.8) * (1 - cues.p(45, 0.8));
    const tableOpacity: number = Math.max(cues.p(0), 0.96);
    const distributionOpacity: number = Math.max(marginalPhase, conditionalPhase) * (1 - contributionPhase);

    this.title.set({ opacity: cues.p(0) });
    this.tableTitle.set({ opacity: tableOpacity });
    this.rightTitle.set({ opacity: Math.max(cues.p(5), cues.p(13), contributionPhase, examplePhase) });
    this.rightSubtitle.set({ opacity: Math.max(cues.p(5), conditionalPhase, contributionPhase, examplePhase) });
    this.rightTitle.setContent(this.rightTitleAt(time, cues));
    this.rightSubtitle.setContent(this.rightSubtitleAt(time, cues));
    this.barGroupTitles[0].setContent(this.barGroupTitle(0, marginalPhase, rowPhase, columnPhase));
    this.barGroupTitles[1].setContent(this.barGroupTitle(1, marginalPhase, rowPhase, columnPhase));
    this.barGroupTitles.forEach((title: FormulaHandle): void => title.set({ opacity: distributionOpacity }));

    const tableValues: readonly (readonly number[])[] = [
      [0.3, 0.2, 0.1, 0.4],
      [0.2, 0.3, 0.2, 0.3],
      [0.5, 0.0, 0.0, 0.5],
    ];
    const rowMarginals: readonly (readonly number[])[] = [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5]];
    const columnMarginals: readonly (readonly number[])[] = [[0.4, 0.6], [0.4, 0.6], [0.5, 0.5]];
    const currentValues: readonly number[] = this.mixTable(tableValues, originalMix, independentMix, deterministicMix);
    const currentRows: readonly number[] = this.mixVector(rowMarginals, originalMix, independentMix, deterministicMix);
    const currentColumns: readonly number[] = this.mixVector(columnMarginals, originalMix, independentMix, deterministicMix);
    this.rowLabels.forEach((label: FormulaHandle): void => label.set({ opacity: tableOpacity }));
    this.columnLabels.forEach((label: FormulaHandle): void => label.set({ opacity: tableOpacity }));
    this.rowTotals.forEach((total: FormulaHandle, index: number): void => {
      total.setContent(currentRows[index].toFixed(2));
      total.set({ opacity: Math.max(cues.p(index === 0 ? 5 : 6), examplePhase), color: Palette.orange });
    });
    this.columnTotals.forEach((total: FormulaHandle, index: number): void => {
      total.setContent(currentColumns[index].toFixed(2));
      total.set({ opacity: Math.max(cues.p(index === 0 ? 7 : 8), examplePhase), color: Palette.teal });
    });
    this.entries.forEach((entry: FormulaHandle, index: number): void => {
      entry.setContent(this.formatProbability(currentValues[index]));
      const activeCell: number = this.activeContribution(time, cues);
      entry.set({ opacity: Math.max(cues.p(index < 2 ? 2 : 3), examplePhase), color: activeCell === index ? Palette.yellow : Palette.text });
    });
    this.cells.forEach((cell: PanelMesh, index: number): void => {
      const activeCell: number = this.activeContribution(time, cues);
      const color: string = activeCell === index ? "#60412a" : Palette.panel;
      cell.material.color.set(color);
      Diagram.show(cell, tableOpacity);
    });
    this.separators.forEach((separator): void => separator.setOpacity(tableOpacity * 0.7));

    const rowData: readonly number[] = [0.6, 0.4, 0.2, 0.8];
    const columnData: readonly number[] = [0.75, 0.25, 1 / 3, 2 / 3];
    const marginalData: readonly number[] = [0.5, 0.5, 0.4, 0.6];
    this.bars.forEach((bar: ProbabilityBar, index: number): void => {
      const group: number = index < 2 ? 0 : 1;
      const modeWeight: number = marginalPhase + rowPhase + columnPhase;
      const value: number = modeWeight > 0
        ? (marginalData[index] * marginalPhase + rowData[index] * rowPhase + columnData[index] * columnPhase) / modeWeight
        : marginalData[index];
      const visible: number = distributionOpacity;
      Diagram.bar(bar.mesh, bar.x, 570, value * 170, visible);
      bar.value.setContent(this.formatConditional(value));
      bar.value.set({ x: bar.x, y: 570 - value * 170 - 24, opacity: visible });
      bar.label.setContent(this.outcomeLabel(index % 2, group, marginalPhase, rowPhase, columnPhase));
      bar.label.set({ x: bar.x, y: 615, opacity: visible });
    });
    this.calculations.slice(0, 3).forEach((formula: FormulaHandle, index: number): void => {
      const normalPhase: number = (1 - cues.p(40)) * (1 - contributionPhase);
      const opacities: readonly number[] = [cues.p(10) * (1 - contributionPhase) + examplePhase,
        cues.p(20) * normalPhase, cues.p(22) * normalPhase];
      formula.set({ opacity: opacities[index] });
      formula.setContent(this.marginalFormulaAt(index, time, cues));
    });
    this.calculations.slice(3, 7).forEach((formula: FormulaHandle, index: number): void => {
      const cellCue: number = 31 + index;
      formula.set({ opacity: cues.p(cellCue) * (1 - cues.p(40)) });
    });
    this.calculations[7].set({ opacity: cues.p(35) * (1 - cues.p(40)) });
    this.calculations[8].set({ opacity: cues.p(39) * (1 - cues.p(40)) });
    this.calculations[9].set({ opacity: cues.p(36) * (1 - cues.p(40)) });
    this.calculations[10].set({ y: 780, opacity: independentMix * cues.p(41) });
    this.calculations[11].set({ y: 780, opacity: deterministicMix * cues.p(44) });
    this.calculations[12].set({ y: 780, opacity: cues.p(45) });
    this.calculations[8].setContent(this.miRouteOneAt());
    this.calculations[9].setContent(this.miRouteTwoAt(time, cues));
    this.calculations[10].setContent("I(X;Y)=0\\quad\\text{independent}");
    this.calculations[11].setContent("I(X;Y)=1\\ \\mathrm{bit}\\quad Y=X");
    this.calculations[12].setContent("I(X;Y)\\approx0.12451\\ \\mathrm{bits}");
    this.calculations[7].setContent("H(X,Y)\\approx1.84644\\ \\mathrm{bits}");
    this.calculations.slice(3, 7).forEach((formula: FormulaHandle, index: number): void => {
      formula.setContent(this.contributionAt(index, currentValues[index]));
    });
  }

  teardown(_layers: SceneLayers): void {
    this.cells.length = 0;
    this.rowLabels.length = 0;
    this.columnLabels.length = 0;
    this.rowTotals.length = 0;
    this.columnTotals.length = 0;
    this.entries.length = 0;
    this.bars.length = 0;
    this.barGroupTitles.length = 0;
    this.calculations.length = 0;
    this.separators.length = 0;
  }

  private rightTitleAt(time: number, cues: Cues): string {
    if (time >= cues.s(31) && time < cues.s(40)) return "Joint entropy contributions";
    if (time >= cues.s(29) && time < cues.s(31)) return "Second MI route";
    if (time >= cues.s(23) && time < cues.s(29)) return "Condition on columns";
    if (time >= cues.s(13) && time < cues.s(23)) return "Condition on rows";
    if (time >= cues.s(40) && time < cues.s(42)) return "Independent boundary";
    if (time >= cues.s(42) && time < cues.s(45)) return "Deterministic boundary";
    if (time >= cues.s(45)) return "Original table restored";
    if (time >= cues.s(10)) return "Marginal entropies";
    if (time >= cues.s(5)) return "Marginal distributions";
    return "Marginals";
  }

  private rightSubtitleAt(time: number, cues: Cues): string {
    if (time >= cues.s(31) && time < cues.s(40)) return "Each cell contributes p(x,y) log₂(1/p(x,y))";
    if (time >= cues.s(29) && time < cues.s(31)) return "I(X;Y)=H(X)+H(Y)-H(X,Y)";
    if (time >= cues.s(23) && time < cues.s(29)) return "Normalize each column by its marginal";
    if (time >= cues.s(13) && time < cues.s(23)) return "Normalize each row by its marginal";
    if (time >= cues.s(40) && time < cues.s(42)) return "Same marginals; factorized joint table";
    if (time >= cues.s(42) && time < cues.s(45)) return "Fair X; the diagonal determines Y";
    if (time >= cues.s(45)) return "Return to the worked distribution";
    if (time >= cues.s(5)) return "Row and column sums";
    return "Sum rows and columns";
  }

  private marginalFormulaAt(index: number, time: number, cues: Cues): string {
    if (index === 0) return time >= cues.s(42) && time < cues.s(45) ? "H(X)=1\\quad H(Y)=1\\ \\mathrm{bit}" : "H(X)=1\\quad H(Y)=h_2(0.6)\\approx0.97095\\ \\mathrm{bits}";
    if (index === 1 && time >= cues.s(42) && time < cues.s(45)) return "\\begin{gathered}p(Y\\mid X=0)=(1,0)\\\\p(Y\\mid X=1)=(0,1)\\end{gathered}";
    if (index === 1 && time >= cues.s(40) && time < cues.s(42)) return "p_X=(0.5,0.5)\\quad p_Y=(0.4,0.6)";
    if (index === 1 && time >= cues.s(23) && time < cues.s(26)) return "\\begin{gathered}p(X\\mid Y=0)=(0.75,0.25)\\\\p(X\\mid Y=1)=(1/3,2/3)\\end{gathered}";
    if (index === 1 && time >= cues.s(26) && time < cues.s(29)) return "H(X\\mid Y)=0.4h_2(0.25)+0.6h_2(1/3)\\approx0.87549";
    if (index === 1 && time >= cues.s(20)) return time < cues.s(21)
      ? "H(Y\\mid X)=0.5h_2(0.4)+0.5h_2(0.8)"
      : "H(Y\\mid X)=0.5h_2(0.4)+0.5h_2(0.8)\\approx0.84644";
    if (index === 1 && time >= cues.s(18)) return "h_2(0.4)\\approx0.97095\\quad h_2(0.8)\\approx0.72193";
    if (index === 1 && time >= cues.s(13)) return "\\begin{gathered}p(Y\\mid X=0)=(0.6,0.4)\\\\p(Y\\mid X=1)=(0.2,0.8)\\end{gathered}";
    if (index === 1 && time >= cues.s(10)) return "p_X=(0.5,0.5)\\quad p_Y=(0.4,0.6)";
    if (index === 2 && time >= cues.s(45)) return "I(X;Y)\\approx0.12451\\ \\mathrm{bits}";
    if (index === 2 && time >= cues.s(42)) return "I(X;Y)=1\\ \\mathrm{bit}\\quad Y=X";
    if (index === 2 && time >= cues.s(40)) return "I(X;Y)=0\\quad\\text{independent}";
    if (index === 2 && time >= cues.s(28) && time < cues.s(30)) return "I=H(X)-H(X\\mid Y)=1-0.87549=0.12451\\ \\mathrm{bits}";
    if (index === 2 && time >= cues.s(22)) return "I=H(Y)-H(Y\\mid X)=0.97095-0.84644=0.12451\\ \\mathrm{bits}";
    return "H(Y)=h_2(0.6)\\approx0.97095\\ \\mathrm{bits}";
  }

  private miRouteOneAt(): string {
    return "I=H(Y)-H(Y\\mid X)=0.97095-0.84644=0.12451";
  }

  private miRouteTwoAt(time: number, cues: Cues): string {
    if (time >= cues.s(38)) return "I=1+0.97095-1.84644=0.12451\\ \\mathrm{bits}";
    if (time >= cues.s(37)) return "1.97095-1.84644=0.12451\\ \\mathrm{bits}";
    if (time >= cues.s(36)) return "H(X)+H(Y)=1+0.97095=1.97095\\ \\mathrm{bits}";
    return "I(X;Y)=H(X)+H(Y)-H(X,Y)";
  }

  private contributionAt(index: number, value: number): string {
    const probabilities: readonly number[] = [0.3, 0.2, 0.1, 0.4];
    const contribution: number = value > 0 ? -value * Math.log2(value) : 0;
    const displayedValue: string = contribution.toFixed(5);
    return `${probabilities[index].toFixed(1)}\\log_2(1/${probabilities[index].toFixed(1)})\\approx${displayedValue}`;
  }

  private activeContribution(time: number, cues: Cues): number {
    for (let index = 0; index < 4; index++) {
      if (time >= cues.s(31 + index) && time < cues.s(32 + index)) return index;
    }
    return -1;
  }

  private mixTable(
    tables: readonly (readonly number[])[], original: number, independent: number, deterministic: number,
  ): readonly number[] {
    return tables[0].map((_value: number, index: number): number =>
      tables[0][index] * original + tables[1][index] * independent + tables[2][index] * deterministic,
    );
  }

  private mixVector(
    vectors: readonly (readonly number[])[], original: number, independent: number, deterministic: number,
  ): readonly number[] {
    return vectors[0].map((_value: number, index: number): number =>
      vectors[0][index] * original + vectors[1][index] * independent + vectors[2][index] * deterministic,
    );
  }

  private barGroupTitle(group: number, marginalPhase: number, rowPhase: number, columnPhase: number): string {
    if (marginalPhase > Math.max(rowPhase, columnPhase)) return group === 0 ? "p_X" : "p_Y";
    if (columnPhase > rowPhase) return group === 0 ? "Y=0" : "Y=1";
    return group === 0 ? "X=0" : "X=1";
  }

  private outcomeLabel(index: number, group: number, marginalPhase: number, rowPhase: number, columnPhase: number): string {
    if (marginalPhase > Math.max(rowPhase, columnPhase)) return `${group === 0 ? "X" : "Y"}=${index}`;
    if (columnPhase > rowPhase) return `X=${index}`;
    return `Y=${index}`;
  }

  private formatProbability(value: number): string {
    return Number(value.toFixed(2)).toString();
  }

  private formatConditional(value: number): string {
    if (Math.abs(value - 1 / 3) < 1e-8) return "1/3";
    if (Math.abs(value - 2 / 3) < 1e-8) return "2/3";
    return Number(value.toFixed(2)).toString();
  }
}

export function recapScene(): Scene {
  return new EntropyRecapScene();
}
