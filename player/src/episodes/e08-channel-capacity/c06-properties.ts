import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface SimplexPoint {
  readonly marker: PanelMesh;
  readonly input: FormulaHandle;
  readonly output: FormulaHandle;
}

interface ExampleCell {
  readonly mesh: PanelMesh;
  readonly value: FormulaHandle;
}

export class CapacityPropertiesScene implements Scene {
  readonly id = "c06-properties";
  private title!: FormulaHandle;
  private readonly triangle: Polyline[] = [];
  private readonly points: SimplexPoint[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly matrixLabels: FormulaHandle[] = [];
  private readonly formulas: FormulaHandle[] = [];
  private readonly cells: ExampleCell[] = [];
  private readonly uniquenessProof:FormulaHandle[]=[];
  private compact!:FormulaHandle;
  private readonly zeroRows: ExampleCell[] = [];
  private readonly zeroLabels: FormulaHandle[] = [];
  private zeroWeights!: FormulaHandle;
  private zeroMixture!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Capacity exists, while optimal inputs need not be unique", 960, 100, 42);
    this.triangle.push(
      d.line([[390,650],[820,650]], Palette.axis, 3),
      d.line([[820,650],[605,280]], Palette.axis, 3),
      d.line([[605,280],[390,650]], Palette.axis, 3),
    );
    this.labels.push(
      d.text("input simplex", 600, 225, 29, Palette.blue),
      d.text("(1,0,0)", 390, 690, 22, Palette.muted),
      d.text("(0,1,0)", 820, 690, 22, Palette.muted),
      d.text("(0,0,1)", 605, 250, 22, Palette.muted),
      d.text("different inputs, same optimal output", 1440, 340, 27, Palette.green),
      d.text("P_Y=(.5,.5)", 1450, 445, 25, Palette.yellow),
      d.text("output distribution is unique", 1450, 500, 24, Palette.text),
      d.text("input distribution can vary along this segment", 1350, 565, 23, Palette.muted),
      d.text("three input symbols", 1140, 230, 25, Palette.blue),
    );
    const pA: readonly [number, number] = [497.5, 464.5];
    const pB: readonly [number, number] = [712.5, 464.5];
    // The optimal set has P(X=3)=1/2; its split between inputs 1 and 2 is free.
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const x = pA[0] * (1 - t) + pB[0] * t;
      const y = pA[1] * (1 - t) + pB[1] * t;
      const marker = d.rectangle(x, y, 18, 18, i === 0 || i === 4 ? Palette.orange : Palette.green);
      this.points.push({ marker, input: d.text(i===0?"(1/2,0,1/2)":i===4?"(0,1/2,1/2)":"", x, y - 45, 24, Palette.text), output: d.text("(.5,.5)", 1480, 610 + i * 43, 20, Palette.green) });
    }
    this.formulas.push(
      d.tex("\\Delta_2=\\{p_i\\ge0,\\;\\sum_i p_i=1\\}", 570, 755, 28, Palette.yellow),
      d.tex("C\\le\\log_2\\min(|\\mathcal X|,|\\mathcal Y|)", 1120, 270, 27, Palette.yellow),
      d.tex("I(X;Y)=\\sum_x p_xD(W_x\\Vert P_Y)", 1180, 660, 27, Palette.green),
      d.tex("C=1\\;\\text{bit/use when }p_3=.5,\\;p_1+p_2=.5", 1250, 735, 25, Palette.yellow),
      d.text("If every row is identical, every input produces the same output law, so C=0", 1060, 805, 23, Palette.red),
    );
    this.compact=d.tex("\\Delta_2\\text{ compact},\\quad I(\\cdot,W)\\text{ continuous}\\Rightarrow\\text{maximum attained}",1340,450,29,Palette.green);
    this.zeroLabels.push(
      d.text("Two identical transition rows", 560, 225, 30, Palette.blue),
      d.text("y=0", 520, 310, 24, Palette.muted),
      d.text("y=1", 670, 310, 24, Palette.muted),
      d.text("x=0", 350, 390, 24, Palette.muted),
      d.text("x=1", 350, 495, 24, Palette.muted),
      d.text("Illustration; the proof applies to any two distinct rows", 560, 735, 22, Palette.muted),
    );
    for (let row = 0; row < 2; row++) {
      for (let column = 0; column < 2; column++) {
        const x = 520 + column * 150;
        const y = 390 + row * 105;
        this.zeroRows.push({
          mesh: d.rectangle(x, y, 120, 76, row === 0 ? "#203952" : "#493725"),
          value: d.text(column === 0 ? ".9" : ".1", x, y, 33, Palette.text),
        });
      }
    }
    this.zeroWeights = d.tex("P_X=(1/2,1/2)", 570, 665, 30, Palette.orange);
    this.zeroMixture = d.tex("R=(.55,.45)", 570, 610, 32, Palette.green);
    const proof:readonly string[]=[
      "I(P^*,W)=I(Q^*,W)=C,\\quad R^*\\ne S^*?",
      "P_\\lambda=\\lambda P^*+(1-\\lambda)Q^*,\\quad0<\\lambda<1",
      "R_\\lambda=\\lambda R^*+(1-\\lambda)S^*",
      "H(R_\\lambda)>\\lambda H(R^*)+(1-\\lambda)H(S^*)",
      "H(Y\\mid X)\\text{ is affine in the input law}",
      "I(P_\\lambda,W)>\\lambda C+(1-\\lambda)C=C",
      "\\text{Contradiction}\\Rightarrow R^*=S^*",
    ];
    for(let i=0;i<proof.length;i++)this.uniquenessProof.push(d.tex(proof[i],1330,230+i*90,i===1||i===3?29:33,i===5||i===6?Palette.yellow:Palette.text));
    this.matrixLabels.push(
      d.text("x₁", 955, 380, 21, Palette.muted), d.text("x₂", 955, 438, 21, Palette.muted), d.text("x₃", 955, 496, 21, Palette.muted),
      d.text("y₀", 1000, 345, 21, Palette.muted), d.text("y₁", 1090, 345, 21, Palette.muted),
    );
    const rows: ReadonlyArray<readonly [string, string]> = [["1", "0"], ["1", "0"], ["0", "1"]];
    for (let row = 0; row < rows.length; row++) {
      for (let col = 0; col < 2; col++) {
        const x = 1000 + col * 90;
        const y = 380 + row * 58;
        this.cells.push({ mesh: d.rectangle(x, y, 72, 44, rows[row][col] === "1" ? "#25354d" : Palette.panel), value: d.text(rows[row][col], x, y, 22, Palette.text) });
      }
    }
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const existence = c.during(0, 8);
    const zero = c.during(8, 20);
    const uniqueness = c.during(20,28);
    const example = c.p(29);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime>=c.s(28)&&ctx.localTime<c.s(29)?"Does a unique optimal output determine the input law?":example > 0.5 ? "A unique output law can come from many optimal input laws" : uniqueness > 0.5 ? "Strict entropy concavity fixes the optimal output" : zero > 0.5 ? "Capacity is zero exactly when all channel rows agree" : "A continuous information function has a maximum on the input simplex");
    this.triangle.forEach((line: Polyline): void => line.setOpacity(existence+example));
    this.points.forEach((point: SimplexPoint,i:number): void => {
      const visible = example;
      Diagram.show(point.marker, visible);
      point.input.set({ opacity: (i===0||i===4)?visible:0 });
      point.output.set({ opacity: 0 });
    });
    this.labels.forEach((label: FormulaHandle, i: number): void => {
      const visible = i <= 3 ? existence+example : example;
      label.set({ opacity: visible });
    });
    this.matrixLabels.forEach((label: FormulaHandle): void => label.set({ opacity: example }));
    this.formulas[0].set({ opacity: c.p(0) * (existence+example), x: 570, y: 755 });
    this.formulas[1].set({ opacity: c.p(7)*(1-uniqueness), x: 1120, y: 270 });
    this.formulas[2].set({ opacity: c.p(15)*zero, x: 1180, y: 660 });
    this.formulas[3].set({ opacity: example, x: 1250, y: 735 });
    this.formulas[4].set({ opacity: zero, x: 1060, y: 805 });
    this.compact.set({opacity:c.p(1)*existence});
    const distinctRows = ctx.localTime >= c.s(12);
    this.zeroLabels.forEach((label: FormulaHandle, index: number): void => {
      label.set({ opacity: zero * (index === 5 ? c.p(12) : 1) });
    });
    this.zeroLabels[0].setContent(distinctRows ? "Two distinct transition rows" : "Two identical transition rows");
    const zeroValues: readonly string[] = distinctRows ? [".9", ".1", ".2", ".8"] : [".9", ".1", ".9", ".1"];
    this.zeroRows.forEach((entry: ExampleCell, index: number): void => {
      Diagram.show(entry.mesh, zero);
      entry.value.setContent(zeroValues[index]);
      entry.value.set({ opacity: zero });
    });
    this.zeroWeights.set({ opacity: c.p(13) * zero });
    this.zeroMixture.set({ opacity: c.p(14) * zero });
    this.uniquenessProof.forEach((line:FormulaHandle,i:number):void=>line.set({opacity:c.p([20,21,22,24,25,26,27][i])*uniqueness}));
    this.cells.forEach((entry: ExampleCell): void => { Diagram.show(entry.mesh, example); entry.value.set({ opacity: example }); });
    if (ctx.localTime>=c.s(12) && zero > 0.5) {
      this.formulas[4].setContent("Two different rows with a positive input mixture give positive mutual information");
    } else {
      this.formulas[4].setContent("If every row is identical, every input produces the same output law, so C=0");
    }
  }

  teardown(_layers: SceneLayers): void {
    this.triangle.length = 0;
    this.points.length = 0;
    this.labels.length = 0;
    this.matrixLabels.length = 0;
    this.formulas.length = 0;
    this.cells.length = 0;
    this.uniquenessProof.length=0;
    this.zeroRows.length = 0;
    this.zeroLabels.length = 0;
  }
}

export function capacityPropertiesScene(): Scene {
  return new CapacityPropertiesScene();
}
