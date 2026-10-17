import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface BscCell {
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
}

export class BscCapacityScene implements Scene {
  readonly id = "c02-bsc";
  private title!: FormulaHandle;
  private readonly cells: BscCell[] = [];
  private readonly matrixLabels: FormulaHandle[] = [];
  private readonly curves: Polyline[] = [];
  private readonly axes: Polyline[] = [];
  private readonly plotLabels: FormulaHandle[] = [];
  private readonly formulas: FormulaHandle[] = [];
  private fairMarker!: Polyline;
  private readonly noisePaths: Polyline[] = [];
  private readonly inputBits: PanelMesh[] = [];
  private readonly outputBits: PanelMesh[] = [];
  private readonly bitLabels:FormulaHandle[]=[];
  private invertibleMapping!:FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Input bias changes output entropy, but not channel noise entropy", 960, 100, 42);
    this.matrixLabels.push(
      d.text("BSC(p=.1)", 420, 220, 31, Palette.blue),
      d.text("y=0", 545, 275, 23, Palette.muted), d.text("y=1", 680, 275, 23, Palette.muted),
      d.text("x=0", 330, 345, 23, Palette.muted), d.text("x=1", 330, 445, 23, Palette.muted),
    );
    const values = [".9", ".1", ".1", ".9"];
    for (let i = 0; i < 4; i++) {
      const x = 545 + (i % 2) * 135;
      const y = 345 + Math.floor(i / 2) * 100;
      this.cells.push({ mesh: d.rectangle(x, y, 105, 72, Palette.panel), label: d.text(values[i], x, y, 31, Palette.text) });
    }
    this.inputBits.push(d.rectangle(330,520,110,48,Palette.blue),d.rectangle(330,580,110,48,Palette.orange));
    this.outputBits.push(d.rectangle(760,520,110,48,Palette.blue),d.rectangle(760,580,110,48,Palette.orange));
    for(const x of [330,760])for(const bit of [0,1])this.bitLabels.push(d.text(String(bit),x,520+bit*60,31,"#102237"));
    this.invertibleMapping=d.text("p=1: every bit flips",545,640,24,Palette.yellow);
    this.noisePaths.push(
      d.line([[385,520],[705,580],[685,563],[705,580],[680,586]], Palette.blue, 3),
      d.line([[385,580],[705,520],[680,514],[705,520],[685,537]], Palette.orange, 3),
    );
    this.formulas.push(
      d.tex("Y=X\\oplus N,\\quad N\\sim\\mathrm{Bernoulli}(p),\\quad N\\perp X", 520, 675, 27, Palette.yellow),
      d.tex("P(Y=1)=p+(1-2p)a", 520, 730, 30, Palette.text),
      d.tex("I(a)=h_2(p+(1-2p)a)-h_2(p)", 520, 785, 31, Palette.green),
      d.tex("C=1-h_2(p)=0.5310044\\text{ bits/use at }p=.1", 1180, 280, 27, Palette.yellow),
      d.tex("C(0)=1,\\quad C(1/2)=0,\\quad C(1)=1", 1180, 810, 27, Palette.text),
    );
    const plot = { left: 1040, right: 1710, top: 355, bottom: 700 };
    const xAt = (a: number): number => plot.left + (plot.right - plot.left) * a;
    const yAt = (v: number): number => plot.bottom - (plot.bottom - plot.top) * v;
    this.axes.push(
      d.line([[plot.left, plot.bottom], [plot.right, plot.bottom]], Palette.axis, 3),
      d.line([[plot.left, plot.bottom], [plot.left, plot.top]], Palette.axis, 3),
    );
    this.plotLabels.push(
      d.text("a=P(X=1)", 1375, 770, 25, Palette.muted),
      d.text("bits/use", 970, 300, 23, Palette.muted),
      d.text("0", plot.left, 725, 21, Palette.muted), d.text("1/2", xAt(0.5), 725, 21, Palette.muted), d.text("1", plot.right, 725, 21, Palette.muted),
      d.text("I(X;Y)", 1120, 330, 22, Palette.green),
      d.text("H(Y)", 1305, 330, 22, Palette.blue),
      d.text("H(Y|X)=h₂(.1)", 1480, 330, 22, Palette.orange),
      d.text("0", 1015, plot.bottom, 19, Palette.muted), d.text(".5", 1015, yAt(0.5), 19, Palette.muted),
      d.text("1", 1015, plot.top, 19, Palette.muted),
    );
    const information: Array<readonly [number, number]> = [];
    const outputEntropy: Array<readonly [number, number]> = [];
    const noiseEntropy: Array<readonly [number, number]> = [];
    const hb = this.binaryEntropy(0.1);
    for (let i = 0; i <= 80; i++) {
      const a = i / 80;
      const hy = this.binaryEntropy(0.1 + 0.8 * a);
      information.push([xAt(a), yAt(hy - hb)]);
      outputEntropy.push([xAt(a), yAt(hy)]);
      noiseEntropy.push([xAt(a), yAt(hb)]);
    }
    this.curves.push(
      d.line(information, Palette.green, 5),
      d.line(outputEntropy, Palette.blue, 4),
      d.line(noiseEntropy, Palette.orange, 3),
    );
    this.fairMarker = d.line([[xAt(0.5), plot.top], [xAt(0.5), plot.bottom]], Palette.yellow, 2);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const diagram = c.p(0);
    const graph = c.p(4);
    const fair = c.p(12);
    const edgeCases = c.p(17);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime>=c.s(23)?"The receiver can undo a known invertible flip":ctx.localTime>=c.s(22)?"Every bit flips: does dependence remain?":edgeCases > 0.5 ? "Copying and randomizing are different endpoint channels" : fair > 0.5 ? "Fair input reaches the output-entropy ceiling" : graph > 0.5 ? "The mutual-information curve peaks at a fair input" : "Input bias changes output entropy, but not channel noise entropy");
    this.matrixLabels.forEach((label: FormulaHandle): void => label.set({ opacity: diagram }));
    this.cells.forEach((cell: BscCell): void => { Diagram.show(cell.mesh, diagram); cell.label.set({ opacity: diagram }); });
    this.inputBits.forEach((mesh:PanelMesh):void=>Diagram.show(mesh,c.p(22)));
    this.outputBits.forEach((mesh:PanelMesh):void=>Diagram.show(mesh,c.p(22)));
    this.bitLabels.forEach((label:FormulaHandle):void=>label.set({opacity:c.p(22)}));
    this.invertibleMapping.set({opacity:c.p(22)});
    this.invertibleMapping.setContent(ctx.localTime<c.s(23)?"p=1: every bit flips":"Known flip: invert again to recover X");
    this.noisePaths.forEach((line:Polyline):void=>line.setOpacity(c.p(22)));
    this.formulas[0].set({ opacity: c.p(2) * diagram, x: 560, y: 675 });
    this.formulas[1].set({ opacity: c.p(6) * graph, x: 520, y: 730 });
    this.formulas[2].set({ opacity: c.p(9) * graph, x: 520, y: 785 });
    this.formulas[3].set({ opacity: c.p(15), x: 1370, y: 280 });
    this.formulas[4].set({ opacity: edgeCases, x: 1370, y: 810 });
    this.formulas[4].setContent(ctx.localTime>=c.s(24)?"C(0)=1,\\quad C(1/2)=0,\\quad C(1)=1":ctx.localTime>=c.s(22)?"p=1:\\quad C=?":ctx.localTime>=c.s(21)?"C(0)=1,\\quad C(1/2)=0":ctx.localTime>=c.s(19)?"p=1/2:\\quad C=?":"p=0:\\quad C=1");
    this.axes.forEach((line: Polyline): void => line.setOpacity(graph));
    this.curves.forEach((line: Polyline): void => line.setOpacity(graph));
    this.fairMarker.setOpacity(fair);
    this.plotLabels.forEach((label: FormulaHandle): void => label.set({ opacity: graph }));
  }

  teardown(_layers: SceneLayers): void {
    this.bitLabels.length=0;
    this.cells.length = 0;
    this.matrixLabels.length = 0;
    this.curves.length = 0;
    this.axes.length = 0;
    this.plotLabels.length = 0;
    this.formulas.length = 0;
    this.noisePaths.length = 0;
    this.inputBits.length = 0;
    this.outputBits.length = 0;
  }

  private binaryEntropy(p: number): number {
    if (p <= 0 || p >= 1) return 0;
    return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  }
}

export function bscCapacityScene(): Scene {
  return new BscCapacityScene();
}
