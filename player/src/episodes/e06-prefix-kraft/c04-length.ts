import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProbabilityColumn { mesh:PanelMesh; label:FormulaHandle; x:number; }
interface ProofLine { label:FormulaHandle; sentence:number; }

export class CodeLengthLowerBoundScene implements Scene {
  readonly id="c04-length";
  private title!:FormulaHandle;
  private readonly probabilities:ProbabilityColumn[]=[];
  private readonly weights:ProbabilityColumn[]=[];
  private readonly stack:PanelMesh[]=[];
  private readonly stackLabels:FormulaHandle[]=[];
  private readonly proof:ProofLine[]=[];
  private example!:FormulaHandle;
  private code!:FormulaHandle;
  private normalization!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("A length list induces a comparison distribution",960,100,46);
    for(let i=0;i<3;i++){
      const x=230+i*230;this.probabilities.push({mesh:d.rectangle(x-40,570,65,1,Palette.blue),label:d.tex("",x-40,610,27,Palette.blue),x:x-40});this.weights.push({mesh:d.rectangle(x+40,570,65,1,Palette.purple),label:d.tex("",x+40,610,27,Palette.purple),x:x+40});
    }
    this.example=d.tex("",470,220,32,Palette.blue);this.code=d.tex("",470,640,32,Palette.text);this.normalization=d.tex("",470,690,34,Palette.purple);
    for(let i=0;i<3;i++){this.stack.push(d.rectangle(0,755,1,45,[Palette.blue,Palette.orange,Palette.purple][i]));this.stackLabels.push(d.tex("",0,845,25,[Palette.blue,Palette.orange,Palette.purple][i]));}
    const proof:ReadonlyArray<readonly[string,number]>=[
      ["L=\\sum_i p_i l_i,\\quad K=\\sum_iD^{-l_i}\\in(0,1]",3],
      ["q_i=D^{-l_i}/K,\\quad\\sum_iq_i=1",6],
      ["D_D(P\\Vert q)=\\sum_i p_i\\log_D(p_i/q_i)",10],
      ["=-H_D(P)+L+\\log_DK",16],
      ["L=H_D(P)+D_D(P\\Vert q)-\\log_DK\\ge H_D(P)",17],
      ["L=H_D(P)\\iff K=1\\text{ and }p_i=q_i",21],
    ];
    for(let i=0;i<proof.length;i++)this.proof.push({label:d.tex(proof[i][0],1350,240+i*110,i===0||i===4?29:35,i>=4?Palette.yellow:Palette.text),sentence:proof[i][1]});
    this.note=d.text("",960,880,23,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),equal=c.p(24),p=equal>.5?[.5,.25,.25]:[.8,.2,0],lengths=[1,2,2],k=equal>.5?1:.75,q=equal>.5?[.5,.25,.25]:[2/3,1/3,0];
    const h=-p.reduce((sum:number,v:number):number=>sum+(v>0?v*Math.log2(v):0),0),l=p.reduce((sum:number,v:number,i:number):number=>sum+v*lengths[i],0),divergence=p.reduce((sum:number,v:number,i:number):number=>sum+(v>0?v*Math.log2(v/q[i]):0),0),penalty=-Math.log2(k);
    this.title.set({opacity:c.p(0)});this.probabilities.forEach((bar:ProbabilityColumn,i:number):void=>{Diagram.bar(bar.mesh,bar.x,520,p[i]*330,c.p(1)*(i===2?equal:1));bar.label.setContent(`p_${i+1}=${p[i].toFixed(2)}`);bar.label.set({opacity:c.p(1)*(i===2?equal:1),x:bar.x+40,y:560});});
    this.weights.forEach((bar:ProbabilityColumn,i:number):void=>{Diagram.bar(bar.mesh,bar.x,520,q[i]*330,c.p(6)*(i===2?equal:1));bar.label.setContent(`q_${i+1}=${q[i].toFixed(3)}`);bar.label.set({opacity:c.p(6)*(i===2?equal:1),x:bar.x-40,y:605});});
    this.example.set({opacity:c.p(1)});this.example.setContent(equal>.5?"P=(1/2,1/4,1/4),\\quad l=(1,2,2)":"P=(0.8,0.2),\\quad l=(1,2)");this.code.set({opacity:c.p(3),y:660});this.code.setContent(equal>.5?"C=\\{0,10,11\\},\\quad L=H=1.5":"C=\\{0,10\\},\\quad L=1.2\\text{ bits}");
    this.normalization.set({opacity:c.p(6),y:705});this.normalization.setContent(`L=${l.toFixed(3)},\\quad K=${k.toFixed(2)},\\quad q_i=2^{-l_i}/K`);
    let left=170;const values=[h,divergence,penalty];
    this.stack.forEach((bar:PanelMesh,i:number):void=>{const width=values[i]*420;bar.scale.x=Math.max(.001,width);bar.position.x=(left+width/2-960)/100;Diagram.show(bar,c.p(17));this.stackLabels[i].setContent([`H=${h.toFixed(5)}`,`D=${divergence.toFixed(5)}`,`-\\log_2K=${penalty.toFixed(5)}`][i]);this.stackLabels[i].set({opacity:c.p(17)*(equal>.5&&i>0?0:1),x:[250,490,740][i],y:800});left+=width;});
    this.proof.forEach((line:ProofLine,index:number):void=>{
      line.label.set({opacity:c.p(line.sentence)});
      if(index===4)line.label.setContent(ctx.localTime<c.s(20)?"L=H_D(P)+D_D(P\\Vert q)-\\log_DK":"L=H_D(P)+D_D(P\\Vert q)-\\log_DK\\ge H_D(P)");
      if(index===5)line.label.setContent(ctx.localTime<c.s(22)?"L=H_D(P)\\ ?":ctx.localTime<c.s(23)?"D_D(P\\Vert q)=0\\iff P=q":ctx.localTime<c.s(24)?"-\\log_DK=0\\iff K=1":"L=H_D(P)\\iff K=1\\text{ and }p_i=q_i");
    });this.note.set({opacity:c.p(25),y:845});this.note.setContent("The theorem applies to uniquely decodable codes on positive support; logarithm base D matches code-alphabet digits");
  }

  teardown(_layers:SceneLayers):void{this.probabilities.length=0;this.weights.length=0;this.stack.length=0;this.stackLabels.length=0;this.proof.length=0;}
}
export function codeLengthLowerBoundScene():Scene{return new CodeLengthLowerBoundScene();}
