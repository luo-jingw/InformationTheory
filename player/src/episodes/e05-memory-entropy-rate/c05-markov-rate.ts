import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../../episodes/e01-entropy-information/lib/Diagram";

interface MatrixCell {
  readonly mesh: PanelMesh;
  readonly value: FormulaHandle;
}

export class MarkovEntropyRateScene implements Scene {
  readonly id = "c05-markov-rate";
  private title!: FormulaHandle;
  private readonly cells: MatrixCell[] = [];
  private readonly stateNodes: PanelMesh[] = [];
  private readonly stateLabels: FormulaHandle[] = [];
  private readonly stateWeightLabels: FormulaHandle[] = [];
  private readonly flows: Polyline[] = [];
  private readonly rowEntropyBars: PanelMesh[] = [];
  private readonly weightedBars: PanelMesh[] = [];
  private readonly formulas: FormulaHandle[] = [];
  private note!: FormulaHandle;
  private readonly rowLabels: FormulaHandle[] = [];
  private readonly flowLabels: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A stationary Markov source averages row uncertainty", 960, 100, 43);
    const matrixValues = ["0.9", "0.1", "0.3", "0.7"];
    const colors = [Palette.blue, Palette.orange, Palette.purple, Palette.green];
    for (let i = 0; i < 4; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 330 + col * 155;
      const y = 360 + row * 115;
      this.cells.push({ mesh: d.rectangle(x, y, 120, 82, colors[i]), value: d.text(matrixValues[i], x, y, 37, Palette.text) });
    }
    this.formulas.push(
      d.tex("P=\\begin{pmatrix}0.9&0.1\\\\0.3&0.7\\end{pmatrix}", 405, 240, 38, Palette.yellow),
      d.tex("\\pi=(a,1-a),\\qquad \\pi P=\\pi", 430, 520, 33, Palette.text),
      d.tex("a=0.9a+0.3(1-a)\\Rightarrow 0.4a=0.3", 480, 585, 31, Palette.yellow),
      d.tex("\\pi=(0.75,0.25)", 460, 650, 37, Palette.green),
    );
    this.stateNodes.push(d.rectangle(830, 345, 145, 100, Palette.blue), d.rectangle(1190, 345, 145, 100, Palette.purple));
    this.stateLabels.push(d.tex("0", 830, 345, 32), d.tex("1", 1190, 345, 32));
    this.stateWeightLabels.push(d.tex("\\pi_0=0.75",830,440,26),d.tex("\\pi_1=0.25",1190,440,26));
    this.flows.push(
      d.line([[905,320],[1115,320],[1095,307],[1115,320],[1095,333]],Palette.orange,4),
      d.line([[1115,390],[905,390],[925,377],[905,390],[925,403]],Palette.green,4),
    );
    this.flowLabels.push(
      d.tex("\\pi_0P_{00}=0.675,\\quad\\pi_0P_{01}=0.075",1010,510,27,Palette.orange),
      d.tex("\\pi_1P_{10}=0.075,\\quad\\pi_1P_{11}=0.175",1010,575,27,Palette.green),
    );
    this.rowLabels.push(
      d.tex("H_2(0.1)=0.4690", 1470, 330, 31, Palette.blue),
      d.tex("H_2(0.3)=0.8813", 1470, 455, 31, Palette.purple),
    );
    for (let i = 0; i < 2; i++) {
      this.rowEntropyBars.push(d.rectangle(1500, 390 + i * 130, 65, 1, i === 0 ? Palette.blue : Palette.purple));
      this.weightedBars.push(d.rectangle(1690, 390 + i * 130, 65, 1, i === 0 ? Palette.blue : Palette.purple));
    }
    this.formulas.push(
      d.tex("\\bar H=\\sum_i\\pi_i H(P_i)", 1425, 620, 35, Palette.yellow),
      d.tex("0.75(0.46899559)+0.25(0.88129090)\\approx0.57206942", 1440, 690, 25, Palette.yellow),
      d.tex("H(0.75)=0.81127812\\text{ bits}", 1430, 755, 31, Palette.text),
    );
    this.note = d.text("Stationary flow into each state equals its stationary mass", 960, 815, 26, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const matrix = c.during(0, 5);
    const balance = c.during(5, 20);
    const rows = c.during(20, 30);
    const combine = c.p(24);
    const chain = c.p(31);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(chain > 0.5 ? "The chain rule turns row entropy into block entropy" : rows > 0.5 ? "Weight each row entropy by stationary state frequency" : "A stationary Markov source averages row uncertainty");
    this.cells.forEach((cell: MatrixCell): void => {
      Diagram.show(cell.mesh, matrix + balance * 0.55 + rows * 0.25);
      cell.value.set({ opacity: matrix + balance * 0.55 + rows * 0.25 });
    });
    this.formulas[0].set({ opacity: matrix + balance * 0.6 + rows * 0.25 });
    this.formulas[1].set({ opacity: balance, y:550 });
    this.formulas[2].set({ opacity: c.p(7) * balance, y:615 });
    this.formulas[3].set({ opacity: c.p(10) * balance, y:680 });
    this.stateNodes.forEach((node: PanelMesh): void => Diagram.show(node, balance + rows * 0.25));
    this.stateLabels.forEach((label: FormulaHandle): void => label.set({opacity:balance+rows*.25}));
    this.stateWeightLabels.forEach((label:FormulaHandle):void=>label.set({opacity:c.p(12)*(balance+rows*.25)}));
    this.flows.forEach((line: Polyline, i: number): void => line.setOpacity(c.p(i === 0 ? 13 : 15) * balance));
    this.flowLabels.forEach((label: FormulaHandle,i: number): void => label.set({opacity:c.p(i===0?13:15)*balance}));
    this.rowLabels.forEach((label: FormulaHandle, i: number): void => label.set({ opacity: c.p(i === 0 ? 21 : 23) * rows }));
    this.rowEntropyBars.forEach((bar: PanelMesh, i: number): void => {
      const height = (i === 0 ? 0.46899559 : 0.8812909) * 100;
      Diagram.bar(bar, 1500, 430 + i * 130, height, rows);
    });
    this.weightedBars.forEach((bar: PanelMesh, i: number): void => {
      const weighted = (i === 0 ? 0.75 * 0.46899559 : 0.25 * 0.8812909) * 100;
      Diagram.bar(bar, 1690, 430 + i * 130, weighted, rows * c.p(i === 0 ? 24 : 25));
    });
    this.formulas[4].setContent(chain>0.5?"H(X^n)=\\sum_{i=1}^nH(X_i\\mid X^{i-1})":"\\bar H=\\sum_i\\pi_iH(P_i)");
    this.formulas[4].set({ opacity: rows + chain, x: chain>.5?960:1430, y: chain>.5?400:620 });
    this.formulas[5].set({ opacity: combine, x: chain>.5?960:1480, y: chain>.5?525:690, scale: 1 });
    this.formulas[6].set({ opacity: c.p(29) * rows + chain, x: chain>.5?960:1440, y: chain>.5?650:755 });
    this.formulas[5].setContent(chain > 0.5
      ? ctx.localTime >= c.s(34) ? "H(X^n)=H(\\pi)+(n-1)\\bar H" : "H(X^n)=H(\\pi)+\\sum_{i=2}^n H(X_i\\mid X_{i-1})"
      : ctx.localTime < c.s(25) ? "0.75(0.46899559)+\\ ?" : ctx.localTime < c.s(26) ? "0.75(0.46899559)+0.25(0.88129090)=?" : "0.75(0.46899559)+0.25(0.88129090)\\approx0.57206942");
    this.formulas[6].setContent(chain > 0.5
      ? ctx.localTime >= c.s(35) ? "\\lim_{n\\to\\infty}H(X^n)/n=0.57206942" : "H(X_1)=H(\\pi),\\quad H(X_i\\mid X_{i-1})=\\bar H\\ (i>1)"
      : "H_2(0.75)=0.81127812\\quad>\\quad\\bar H");
    this.note.set({ opacity: c.p(30), x: chain > 0.5 ? 960 : 1480, y: chain > 0.5 ? 815 : 810 });
    this.note.setContent(chain > 0.5
      ? "Stationarity supplies the same row-entropy average at every later step"
      : "The marginal entropy is larger because the current state predicts the next");
  }

  teardown(_layers: SceneLayers): void {
    this.cells.length = 0;
    this.stateNodes.length = 0;
    this.stateLabels.length = 0;
    this.stateWeightLabels.length = 0;
    this.flows.length = 0;
    this.rowEntropyBars.length = 0;
    this.weightedBars.length = 0;
    this.formulas.length = 0;
    this.rowLabels.length = 0;
    this.flowLabels.length = 0;
  }
}

export function markovEntropyRateScene(): Scene {
  return new MarkovEntropyRateScene();
}
