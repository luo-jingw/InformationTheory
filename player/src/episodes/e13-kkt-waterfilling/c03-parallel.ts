import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class IndependentGaussianModesScene implements Scene {
  readonly id="c03-parallel";
  private title!:FormulaHandle;
  private readonly axes:Polyline[]=[];
  private readonly curves:Polyline[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly proof:ProofLine[]=[];
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Separate mode powers capture the full vector capacity",960,100,45);this.axes.push(d.line([[170,320],[170,740],[850,740]],Palette.axis));
    const noises=[1,2,5],colors=[Palette.green,Palette.blue,Palette.purple];
    for(let i=0;i<3;i++){
      this.curves.push(d.line(Array.from({length:121},(_:unknown,j:number):readonly[number,number]=>[170+j*5.5,740-270*.5*Math.log2(1+j/20/noises[i])]),colors[i],5));this.labels.push(d.tex(`N_${i+1}=${noises[i]},\\quad u'_${i+1}(0)=${(1/(2*Math.log(2)*noises[i])).toFixed(4)}`,500,215+i*42,29,colors[i]));
    }
    this.labels.push(d.text("Input power pᵢ (one mode at a time)",500,795,28,Palette.muted),d.text("bits/real-mode use",310,335,24,Palette.muted));
    const lines:ReadonlyArray<readonly[string,number]>=[
      ["N_i>0,\\quad p_i\\ge0,\\quad\\sum_i p_i\\le P",1],
      ["F(p)=\\tfrac12\\sum_i\\log_2(1+p_i/N_i)",6],
      ["I(X;Y)=h(Y)-\\sum_i h(Z_i)\\le\\sum_i[h(Y_i)-h(Z_i)]",12],
      ["\\le\\tfrac12\\sum_i\\log_2(1+\\mathbb EX_i^2/N_i)",17],
      ["X_i\\overset{\\rm independent}{\\sim}N(0,p_i)\\quad\\text{attains every bound}",19],
      ["u_i'>0,\\quad u_i''<0\\quad\\text{on }p_i\\ge0",24],
      ["P>0:\\quad\\text{unique optimum},\\quad\\sum_i p_i=P",25],
    ];
    for(let i=0;i<lines.length;i++)this.proof.push({label:d.tex(lines[i][0],1350,225+i*95,i===2||i===4?27:32,i===4||i===6?Palette.yellow:Palette.text),sentence:lines[i][1]});this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime);this.title.set({opacity:c.p(0)});this.axes.forEach((line:Polyline):void=>line.setOpacity(c.p(4)));this.curves.forEach((line:Polyline):void=>line.setOpacity(c.p(4)));this.labels.forEach((label:FormulaHandle):void=>label.set({opacity:c.p(8)}));this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)}));this.note.set({opacity:c.p(10),y:845});this.note.setContent("The upper bound permits correlated input coordinates. Independent Gaussian inputs attain it, so correlations give no larger vector capacity.");
  }

  teardown(_layers:SceneLayers):void{this.axes.length=0;this.curves.length=0;this.labels.length=0;this.proof.length=0;}
}
export function independentGaussianModesScene():Scene{return new IndependentGaussianModesScene();}
