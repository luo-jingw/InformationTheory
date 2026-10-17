import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ChannelCell {box:PanelMesh;label:FormulaHandle;}
interface ProofLine {label:FormulaHandle;sentence:number;}

export class DmcOptimalityScene implements Scene {
  readonly id="c01-dmc-optimum";
  private title!:FormulaHandle;
  private readonly cells:ChannelCell[]=[];
  private readonly inputs:FormulaHandle[]=[];
  private readonly divergences:FormulaHandle[]=[];
  private readonly outputBars:PanelMesh[]=[];
  private readonly outputLabels:FormulaHandle[]=[];
  private readonly proof:ProofLine[]=[];
  private example!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Used input rows have equal divergence to the optimal output",960,100,43);
    const matrix=[[1,0],[0,1],[.5,.5]];
    for(let row=0;row<3;row++){
      this.inputs.push(d.tex("",220,330+row*120,28,Palette.blue));this.divergences.push(d.tex("",825,330+row*120,26,Palette.orange));
      for(let col=0;col<2;col++)this.cells.push({box:d.rectangle(440+col*170,330+row*120,135,90,"#203952"),label:d.tex(String(matrix[row][col]),440+col*170,330+row*120,35)});
    }
    for(let i=0;i<2;i++){this.outputBars.push(d.rectangle(370+i*270,780,110,1,Palette.green));this.outputLabels.push(d.tex("",370+i*270,815,28,Palette.green));}
    this.example=d.tex("W_0=(1,0),\\quad W_1=(0,1),\\quad W_2=(1/2,1/2)",490,225,25,Palette.blue);
    const lines:ReadonlyArray<readonly[string,number]>=[
      ["I(p)=\\sum_i p_iD(W_i\\Vert q_p),\\quad q_p=pW",4],
      ["\\text{At an optimum, reachable outputs have }q^*_y>0",11],
      ["q^*_y=0:\\quad\\text{gain}=a\\epsilon\\log_2(1/\\epsilon)+O(\\epsilon),\\ a>0",16],
      ["\\text{Other entropy changes are }O(\\epsilon)",17],
      ["\\epsilon\\log(1/\\epsilon)\\text{ dominates }\\epsilon",19],
      ["\\text{A missing reachable output contradicts maximality}",20],
    ];
    for(let i=0;i<lines.length;i++)this.proof.push({label:d.tex(lines[i][0],1350,245+i*105,i===0||i===2||i===5?28:33,i===2||i===5?Palette.yellow:Palette.text),sentence:lines[i][1]});this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),optimal=c.p(21),epsilon=.05*c.p(14),p=optimal>.5?[.5,.5,0]:[1-epsilon,epsilon,0],q=optimal>.5?[.5,.5]:[1-epsilon,epsilon];
    this.title.set({opacity:c.p(0)});this.cells.forEach((cell:ChannelCell):void=>{Diagram.show(cell.box,c.p(0));cell.label.set({opacity:c.p(0)});});this.example.set({opacity:c.p(0)});
    this.inputs.forEach((label:FormulaHandle,i:number):void=>{label.setContent(`p_${i}=${p[i].toFixed(3)}`);label.set({opacity:c.p(2)});this.divergences[i].setContent(i<2?"D_i=1":"D_i=0");this.divergences[i].set({opacity:c.p(29)});});
    this.outputBars.forEach((mesh:PanelMesh,i:number):void=>{Diagram.bar(mesh,370+i*270,780,q[i]*150,c.p(3));this.outputLabels[i].setContent(`q_${i}=${q[i].toFixed(3)}`);this.outputLabels[i].set({opacity:c.p(3)});});
    const direction=["p_\\epsilon=(1-\\epsilon)p^*+\\epsilon e_i","q_\\epsilon=q^*+\\epsilon(W_i-q^*)","\\left.\\frac{dI(p_\\epsilon)}{d\\epsilon}\\right|_{0+}=D(W_i\\Vert q^*)-C","\\text{One-sided derivative}\\le0","D(W_i\\Vert q^*)\\le C\\quad\\forall i","p_i^*>0\\Rightarrow D(W_i\\Vert q^*)=C"];
    const sufficient=["I(p)=\\sum_i p_iD(W_i\\Vert q_0)-D(q_p\\Vert q_0)","\\text{Candidate }p_0:\\quad J=I(p_0),\\ q_0=p_0W","D(W_i\\Vert q_0)\\le J\\quad\\forall i","I(p)\\le\\sum_i p_iJ-D(q_p\\Vert q_0)","\\le J\\quad\\text{for every competing input }p","I(p_0)=J\\Rightarrow p_0\\text{ globally optimal}"];
    const early=["I(p)=\\sum_i p_iD(W_i\\Vert q_p),\\quad q_p=pW","\\text{Optimal reachable outputs have }q_y^*>0","q^*_y=0:\\quad\\text{gain}=a\\epsilon\\log_2(1/\\epsilon)+O(\\epsilon),\\ a>0","\\text{Other entropy changes are }O(\\epsilon)","\\epsilon\\log(1/\\epsilon)\\text{ dominates }\\epsilon","\\text{Missing reachable output contradicts maximality}"];
    const suff=ctx.localTime>=c.s(37);this.proof.forEach((line:ProofLine,i:number):void=>{line.label.setContent((suff?sufficient:optimal>.5?direction:early)[i]);line.label.set({opacity:c.p(suff?[37,38,39,40,41,43][i]:optimal>.5?[22,23,27,28,29,34][i]:line.sentence)});});
    this.note.set({opacity:c.p(11),y:845});this.note.setContent(optimal>.5?(ctx.localTime<c.s(29)?"Candidate uses rows 0 and 1, leaving row 2 unused; the induced output is fair":"Example optimum p=(1/2,1/2,0), q=(1/2,1/2), C=1: both used rows have divergence1; the unused row has divergence0"):"The boundary candidate p=(1,0,0) misses a reachable output; adding the deterministic second row creates positive entropy");
  }

  teardown(_layers:SceneLayers):void{this.cells.length=0;this.inputs.length=0;this.divergences.length=0;this.outputBars.length=0;this.outputLabels.length=0;this.proof.length=0;}
}
export function dmcOptimalityScene():Scene{return new DmcOptimalityScene();}
