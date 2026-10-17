import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class JacobianScene implements Scene {
  readonly id = "c02-transform";
  private title!: FormulaHandle;
  private readonly shapes: PanelMesh[] = [];
  private readonly grids: Polyline[] = [];
  private readonly arrows: Polyline[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A Jacobian changes density by changing local volume", 960, 100, 42);
    this.shapes.push(
      d.rectangle(430, 385, 190, 150, "#25354d"),
      d.rectangle(930, 385, 380, 150, "#3c342b"),
    );
    for (let i = 1; i < 4; i++) {
      this.grids.push(d.line([[335 + i * 47.5,310],[335 + i * 47.5,460]], Palette.blue, 2));
      this.grids.push(d.line([[335,310 + i * 37.5],[525,310 + i * 37.5]], Palette.blue, 2));
      this.grids.push(d.line([[740 + i * 95,310],[740 + i * 95,460]], Palette.orange, 2));
      this.grids.push(d.line([[740,310 + i * 37.5],[1120,310 + i * 37.5]], Palette.orange, 2));
    }
    this.arrows.push(d.line([[560,385],[725,385],[704,368],[725,385],[704,402]], Palette.yellow, 4));
    this.labels.push(
      d.text("x-space: unit area", 430, 275, 26, Palette.blue),
      d.text("u=g(x): twice the width", 930, 275, 26, Palette.orange),
      d.text("same probability mass", 690, 500, 22, Palette.text),
      d.text("joint density exists for (X,Y)", 960, 580, 27, Palette.green),
      d.text("transform X and Y separately", 960, 625, 25, Palette.muted),
    );
    this.equations.push(
      d.tex("f_U(g(x))=\\frac{f_X(x)}{|\\det J_g(x)|}", 960, 655, 34, Palette.yellow),
      d.tex("h(g(X))=h(X)+\\mathbb E\\log_2|\\det J_g(X)|", 960, 710, 31, Palette.green),
      d.tex("g(x)=cx\\quad\\Longrightarrow\\quad h(cX)=h(X)+d\\log_2|c|", 960, 765, 29, Palette.yellow),
      d.tex("I(X;Y)=h(X)+h(Y)-h(X,Y)", 960, 610, 31, Palette.blue),
      d.tex("+J_X +J_Y - (J_X+J_Y)=0", 960, 815, 28, Palette.orange),
      d.text("Invertible maps and finite entropy differences; no claim for many-to-one maps", 960, 845, 21, Palette.muted),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const map = c.p(0);
    const mi = c.p(15);
    const caution = c.p(29);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(mi > 0.5 ? ctx.localTime<c.s(20)?"Which Jacobian corrections survive in mutual information?":"Separate invertible changes cancel inside mutual information" : "A Jacobian changes density by changing local volume");
    this.shapes.forEach((mesh: PanelMesh, i: number): void => Diagram.show(mesh, c.p(i === 0 ? 0 : 12) * map));
    this.grids.forEach((line: Polyline, i: number): void => line.setOpacity(c.p(i % 4 < 2 ? 0 : 12) * map));
    this.arrows.forEach((line: Polyline): void => line.setOpacity(c.p(5) * map));
    this.labels[0].set({ opacity: c.p(0) * map });
    this.labels[1].set({ opacity: c.p(12) * map });
    this.labels[2].set({ opacity: c.p(13) * map });
    this.labels[3].set({ opacity: c.p(15)*mi,x:1470,y:400 });
    this.labels[4].set({ opacity: c.p(15)*mi,x:1470,y:475 });
    this.equations[0].set({ opacity: c.p(7), x: 960, y: 655 });
    this.equations[1].set({ opacity: c.p(11), x: 960, y: 710 });
    this.equations[2].set({ opacity: c.p(13), x: 960, y: 765 });
    this.equations[3].set({ opacity:c.p(19)*mi,x:1470,y:565,scale:.8 });
    this.equations[4].set({ opacity: c.p(20) * mi, x: 960, y: 815 });
    this.equations[5].set({ opacity: caution, x: 960, y: 845 });
    this.equations[5].setContent(ctx.localTime >= c.s(22)
      ? "Density-ratio Jacobians cancel without subtracting infinite entropies"
      : "Invertible maps and finite entropy differences; no claim for many-to-one maps");
  }

  teardown(_layers: SceneLayers): void {
    this.shapes.length = 0;
    this.grids.length = 0;
    this.arrows.length = 0;
    this.labels.length = 0;
    this.equations.length = 0;
  }
}

export function jacobianScene(): Scene {
  return new JacobianScene();
}
