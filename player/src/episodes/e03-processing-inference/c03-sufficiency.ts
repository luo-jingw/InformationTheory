import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class SufficientStatisticScene implements Scene {
  readonly id="c03-sufficiency";
  private title!:FormulaHandle;
  private readonly nodes:PanelMesh[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly arrows:Polyline[]=[];
  private family!:FormulaHandle;
  private information!:FormulaHandle;
  private definition!:FormulaHandle;
  private readonly finiteProof:ProofLine[]=[];
  private readonly sampleBoxes:PanelMesh[]=[];
  private readonly samples:FormulaHandle[]=[];
  private readonly sampleCounts:FormulaHandle[]=[];
  private readonly probabilities:FormulaHandle[]=[];
  private readonly bernoulli:ProofLine[]=[];
  private classLabel!:FormulaHandle;
  private readonly gaussian:ProofLine[]=[];
  private readonly gaussianPlot:Polyline[]=[];
  private readonly observations:PanelMesh[]=[];
  private readonly observationLabels:FormulaHandle[]=[];
  private gaussianLabel!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);
    this.title=d.text("A statistic retains information about a model parameter",960,100,45);
    for(let i=0;i<3;i++){const x=390+i*570;this.nodes.push(d.rectangle(x,330,230,115,i===2?"#284333":"#203952"));this.labels.push(d.tex(["\\Theta","X","T(X)"][i],x,330,51,i===2?Palette.green:Palette.blue));}
    for(const x of [530,1100])this.arrows.push(d.line([[x,330],[x+280,330],[x+260,315],[x+280,330],[x+260,345]],Palette.axis,4));
    this.family=d.tex("\\{p_\\theta(x):\\theta\\in\\Omega\\},\\quad\\theta\\text{ fixed};\\quad\\Theta\\sim\\pi\\text{ under a prior}",960,215,35,Palette.text);
    this.definition=d.tex("T\\text{ sufficient}:\\quad P_\\theta(X=x\\mid T=t)=q(x\\mid t)\\text{ independent of }\\theta",960,540,35,Palette.yellow);
    this.information=d.tex("\\Theta\\perp X\\mid T\\quad\\Longrightarrow\\quad I(\\Theta;X)=I(\\Theta;T)",960,710,42,Palette.green);
    const finite:ReadonlyArray<readonly[string,number]>=[
      ["p_\\theta(x)=g_\\theta(T(x))h(x)",19],
      ["P_\\theta(x\\mid T=t)=\\frac{g_\\theta(t)h(x)}{g_\\theta(t)\\sum_{x':T(x')=t}h(x')}",21],
      ["=\\frac{h(x)}{\\sum_{x':T(x')=t}h(x')}\\quad[P_\\theta(T=t)>0]",24],
      ["\\text{No conditional requirement on a null class}",27],
      ["\\text{Conversely: }p_\\theta(x)=P_\\theta(T=t)q(x\\mid t)",30],
      ["g_\\theta(t)=P_\\theta(T=t),\\quad h(x)=q(x\\mid T(x))",31],
    ];
    for(let i=0;i<finite.length;i++)this.finiteProof.push({label:d.tex(finite[i][0],1300,240+i*110,i===1||i===2?34:32,i===2?Palette.yellow:Palette.text),sentence:finite[i][1]});
    for(let i=0;i<8;i++){const bits=i.toString(2).padStart(3,"0"),count=bits.split("1").length-1;const x=i%2===0?290:610,y=280+Math.floor(i/2)*125;this.sampleBoxes.push(d.rectangle(x,y,250,90,count===1?"#284333":"#203952"));this.samples.push(d.text(bits,x-35,y,39,count===1?Palette.green:Palette.text));this.sampleCounts.push(d.tex(`T=${count}`,x+75,y,27,Palette.yellow));}
    this.classLabel=d.tex("n=3:\\quad T(x)=\\sum_i x_i",450,205,34,Palette.yellow);
    this.probabilities.push(d.tex("001,010,100:\\quad p_\\theta=\\theta(1-\\theta)^2",450,720,30,Palette.green),d.tex("P_\\theta(x\\mid T=1)=1/3",450,795,34,Palette.yellow));
    const bernoulli:ReadonlyArray<readonly[string,number]>=[
      ["p_\\theta(x^n)=\\theta^t(1-\\theta)^{n-t},\\quad0<\\theta<1",39],
      ["T=\\sum_iX_i,\\quad P_\\theta(X^n=x^n\\mid T=t)=\\binom{n}{t}^{-1}",42],
      ["T\\text{ minimal}:\\quad T=\\varphi(S)\\text{ for every sufficient }S",47],
      ["T(x)=t\\ne t'=T(x')",49],
      ["\\frac{p_\\theta(x)}{p_\\theta(x')}=\\left(\\frac\\theta{1-\\theta}\\right)^{t-t'}",50],
      ["\\text{Depends on }\\theta\\quad\\Rightarrow\\quad S(x)\\ne S(x')",54],
    ];
    for(let i=0;i<bernoulli.length;i++)this.bernoulli.push({label:d.tex(bernoulli[i][0],1300,250+i*110,i===1||i===2?30:35,i===5?Palette.yellow:Palette.text),sentence:bernoulli[i][1]});
    const gaussian:ReadonlyArray<readonly[string,number]>=[
      ["X_i\\overset{\\rm iid}{\\sim}N(\\theta,\\sigma^2),\\quad\\sigma^2>0\\text{ known}",60],
      ["f_\\theta(x^n)=(2\\pi\\sigma^2)^{-n/2}\\exp\\left[-\\frac{\\sum_i(x_i-\\theta)^2}{2\\sigma^2}\\right]",62],
      ["\\sum_i(x_i-\\theta)^2=\\sum_ix_i^2-2\\theta\\sum_ix_i+n\\theta^2",64],
      ["g_\\theta(T)=\\exp[\\theta T/\\sigma^2-n\\theta^2/(2\\sigma^2)]",68],
      ["h(x^n)=(2\\pi\\sigma^2)^{-n/2}\\exp[-\\sum_ix_i^2/(2\\sigma^2)]",69],
      ["T=\\sum_iX_i\\text{ sufficient};\\quad\\bar X=T/n\\text{ also sufficient}",72],
    ];
    for(let i=0;i<gaussian.length;i++)this.gaussian.push({label:d.tex(gaussian[i][0],1310,230+i*110,i===1||i===2||i===4?29:32,i===5?Palette.yellow:Palette.text),sentence:gaussian[i][1]});
    this.gaussianPlot.push(d.line([[170,360],[820,360]],Palette.axis),d.line([[170,700],[820,700]],Palette.axis));
    this.gaussianPlot.push(d.line(Array.from({length:121},(_:unknown,i:number):readonly[number,number]=>{const theta=-1+i/40;return[190+(theta+1)*200,700-210*Math.exp(-2*(theta-0.5)**2)];}),Palette.purple,5));
    for(const x of [-1,0.5,1,1.5]){this.observations.push(d.rectangle(190+(x+1)*200,360,17,17,Palette.blue));this.observationLabels.push(d.text(x.toFixed(1),190+(x+1)*200,415,30,Palette.blue));}
    this.gaussianLabel=d.tex("x=(-1,0.5,1,1.5),\\quad T=2,\\quad\\bar x=0.5",485,280,29,Palette.blue);
    this.note=d.text("",960,825,27,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),intro=1-c.p(17),finite=c.p(17)*(1-c.p(38)),bernoulli=c.p(38)*(1-c.p(60)),gaussian=c.p(60);
    this.title.set({opacity:c.p(0)});this.title.setContent(gaussian>0.5?"Known-variance Gaussian samples: retain the sum":bernoulli>0.5?"The Bernoulli count is minimal sufficient":finite>0.5?"Factorization removes parameter dependence within each class":"A statistic retains information about a model parameter");
    this.nodes.forEach((node:PanelMesh,i:number):void=>{Diagram.show(node,c.p(6)*intro);this.labels[i].set({opacity:c.p(6)*intro});});this.arrows.forEach((arrow:Polyline):void=>arrow.setOpacity(c.p(6)*intro));
    this.family.set({opacity:c.p(0)*intro});this.definition.set({opacity:c.p(9)*intro});this.information.set({opacity:c.p(11)*intro});
    this.information.setContent(ctx.localTime>=c.s(15)?"\\text{A degenerate prior gives }I(\\Theta;X)=I(\\Theta;T)=0\\text{ for any }T":"\\Theta\\perp X\\mid T\\quad\\Longrightarrow\\quad I(\\Theta;X)=I(\\Theta;T)");
    this.information.set({scale:ctx.localTime>=c.s(15)?0.85:1});
    this.finiteProof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*finite}));
    const samples=finite+bernoulli;
    this.sampleBoxes.forEach((box:PanelMesh,i:number):void=>{const count=i.toString(2).split("1").length-1;const focus=c.p(24)*(1-c.p(38));Diagram.show(box,samples*(focus>0.5&&count!==1?0.2:1));this.samples[i].set({opacity:samples*(focus>0.5&&count!==1?0.25:1)});this.sampleCounts[i].set({opacity:samples});});
    this.classLabel.set({opacity:samples});this.probabilities.forEach((label:FormulaHandle,i:number):void=>label.set({opacity:c.p(i===0?19:24)*samples}));
    this.bernoulli.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*bernoulli}));
    this.gaussian.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*gaussian}));
    this.gaussianPlot.forEach((line:Polyline,i:number):void=>line.setOpacity(c.p(i===2?68:60)*gaussian));
    this.observations.forEach((point:PanelMesh,i:number):void=>{Diagram.show(point,gaussian);this.observationLabels[i].set({opacity:gaussian});});this.gaussianLabel.set({opacity:gaussian});
    this.note.set({opacity:c.p(15)*intro+c.p(35)*(1-c.p(38))+gaussian});this.note.setContent(gaussian>0.5?"Gaussian factorization uses the common Lebesgue density; the left curve is gθ(T)/maxθ gθ(T), σ²=1":finite>0.5?"The finite proof uses counting measure; dominated density families use Fisher’s factorization theorem":ctx.localTime<c.s(16)?"Does equality under this one prior certify sufficiency for the whole family?":"Sufficiency concerns a complete model family, rather than equality under one known-parameter prior");
  }

  teardown(_layers:SceneLayers):void{this.nodes.length=0;this.labels.length=0;this.arrows.length=0;this.finiteProof.length=0;this.sampleBoxes.length=0;this.samples.length=0;this.sampleCounts.length=0;this.probabilities.length=0;this.bernoulli.length=0;this.gaussian.length=0;this.gaussianPlot.length=0;this.observations.length=0;this.observationLabels.length=0;}
}

export function sufficientStatisticScene():Scene{return new SufficientStatisticScene();}
