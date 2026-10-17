import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface MatrixEntry {
  readonly cell: PanelMesh;
  readonly value: FormulaHandle;
}

export class WeakSymmetryScene implements Scene {
  readonly id = "c04-symmetric";
  private title!: FormulaHandle;
  private readonly typewriter: MatrixEntry[] = [];
  private readonly typewriterLabels: FormulaHandle[] = [];
  private readonly arrows: Polyline[] = [];
  private readonly arrowLabels: FormulaHandle[] = [];
  private readonly counterexample: MatrixEntry[] = [];
  private readonly counterLabels: FormulaHandle[] = [];
  private readonly formulas: FormulaHandle[] = [];
  private counterResult!:FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Weak symmetry makes a uniform input optimal", 960, 100, 44);
    this.typewriterLabels.push(
      d.text("Four-symbol typewriter channel", 565, 205, 32, Palette.blue),
      d.text("output columns", 695, 250, 23, Palette.muted),
      d.text("x", 365, 300, 23, Palette.muted),
    );
    for (let row = 0; row < 4; row++) {
      this.typewriterLabels.push(d.text(String(row), 410, 340 + row * 82, 24, Palette.muted));
      for (let col = 0; col < 4; col++) {
        const x = 560 + col * 92;
        const y = 340 + row * 82;
        const value = col === row || col === (row + 1) % 4 ? ".5" : "0";
        this.typewriter.push({
          cell: d.rectangle(x, y, 76, 60, value === ".5" ? "#25354d" : Palette.panel),
          value: d.text(value, x, y, 25, Palette.text),
        });
      }
    }
    for (let col = 0; col < 4; col++) this.typewriterLabels.push(d.text(String(col), 560 + col * 92, 280, 22, Palette.muted));
    this.arrows.push(
      d.line([[420, 690], [535, 690], [515, 673], [535, 690], [515, 707]], Palette.green, 4),
      d.line([[420, 735], [535, 735], [515, 718], [535, 735], [515, 752]], Palette.green, 4),
    );
    this.arrowLabels.push(d.text("uniform input",300,690,22,Palette.green),d.text("uniform output",700,690,22,Palette.green),d.text("row entropy: 1 bit",280,735,20,Palette.muted),d.text("output entropy: 2 bits",700,735,20,Palette.muted));
    this.formulas.push(
      d.tex("H(Y)\u2264\\log_2 m,\\qquad H(Y\\mid X)=h_{row}", 1170, 330, 32, Palette.yellow),
      d.tex("P_X(x)=1/k\\;\\Longrightarrow\\;P_Y(y)=1/m", 1170, 405, 31, Palette.green),
      d.tex("\\sum_x W(y\\mid x)=k/m\\quad\\text{for every column}", 1170, 470, 28, Palette.text),
      d.tex("C=\\log_2 m-h_{row}=1\\;\\text{bit/use}", 1170, 525, 33, Palette.yellow),
      d.text("Equal row entropies alone are not enough", 1110, 610, 30, Palette.red),
    );
    this.counterResult=d.tex("C=0,\\quad h_{\\rm row}=h_2(.1)",1370,790,34,Palette.yellow);
    this.counterLabels.push(
      d.text("Counterexample: identical rows", 1360, 270, 28, Palette.red),
      d.text("y=0", 1250, 310, 21, Palette.muted), d.text("y=1", 1420, 310, 21, Palette.muted),
      d.text("x=0", 1130, 380, 21, Palette.muted), d.text("x=1", 1130, 490, 21, Palette.muted),
      d.text("column sums: 1.8 and .2", 1370, 700, 25, Palette.orange),
    );
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const x = 1250 + col * 170;
        const y = 380 + row * 110;
        this.counterexample.push({
          cell: d.rectangle(x, y, 130, 80, "#301d2a"),
          value: d.text(row === 0 ? (col === 0 ? ".9" : ".1") : (col === 0 ? ".9" : ".1"), x, y, 31, Palette.text),
        });
      }
    }
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const structure = c.p(0);
    const optimum = c.p(10)*(1-c.p(28));
    const counter = c.p(29);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime>=c.s(28)&&ctx.localTime<c.s(29)?"Are equal row entropies enough without balanced columns?":counter > 0.5 ? "Rows can have equal entropy while the channel carries no information" : optimum > 0.5 ? "Equal column sums make uniform input produce uniform output" : "Weak symmetry makes a uniform input optimal");
    this.typewriterLabels.forEach((label: FormulaHandle): void => label.set({ opacity: structure }));
    this.typewriter.forEach((entry: MatrixEntry): void => { Diagram.show(entry.cell, structure); entry.value.set({ opacity: structure }); });
    this.arrows.forEach((line: Polyline, i: number): void => line.setOpacity(c.p(i===0?24:25) * structure));
    this.arrowLabels.forEach((label:FormulaHandle,i:number):void=>label.set({opacity:c.p(i<2?24:25)*structure}));
    this.formulas[0].set({ opacity: c.p(6)*(1-counter), x: 1170, y: 330 });
    this.formulas[1].set({ opacity: c.p(12)*(1-counter), x: 1170, y: 405 });
    this.formulas[2].set({ opacity: c.p(11)*(1-counter), x: 1170, y: 470 });
    this.formulas[3].set({ opacity: c.p(16)*(1-counter), x: 1170, y: 525 });
    this.formulas[3].setContent(ctx.localTime>=c.s(26)?"C=\\log_2m-h_{\\rm row}=1\\text{ bit/use}":"C=\\log_2m-h_{\\rm row},\\quad k=|\\mathcal X|,\\ m=|\\mathcal Y|");
    this.formulas[4].set({ opacity: counter, x: 1390, y: 610 });
    this.counterLabels.forEach((label: FormulaHandle, i: number): void => {
      if (i === 5) label.set({ opacity: counter, x: 1370 });
      else label.set({ opacity: counter });
    });
    this.counterResult.set({opacity:c.p(29)});
    this.counterexample.forEach((entry: MatrixEntry): void => { Diagram.show(entry.cell, counter); entry.value.set({ opacity: counter }); });
  }

  teardown(_layers: SceneLayers): void {
    this.typewriter.length = 0;
    this.typewriterLabels.length = 0;
    this.arrows.length = 0;
    this.arrowLabels.length = 0;
    this.counterexample.length = 0;
    this.counterLabels.length = 0;
    this.formulas.length = 0;
  }
}

export function weakSymmetryScene(): Scene {
  return new WeakSymmetryScene();
}
