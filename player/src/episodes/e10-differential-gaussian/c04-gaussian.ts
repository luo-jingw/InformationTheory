import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class GaussianMaximumEntropyScene implements Scene {
  readonly id = "c04-gaussian";
  private title!: FormulaHandle;
  private readonly densityShapes: Polyline[] = [];
  private readonly gramShapes: Polyline[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly panels: PanelMesh[] = [];
  private readonly equations: FormulaHandle[] = [];
  private readonly gramProof:FormulaHandle[]=[];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("The matching Gaussian maximizes entropy by KL nonnegativity", 960, 100, 42);
    this.panels.push(d.rectangle(960, 395, 850, 385, "#131b2b"), d.rectangle(960, 760, 850, 145, "#131b2b"));
    this.panels.forEach((panel: PanelMesh): void => { panel.position.z = -0.1; });
    this.densityShapes.push(
      d.line(this.gaussianCurve(500, 490, 360, 350/Math.sqrt(2*Math.PI), 1), Palette.green, 4),
      d.line([[500-90*Math.sqrt(3),490],[500-90*Math.sqrt(3),490-350/(2*Math.sqrt(3))],[500+90*Math.sqrt(3),490-350/(2*Math.sqrt(3))],[500+90*Math.sqrt(3),490]], Palette.blue, 4),
    );
    this.labels.push(
      d.text("q=N(0,1): matching mean and variance", 500, 245, 25, Palette.green),
      d.text("f: uniform on [−√3,√3], same mean and variance", 500, 590, 24, Palette.blue),
      d.text("f-support", 455, 300, 21, Palette.muted),
      d.text("q mass outside f-support is not counted by ∫_{f>0}q", 960, 325, 22, Palette.orange),
      d.text("Gram vectors", 330, 465, 22, Palette.blue),
      d.text("orthogonal residual", 680, 465, 22, Palette.orange),
      d.text("all original lengths retained only at right angles", 1250, 625, 22, Palette.muted),
    );
    this.equations.push(
      d.tex("D(f\\Vert q)=\\int f\\log_2\\frac f q\\,dx", 1190, 390, 30, Palette.yellow),
      d.tex("t=q/f>0,\\quad -\\ln t\\ge1-t", 1190, 445, 28, Palette.text),
      d.tex("D_{\\ln}(f\\Vert q)\\ge1-\\int_{f>0}q\\,dx\\ge0", 1190, 500, 27, Palette.green),
      d.tex("-\\log_2q(x)=\\frac d2\\log_2(2\\pi)+\\frac12\\log_2\\det K+\\frac{(x-\\mu)^TK^{-1}(x-\\mu)}{2\\ln2}", 960, 650, 24, Palette.yellow),
      d.tex("\\mathbb E_f[(X-\\mu)^TK^{-1}(X-\\mu)]=\\mathrm{tr}(K^{-1}K)=d", 960, 700, 24, Palette.text),
      d.tex("h(X)\\le\\frac12\\log_2((2\\pi e)^d\\det K),\\quad =\\text{ iff }f=q\\;a.e.", 960, 550, 29, Palette.green),
      d.tex("\\det K\\le\\prod_iK_{ii};\\quad K\\succ0:\\text{ equality iff }K\\text{ diagonal}", 960, 790, 25, Palette.yellow),
      d.tex("K\\succeq0\\text{ singular: equality alone does not imply diagonal}", 960, 835, 24, Palette.orange),
    );
    const proof:readonly string[]=["K_{ij}=\\langle v_i,v_j\\rangle", "\\det K=\\prod_i\\|u_i\\|^2\\le\\prod_i\\|v_i\\|^2=\\prod_iK_{ii}", "K\\succ0:\\quad\\text{equality}\\iff v_i\\perp v_j\\ (i\\ne j)"];
    for(let i=0;i<proof.length;i++)this.gramProof.push(d.tex(proof[i],1250,330+i*100,i===1?28:33,Palette.green));
    this.gramShapes.push(
      d.line([[300,650],[520,650],[670,520],[450,520],[300,650]], Palette.blue, 3),
      d.line([[300,650],[450,650],[450,520]], Palette.orange, 3),
      d.line([[650,650],[810,650]], Palette.blue, 4),
      d.line([[650,650],[650,520]], Palette.orange, 4),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const divergence = c.during(0, 14);
    const gaussian = c.during(14, 30);
    const hadamard = c.p(30);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(hadamard > 0.5 ? "Hadamard's equality condition needs positive definiteness" : gaussian > 0.5 ? "The covariance fixes the Gaussian cross-entropy" : "Which density has more entropy at fixed covariance?");
    this.panels.forEach((panel: PanelMesh, i: number): void => Diagram.show(panel, i === 0 ? divergence + gaussian : hadamard));
    this.densityShapes.forEach((line: Polyline, i: number): void => line.setOpacity(c.p(i === 0 ? 2 : 0) * (1 - hadamard)));
    this.labels.forEach((label: FormulaHandle, i: number): void => {
      const visible = i === 0 ? c.p(2) * divergence
        : i === 1 ? divergence
          : i === 2 ? c.p(7) * divergence
            : i === 3 ? c.p(10) * divergence
              : hadamard;
      label.set({ opacity: visible });
    });
    this.equations[0].set({ opacity: c.p(4) * divergence, x: 1190, y: 390 });
    this.equations[1].set({ opacity: c.p(7) * divergence, x: 1190, y: 445 });
    this.equations[2].set({ opacity: c.p(11) * divergence, x: 1190, y: 500 });
    this.equations[3].set({ opacity: c.p(14) * gaussian, x: 960, y: 650 });
    this.equations[4].set({ opacity: c.p(20) * gaussian, x: 960, y: 700 });
    this.equations[5].set({ opacity: c.p(26) * gaussian, x: 960, y: 550 });
    this.equations[6].set({ opacity: c.p(31) * hadamard, x: 960, y: 710 });
    this.equations[7].set({ opacity: c.p(39) * hadamard, x: 960, y: 805 });
    this.equations[7].setContent("K=\\begin{pmatrix}0&0&0\\\\0&1&1/2\\\\0&1/2&1\\end{pmatrix}:\\quad\\det K=\\prod_i K_{ii}=0,\\quad K\\text{ is not diagonal}");
    this.gramProof.forEach((line:FormulaHandle,i:number):void=>line.set({opacity:c.p([32,35,37][i])*hadamard}));
    this.gramShapes.forEach((line: Polyline): void => line.setOpacity(hadamard));
  }

  teardown(_layers: SceneLayers): void {
    this.densityShapes.length = 0;
    this.gramShapes.length = 0;
    this.labels.length = 0;
    this.panels.length = 0;
    this.equations.length = 0;
    this.gramProof.length=0;
  }

  private gaussianCurve(cx: number, baseline: number, width: number, height: number, skew: number): ReadonlyArray<readonly [number, number]> {
    const points: Array<readonly [number, number]> = [];
    for (let i = 0; i <= 80; i++) {
      const u = -3 + 6 * i / 80;
      const x = cx + u * width / 4;
      const shifted = u * skew;
      const y = baseline - height * Math.exp(-0.5 * shifted * shifted);
      points.push([x, y]);
    }
    return points;
  }
}

export function gaussianMaximumEntropyScene(): Scene {
  return new GaussianMaximumEntropyScene();
}
