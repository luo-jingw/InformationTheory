import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class BecCapacityScene implements Scene {
  readonly id = "c03-bec";
  private title!: FormulaHandle;
  private openingAnswer!:FormulaHandle;
  private input!: PanelMesh;
  private inputLabel!: FormulaHandle;
  private readonly outputs: PanelMesh[] = [];
  private readonly outputLabels: FormulaHandle[] = [];
  private readonly branches: Polyline[] = [];
  private readonly branchLabels: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];
  private readonly axes: Polyline[] = [];
  private readonly curves: Polyline[] = [];
  private readonly plotLabels: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("An erasure is an explicit unknown, not a wrong bit", 960, 100, 44);
    this.openingAnswer=d.tex("",500,800,29,Palette.yellow);
    this.input = d.rectangle(400, 330, 140, 100, "#203952");
    this.inputLabel = d.text("X", 400, 330, 38, Palette.text);
    const outputPositions: ReadonlyArray<readonly [number, string, string]> = [
      [1030, "Y=X", Palette.orange], [1460, "⊥", Palette.purple],
    ];
    for (const [x, text, color] of outputPositions) {
      this.outputs.push(d.rectangle(x, 330, 170, 100, color===Palette.orange?"#493725":"#332a49"));
      this.outputLabels.push(d.text(text, x, 330, 35, Palette.text));
    }
    this.branches.push(
      d.line([[470,330],[945,330],[925,312],[945,330],[925,348]],Palette.green,4),
      d.line([[470,360],[650,420],[1460,420],[1460,380],[1442,400],[1460,380],[1478,400]],Palette.purple,4),
    );
    this.branchLabels.push(
      d.tex("1-\\varepsilon", 680, 295, 28, Palette.green),
      d.tex("\\varepsilon", 850, 465, 28, Palette.purple),
    );
    this.equations.push(
      d.tex("Y\\in\\{0,1,\\perp\\}", 480, 230, 34, Palette.yellow),
      d.tex("H(X\\mid Y)=\\varepsilon H(X)", 960, 535, 39, Palette.yellow),
      d.tex("I(X;Y)=H(X)-H(X\\mid Y)=(1-\\varepsilon)H(X)", 960, 605, 34, Palette.green),
      d.tex("C_{BEC}=1-\\varepsilon\\quad\\text{bits/use}", 960, 675, 39, Palette.yellow),
      d.tex("C_{BSC}=1-h_2(\\varepsilon)\\quad\\text{(different output law)}", 960, 735, 30, Palette.blue),
    );
    const plot = { left: 1030, right: 1730, top: 300, bottom: 700 };
    const xAt = (e: number): number => plot.left + (plot.right - plot.left) * e;
    const yAt = (v: number): number => plot.bottom - (plot.bottom - plot.top) * v;
    this.axes.push(
      d.line([[plot.left, plot.bottom], [plot.right, plot.bottom]], Palette.axis, 3),
      d.line([[plot.left, plot.bottom], [plot.left, plot.top]], Palette.axis, 3),
    );
    const bec: Array<readonly [number, number]> = [];
    const bsc: Array<readonly [number, number]> = [];
    for (let i = 0; i <= 60; i++) {
      const epsilon = i / 60;
      bec.push([xAt(epsilon), yAt(1 - epsilon)]);
      const h = epsilon === 0 || epsilon === 1 ? 0 : -epsilon * Math.log2(epsilon) - (1 - epsilon) * Math.log2(1 - epsilon);
      bsc.push([xAt(epsilon), yAt(1 - h)]);
    }
    this.curves.push(d.line(bec, Palette.green, 5), d.line(bsc, Palette.blue, 4));
    this.plotLabels.push(
      d.text("ε (erasure / flip probability)", 1380, 765, 25, Palette.muted),
      d.text("bits/use", 980, 260, 22, Palette.muted),
      d.text("BEC  1−ε", 1170, 330, 25, Palette.green),
      d.text("BSC  1−h₂(ε)", 1530, 500, 25, Palette.blue),
      d.text("0", plot.left, 720, 21, Palette.muted), d.text("1", plot.right, 720, 21, Palette.muted),
      d.text("0", 1000, plot.bottom, 19, Palette.muted), d.text("1", 1000, plot.top, 19, Palette.muted),
    );

  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const branch = c.during(0, 9);
    const formulas = c.during(5, 14);
    const comparison = c.p(14);
    const endpoints = c.p(20);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime>=c.s(23)?"More marked blanks can preserve more information":ctx.localTime>=c.s(22)?"Return to the opening choice: A or B?":comparison > 0.5 ? "The erasure marker tells the receiver what remains unknown" : formulas > 0.5 ? "Average the known and erased cases" : "An erasure is an explicit unknown, not a wrong bit");
    Diagram.show(this.input, branch);
    this.inputLabel.set({ opacity: branch });
    this.outputs.forEach((mesh: PanelMesh): void => Diagram.show(mesh, c.p(2) * branch));
    this.outputLabels.forEach((label: FormulaHandle): void => label.set({ opacity: c.p(2) * branch }));
    this.branches.forEach((line: Polyline, i: number): void => line.setOpacity(c.p(i === 0 ? 2 : 3) * branch));
    this.branchLabels.forEach((label: FormulaHandle, i: number): void => label.set({ opacity: c.p(i === 0 ? 2 : 3) * branch }));
    this.equations.forEach((equation: FormulaHandle, i: number): void => equation.set({ opacity: i === 0 ? c.p(0) : i === 1 ? c.p(8) : i === 2 ? c.p(9) : i === 3 ? c.p(12) : comparison, x:i===4?1380:500, y:[230,450,560,690,230][i] }));
    this.openingAnswer.set({opacity:c.p(22)});
    this.openingAnswer.setContent(ctx.localTime<c.s(23)?"A:\\ p=.10\\quad B:\\ \\varepsilon=.40\\quad C_A\\ ?\\ C_B":"C_A=.5310044<C_B=.6000000\\quad\\text{bits/use}");
    this.equations[2].setContent("I(X;Y)=H(X)-\\varepsilon H(X)=(1-\\varepsilon)H(X)");
    this.axes.forEach((line: Polyline): void => line.setOpacity(comparison));
    this.curves.forEach((line: Polyline): void => line.setOpacity(comparison));
    this.plotLabels.forEach((label: FormulaHandle, i: number): void => label.set({ opacity: comparison * (i < 3 ? 1 : endpoints) }));

  }

  teardown(_layers: SceneLayers): void {
    this.outputs.length = 0;
    this.outputLabels.length = 0;
    this.branches.length = 0;
    this.branchLabels.length = 0;
    this.equations.length = 0;
    this.axes.length = 0;
    this.curves.length = 0;
    this.plotLabels.length = 0;
  }
}

export function becCapacityScene(): Scene {
  return new BecCapacityScene();
}
