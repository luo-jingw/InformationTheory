import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class ChannelConverseScene implements Scene {
  readonly id="c05-converse";
  private title!:FormulaHandle;
  private readonly inputBars:PanelMesh[]=[];
  private readonly informationBars:PanelMesh[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly informationLabels:FormulaHandle[]=[];
  private readonly proof:ProofLine[]=[];
  private example!:FormulaHandle;
  private averaged!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Fano and memorylessness bound every reliable code rate",960,100,45);
    const inputs=[.1,.5,.9];
    for(let i=0;i<3;i++){
      const x=270+i*230;this.inputBars.push(d.rectangle(x-40,420,65,1,Palette.blue),d.rectangle(x+40,420,65,1,Palette.orange));this.informationBars.push(d.rectangle(x,700,95,1,Palette.green));this.labels.push(d.tex(`a_${i+1}=${inputs[i]}`,x,250,31,Palette.blue));this.informationLabels.push(d.tex("",x,750,27,Palette.green));
    }
    const lines:ReadonlyArray<readonly[string,number]>=[
      ["H(J\\mid Y^n)\\le1+P_e\\log_2(M-1)",3],
      ["(1-P_e)\\log_2M-1\\le I(J;Y^n)",5],
      ["I(J;Y^n)\\le I(X^n;Y^n)\\quad[J\\to X^n\\to Y^n]",9],
      ["I(X^n;Y^n)\\le\\sum_{i=1}^nI(X_i;Y_i)",14],
      ["\\sum_i I(P_{X_i},W)\\le nI(\\overline P_X,W)",18],
      ["I(J;Y^n)\\le nC",19],
      ["R_n\\le\\frac{C+1/n}{1-P_e}\\longrightarrow C\\quad[P_e\\to0]",22],
    ];
    for(let i=0;i<lines.length;i++)this.proof.push({label:d.tex(lines[i][0],1350,220+i*95,i===2||i===6?29:34,i>=5?Palette.yellow:Palette.text),sentence:lines[i][1]});
    this.example=d.tex("W=\\operatorname{BSC}(0.1)\\text{ fixed}",500,200,32,Palette.blue);this.averaged=d.tex("",500,810,31,Palette.yellow);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),inputs=[.1,.5,.9],marginals=c.p(16);
    this.title.set({opacity:c.p(0)});let sum=0;
    this.informationBars.forEach((mesh:PanelMesh,i:number):void=>{const info=this.entropy(.1+.8*inputs[i])-this.entropy(.1);sum+=info;Diagram.bar(mesh,270+i*230,700,info*330,marginals);Diagram.bar(this.inputBars[2*i],230+i*230,420,(1-inputs[i])*170,marginals);Diagram.bar(this.inputBars[2*i+1],310+i*230,420,inputs[i]*170,marginals);this.labels[i].set({opacity:marginals});this.informationLabels[i].setContent(`I_${i+1}=${info.toFixed(5)}`);this.informationLabels[i].set({opacity:marginals});});
    this.example.set({opacity:marginals});this.averaged.set({opacity:c.p(18)});this.averaged.setContent(`\\sum_iI_i=${sum.toFixed(5)}\\le3I(0.5)=${(3*(1-this.entropy(.1))).toFixed(5)}`);
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)}));this.note.set({opacity:c.p(11),y:845});this.note.setContent("Output subadditivity requires no independence of outputs; memorylessness factors only the conditional channel law");
  }

  teardown(_layers:SceneLayers):void{this.inputBars.length=0;this.informationBars.length=0;this.labels.length=0;this.informationLabels.length=0;this.proof.length=0;}
  private entropy(p:number):number{return p<=0||p>=1?0:-p*Math.log2(p)-(1-p)*Math.log2(1-p);}
}
export function channelConverseScene():Scene{return new ChannelConverseScene();}
