import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class FeedbackBoundaryScene implements Scene {
  readonly id="c05-feedback-boundary";
  private title!:FormulaHandle;
  private readonly nodes:PanelMesh[]=[];
  private readonly arrows:Polyline[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly equations:FormulaHandle[]=[];

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);
    this.title=d.text("Cover–Pombra compares feedback per real transmission",960,100,42);
    const xs=[430,720,1010,1300];
    const names=["X₁","Y₁","X₂","Y₂"];
    for(let i=0;i<4;i++){
      this.nodes.push(d.rectangle(xs[i],360,130,78,i%2===0?"#25354d":"#34412e"));
      this.labels.push(d.text(names[i],xs[i],360,28,Palette.text));
    }
    this.nodes.push(d.rectangle(1580,360,130,78,"#25354d"),d.rectangle(1780,360,130,78,"#301d2a"));
    this.labels.push(d.text("X₃",1580,360,28,Palette.text),d.text("future Y",1780,360,23,Palette.red));
    this.arrows.push(
      d.line([[495,360],[655,360],[635,343],[655,360],[635,377]],Palette.axis,3),
      d.line([[1075,360],[1235,360],[1215,343],[1235,360],[1215,377]],Palette.axis,3),
      d.line([[1645,360],[1715,360],[1695,343],[1715,360],[1695,377]],Palette.axis,3),
      d.line([[720,405],[720,475],[1010,475],[1010,405],[995,425],[1010,405],[1025,425]],Palette.orange,4),
      d.line([[1300,405],[1300,510],[1580,510],[1580,405],[1565,425],[1580,405],[1595,425]],Palette.orange,4),
    );
    this.labels.push(
      d.text("current input depends only on already observed outputs",960,260,21,Palette.orange),
      d.text("future output is not available",1690,315,20,Palette.red),
      d.text("expected average power over the block",960,585,24,Palette.yellow),
      d.text("real Gaussian Zⁿ independent of M; positive-definite covariance, possibly nonstationary",960,615,20,Palette.muted),
      d.text("Cover–Pombra (1989), p. 37; invoked finite-block comparison",960,842,19,Palette.muted),
    );
    this.equations.push(
      d.tex("X_i=f_i(M,Y^{i-1})\\quad\\text{(noiseless causal feedback)}",960,640,28,Palette.yellow),
      d.tex("\\frac1n\\sum_{i=1}^n\\mathbb E[X_i^2]\\le P",960,685,28,Palette.text),
      d.tex("C_n,C_{FB,n}:\\;\\text{block information divided by }n\\text{ uses}",960,720,24,Palette.text),
      d.tex("C_n\\le C_{FB,n}\\le\\min\\{2C_n,\\;C_n+1/2\\}",960,760,30,Palette.green),
      d.tex("\\text{bits per real transmission; not bits per second}",960,800,24,Palette.orange),
    );
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime);
    const model=c.p(0);
    const bound=c.p(11);
    const units=Math.max(c.p(18),c.p(32));
    const assumptions=Math.max(c.p(1),c.p(31));
    this.title.set({opacity:c.p(0)});
    this.title.setContent(bound>0.5&&ctx.localTime<c.s(18)?"Which units belong to this finite-block feedback comparison?":bound>0.5?"The finite-block half-bit term is a per-use comparison":"Causality lets past outputs influence the current input");
    this.nodes.forEach((mesh:PanelMesh):void=>Diagram.show(mesh,model));
    this.labels.slice(0,6).forEach((label:FormulaHandle):void=>label.set({opacity:model}));
    this.arrows.forEach((line:Polyline,i:number):void=>line.setOpacity(c.p(i<3?5:6)*model));
    this.labels[6].set({opacity:c.p(6)*model});
    this.labels[7].set({opacity:c.p(30)*model});
    this.labels[8].set({opacity:c.p(7)});
    this.labels[9].set({opacity:assumptions});
    this.labels[10].set({opacity:c.p(22)});
    this.equations[0].set({opacity:c.p(5)*model,x:960,y:640});
    this.equations[1].set({opacity:c.p(7)*model,x:960,y:685});
    this.equations[2].set({opacity:c.p(12)*bound,x:960,y:720});
    this.equations[3].set({opacity:c.p(16)*bound,x:960,y:760});
    this.equations[4].set({opacity:units,x:960,y:800});
  }

  teardown(_layers:SceneLayers):void{
    this.nodes.length=0;this.arrows.length=0;this.labels.length=0;this.equations.length=0;
  }
}

export function feedbackBoundaryScene():Scene{return new FeedbackBoundaryScene();}
