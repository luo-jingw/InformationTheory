import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface RulerVisual {readonly line:Polyline;readonly ticks:readonly Polyline[];readonly labels:readonly FormulaHandle[];readonly density:FormulaHandle;readonly entropy:FormulaHandle;readonly reveal:number;}

interface UniformVisual {
  readonly body: PanelMesh;
  readonly label: FormulaHandle;
}

export class DensityScaleScene implements Scene {
  readonly id = "c01-density";
  private title!: FormulaHandle;
  private readonly rulers:RulerVisual[]=[];
  private readonly uniforms: UniformVisual[] = [];
  private readonly axes: Polyline[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly grid: PanelMesh[] = [];
  private readonly gridLabels: FormulaHandle[] = [];
  private readonly formulas: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Differential entropy tracks density scale, not probability sign", 960, 100, 42);
    const rulers:ReadonlyArray<readonly[number,string,string,string,string,string,number]>=[
      [340,"centimeters","0 cm","1 cm","f_{cm}=1\\ {\\rm cm}^{-1}","h_{cm}=0\\quad\\text{bits}",1],
      [600,"meters","0 m",".01 m","f_m=100\\ {\\rm m}^{-1}","h_m=\\log_2(.01)=-6.643856\\quad\\text{bits}",2],
    ];
    for(const [y,unit,left,right,density,entropy,reveal] of rulers){
      const ticks:Polyline[]=[];
      for(let index=0;index<=10;index++)ticks.push(d.line([[410+110*index,y-10],[410+110*index,y+10]],Palette.axis,2));
      this.rulers.push({line:d.line([[410,y],[1510,y]],reveal===1?Palette.blue:Palette.purple,5),ticks,labels:[d.text(unit,250,y,30),d.text(left,410,y+40,25),d.text(right,1510,y+40,25)],density:d.tex(density,960,y+95,30,Palette.yellow),entropy:d.tex(entropy,960,y+150,31,reveal===1?Palette.blue:Palette.purple),reveal});
    }
    const base = 470;
    const examples: ReadonlyArray<readonly [number, number, number, string, string]> = [
      [390, 60, 300, "a=1/4", "h=−2 bits"],
      [850, 240, 75, "a=1", "h=0 bits"],
      [1310, 480, 37.5, "a=2", "h=1 bit"],
    ];
    for (const [x, width, height, label, entropy] of examples) {
      this.uniforms.push({
        body: d.rectangle(x, base - height / 2, width, height, "#334d69"),
        label: d.text(`${label}   ${entropy}`, x, base + 170, 25, Palette.text),
      });
    }
    this.axes.push(
      d.line([[240, base], [1680, base]], Palette.axis, 3),
      d.line([[240, 220], [240, base]], Palette.axis, 3),
    );
    this.labels.push(
      d.text("coordinate x (length units)", 960, 560, 24, Palette.muted),
      d.text("density f(x) (probability / length)", 960, 225, 23, Palette.muted),
      d.text("Area = 1; each example uses its own x-origin", 950, 275, 26, Palette.green),
      d.text("aligned quantization: a=2,  δ=.5", 960, 300, 32, Palette.blue),
      d.text("four equal-probability cells", 960, 370, 29, Palette.text),
    );
    for (let i = 0; i < 4; i++) {
      this.grid.push(d.rectangle(520 + 200 * i, 450, 194, 48, i % 2 === 0 ? "#25354d" : "#1d2a3d"));
      this.gridLabels.push(d.text("p=1/4", 520 + 200 * i, 450, 19, Palette.text));
    }
    this.formulas.push(
      d.tex("h(X)=-\\int f(x)\\log_2f(x)\\,dx", 960, 185, 34, Palette.yellow),
      d.tex("f(x)=1/a\\;\\text{ on }[0,a]\\quad\\Longrightarrow\\quad h(X)=\\log_2a", 960, 720, 31, Palette.yellow),
      d.tex("H(Q_\\Delta)=\\log_2(a/\\Delta)=h(X)+\\log_2(1/\\Delta)", 960, 650, 33, Palette.green),
      d.text("Exact here: uniform density and aligned cells", 960, 838, 22, Palette.muted),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const density = c.during(6, 28);
    const scale = c.during(23, 28);
    const quantized = c.p(28);
    const formula = c.p(9);
    const revealQuant = c.p(31);
    const conclusion = c.p(35);
    const opening=1-c.p(6);
    this.rulers.forEach((ruler:RulerVisual):void=>{const opacity=c.p(ruler.reveal)*opening;ruler.line.setOpacity(opacity);ruler.ticks.forEach((tick:Polyline):void=>tick.setOpacity(opacity));ruler.labels.forEach((label:FormulaHandle):void=>label.set({opacity}));ruler.density.set({opacity:c.p(2)*opening});ruler.entropy.set({opacity:c.p(3)*opening});});
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime<c.s(5)?"One physical distance, two rulers: did information change?":ctx.localTime<c.s(6)?"Units change density while physical probabilities stay fixed":quantized > 0.5 ? "Quantization adds the logarithm of inverse cell width" : scale > 0.5 ? "Changing coordinate units shifts differential entropy" : "Differential entropy tracks density scale, not probability sign");
    this.axes.forEach((line: Polyline): void => line.setOpacity(density));
    this.uniforms.forEach((item: UniformVisual, i: number): void => {
      const shown = c.p(11) * density;
      Diagram.show(item.body, shown);
      item.label.set({ opacity: c.p([17,16,15][i]) * density });
    });
    this.formulas[0].set({ opacity: formula, x: 960, y: 185 });
    this.formulas[1].set({ opacity: c.p(14) * density, x: 960, y: 720 });
    this.labels[0].set({ opacity: density });
    this.labels[1].set({ opacity: density });
    this.labels[2].set({ opacity: c.p(18) * density });
    this.labels[3].set({ opacity: quantized });
    this.labels[4].set({ opacity: revealQuant });
    this.grid.forEach((mesh: PanelMesh, i: number): void => {
      Diagram.show(mesh, revealQuant);
      this.gridLabels[i].set({ opacity: revealQuant });
    });
    this.formulas[2].set({ opacity: c.p(34), x: 960, y: 650 });
    this.formulas[3].set({ opacity: c.p(35), x: 960, y: 838 });
    if (conclusion > 0.5) this.title.setContent("Negative differential entropy reflects units and concentration");
  }

  teardown(_layers: SceneLayers): void {
    this.rulers.length=0;
    this.uniforms.length = 0;
    this.axes.length = 0;
    this.labels.length = 0;
    this.grid.length = 0;
    this.gridLabels.length = 0;
    this.formulas.length = 0;
  }
}

export function densityScaleScene(): Scene {
  return new DensityScaleScene();
}
