import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}
interface FlowNode {box:PanelMesh;label:FormulaHandle;}

export class SourceChannelSeparationScene implements Scene {
  readonly id="c06-separation";
  private title!:FormulaHandle;
  private readonly nodes:FlowNode[]=[];
  private readonly arrows:Polyline[]=[];
  private readonly proof:ProofLine[]=[];
  private readonly budgets:PanelMesh[]=[];
  private readonly budgetLabels:FormulaHandle[]=[];
  private budgetExample!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Compression and reliable transmission share one message budget",960,100,43);
    for(let i=0;i<4;i++){const y=245+i*175;this.nodes.push({box:d.rectangle(490,y,610,100,i===2?"#3a2f4a":"#203952"),label:d.tex(["U^m\\quad\\text{source symbols}","V\\quad\\text{compressed label}","X^n\\to Y^n\\quad\\text{DMC code}","\\widehat U^m\\quad\\text{reconstructed block}"][i],490,y,33)});if(i<3)this.arrows.push(d.line([[490,y+60],[490,y+110],[478,y+95],[490,y+110],[502,y+95]],Palette.axis));}
    const lines:ReadonlyArray<readonly[string,number]>=[
      ["m(H+\\delta)<n(C-\\delta),\\quad\\delta>0",7],
      ["P_{e,\\rm total}\\le P_{e,\\rm source}+P_{e,\\rm channel}^{\\max}\\to0",13],
      ["\\rho=m/n:\\quad\\rho\\overline H<C\\quad\\text{suffices}",21],
      ["H(U^m\\mid Y^n)\\le1+P_e m\\log_2K",26],
      ["H(U^m)\\le nC+1+P_em\\log_2K",30],
      ["P_e\\to0:\\quad\\rho\\overline H\\le C\\quad\\text{necessary}",32],
    ];
    for(let i=0;i<lines.length;i++)this.proof.push({label:d.tex(lines[i][0],1350,245+i*108,i===1||i===3||i===5?29:34,i===2||i===5?Palette.yellow:Palette.text),sentence:lines[i][1]});
    this.budgets.push(d.rectangle(180,420,1,100,Palette.green),d.rectangle(180,650,1,100,Palette.purple));
    this.budgetLabels.push(d.tex("\\rho(H+\\delta)=0.385964",500,330,34,Palette.green),d.tex("C-\\delta=0.481004",500,560,34,Palette.purple));this.budgetExample=d.tex("\\rho=.5,\\ H=.721928,\\ C=.531004,\\ \\delta=.05",500,780,27,Palette.blue);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),budget=c.p(15),flow=1-budget;
    this.title.set({opacity:c.p(0)});this.nodes.forEach((node:FlowNode,i:number):void=>{Diagram.show(node.box,c.p(i===0?0:i===1?1:i===2?3:8)*flow);node.label.set({opacity:c.p(i===0?0:i===1?1:i===2?3:8)*flow});});this.arrows.forEach((line:Polyline):void=>line.setOpacity(c.p(8)*flow));
    const values=[.3859640474,.4810044064];this.budgets.forEach((mesh:PanelMesh,i:number):void=>{const width=values[i]*1300;mesh.scale.x=width;mesh.position.x=(180+width/2-960)/100;Diagram.show(mesh,budget);this.budgetLabels[i].set({opacity:budget});});this.budgetExample.set({opacity:budget});
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)}));this.note.set({opacity:c.p(10),y:845});this.note.setContent(ctx.localTime>=c.s(33)?"Strict inequality gives achievability; the converse excludes larger loads. These arguments do not settle equality.":budget>.5?"Left budgets are in bits per channel use. The numerical example is IID and hence also stationary ergodic.":"Maximal channel error controls every compressed-message distribution, including a nonuniform one");
  }

  teardown(_layers:SceneLayers):void{this.nodes.length=0;this.arrows.length=0;this.proof.length=0;this.budgets.length=0;this.budgetLabels.length=0;}
}
export function sourceChannelSeparationScene():Scene{return new SourceChannelSeparationScene();}
