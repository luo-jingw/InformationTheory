import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProbabilityBar {mesh:PanelMesh;value:FormulaHandle;label:FormulaHandle;x:number;}
interface ProofLine {label:FormulaHandle;sentence:number;}

export class EstimationScene implements Scene {
  readonly id="c05-estimation";
  private title!:FormulaHandle;
  private decision!:FormulaHandle;
  private readonly bars:ProbabilityBar[]=[];
  private readonly groupLabels:FormulaHandle[]=[];
  private bayes!:FormulaHandle;
  private evidence!:FormulaHandle;
  private readonly entropySegments:PanelMesh[]=[];
  private readonly entropyLabels:FormulaHandle[]=[];
  private readonly fano:ProofLine[]=[];
  private bound!:FormulaHandle;
  private readonly sharpBars:PanelMesh[]=[];
  private readonly sharpLabels:FormulaHandle[]=[];
  private boundary!:FormulaHandle;
  private readonly callback:FormulaHandle[]=[];

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);
    this.title=d.text("MAP minimizes probability of error under zero-one loss",960,100,45);
    this.decision=d.tex("\\widehat\\theta_{\\rm MAP}(x)\\in\\arg\\max_\\theta P(\\Theta=\\theta\\mid X=x)",960,230,41,Palette.yellow);
    const centers=[285,735,1185,1635],colors=[Palette.blue,Palette.orange,Palette.green,Palette.purple];
    for(let group=0;group<4;group++){
      this.groupLabels.push(d.tex(["P_\\Theta","P(X=1\\mid\\Theta)","P(\\Theta,X=1)","P(\\Theta\\mid X=1)"][group],centers[group],335,group===0?35:30,colors[group]));
      for(let i=0;i<2;i++){const x=centers[group]+(i===0?-75:75);this.bars.push({mesh:d.rectangle(x,640,100,1,colors[group]),x,value:d.text("",x,400,35,colors[group]),label:d.tex(`\\theta=${i}`,x,690,29)});}
    }
    this.bayes=d.tex("P(\\theta\\mid x)=\\frac{P(\\theta)P(x\\mid\\theta)}{\\sum_{\\theta'}P(\\theta')P(x\\mid\\theta')}",960,795,39,Palette.text);
    this.evidence=d.tex("P(X=1)=0.18+0.08=0.26",1185,745,31,Palette.green);
    this.entropySegments.push(d.rectangle(350,340,300,85,Palette.blue),d.rectangle(950,340,900,85,Palette.orange));
    this.entropyLabels.push(d.tex("I(\\Theta;X)=2",350,270,33,Palette.blue),d.tex("H(\\Theta\\mid X)=6",950,270,33,Palette.orange),d.tex("\\Theta\\text{ uniform},\\quad M=256,\\quad H(\\Theta)=8\\text{ bits}",960,420,35,Palette.text));
    const fano:ReadonlyArray<readonly[string,number]>=[
      ["H(\\Theta\\mid X)\\le1+P_e\\log_2M",35],
      ["\\log_2M-I(\\Theta;X)\\le1+P_e\\log_2M",37],
      ["P_e\\ge1-\\frac{I(\\Theta;X)+1}{\\log_2M}",39],
    ];
    for(let i=0;i<fano.length;i++)this.fano.push({label:d.tex(fano[i][0],960,525+i*100,40,i===2?Palette.yellow:Palette.text),sentence:fano[i][1]});
    this.bound=d.tex("\\text{Illustration: }P_e\\ge1-3/8=0.625",960,815,35,Palette.yellow);
    this.sharpBars.push(d.rectangle(570,610,150,1,Palette.green),d.rectangle(1350,610,150,1,Palette.purple));
    this.sharpLabels.push(d.tex("H(\\Theta\\mid X)=h_2(0.1)",570,700,37,Palette.green),d.tex("h_2(P_e)+P_e\\log_2(2-1)=h_2(0.1)",1350,700,32,Palette.purple));
    this.callback.push(
      d.tex("X\\sim\\mathrm{Unif}\\{0,1,2,3\\},\\quad Y=\\lfloor X/2\\rfloor",960,300,35,Palette.text),
      d.tex("Z=2Y:\\quad I(X;Z)=I(X;Y)=1,\\quad P_e^*=1/2",960,470,35,Palette.yellow),
      d.tex("S=X\\bmod2:\\quad X=2Y+S,\\quad I(X;Y,S)=2,\\quad P_e^*=0",960,650,34,Palette.green),
    );
    this.boundary=d.tex("P_e=0.1,\\quad H(\\Theta\\mid X)=0.468996\\text{ bits}",960,810,39,Palette.yellow);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),map=1-c.p(33),fano=c.p(33)*(1-c.p(46)),sharp=c.p(46)*(1-c.p(53)),poor=c.p(53)*(1-c.p(58)),callback=c.p(58);
    this.title.set({opacity:c.p(0)});this.title.setContent(callback>0.5?"The missing bit returns only when new information arrives":poor>0.5?"Perfect information does not make every estimator accurate":sharp>0.5?"Binary symmetric observation: Fano can be exact":fano>0.5?"Information gives a necessary lower bound on recovery error":"MAP minimizes probability of error under zero-one loss");
    this.decision.set({opacity:c.p(4)*map+sharp+poor});this.decision.setContent(poor>0.5?"X=\\Theta\\text{ perfectly},\\quad\\widehat\\Theta\\equiv0":sharp>0.5?"\\Theta\\text{ fair},\\quad X=\\Theta\\oplus N,\\quad N\\sim\\operatorname{Bernoulli}(0.1)":"\\widehat\\theta_{\\rm MAP}(x)\\in\\arg\\max_\\theta P(\\Theta=\\theta\\mid X=x)");
    const ps=[0.9,0.1,0.2,0.8,0.18,0.08,9/13,4/13],starts=[12,13,15,20];
    this.bars.forEach((bar:ProbabilityBar,i:number):void=>{const opacity=c.p(starts[Math.floor(i/2)])*map,height=ps[i]*270;Diagram.bar(bar.mesh,bar.x,640,height,opacity);bar.value.setContent(ps[i].toFixed(i<6?2:4));bar.value.set({opacity,y:600-height});bar.label.set({opacity});});
    this.groupLabels.forEach((label:FormulaHandle,i:number):void=>label.set({opacity:c.p(starts[i])*map}));
    this.bayes.set({opacity:c.p(8)*map});this.bayes.setContent(ctx.localTime>=c.s(24)?"\\widehat\\theta_{\\rm MAP}(1)=0,\\quad P(\\Theta=0\\mid X=1)=9/13>4/13":"P(\\theta\\mid x)=\\frac{P(\\theta)P(x\\mid\\theta)}{\\sum_{\\theta'}P(\\theta')P(x\\mid\\theta')}");
    this.evidence.set({opacity:c.p(19)*map});
    this.entropySegments.forEach((mesh:PanelMesh):void=>Diagram.show(mesh,fano));this.entropyLabels.forEach((label:FormulaHandle):void=>label.set({opacity:fano}));
    this.fano.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*fano}));this.bound.set({opacity:c.p(40)*fano});
    this.sharpBars.forEach((bar:PanelMesh,i:number):void=>{Diagram.bar(bar,i===0?570:1350,610,0.46899559*450,sharp);this.sharpLabels[i].set({opacity:sharp});});
    this.callback.forEach((label:FormulaHandle,i:number):void=>label.set({opacity:c.p(58+i)*callback}));
    this.boundary.set({opacity:c.p(47)*sharp+poor,y:poor>0.5?540:810});this.boundary.setContent(poor>0.5?"H(\\Theta\\mid X)=0,\\quad P_e=1-1/M\\quad[\\Theta\\text{ uniform}]":"P_e=0.1,\\quad H(\\Theta\\mid X)=0.468996\\text{ bits}");
  }

  teardown(_layers:SceneLayers):void{this.callback.length=0;this.bars.length=0;this.groupLabels.length=0;this.entropySegments.length=0;this.entropyLabels.length=0;this.fano.length=0;this.sharpBars.length=0;this.sharpLabels.length=0;}
}

export function estimationScene():Scene{return new EstimationScene();}
