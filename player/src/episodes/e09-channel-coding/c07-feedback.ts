import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class CausalFeedbackScene implements Scene {
  readonly id="c07-feedback";
  private title!:FormulaHandle;
  private message!:FormulaHandle;
  private readonly nodes:PanelMesh[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly channelLinks:Polyline[]=[];
  private readonly feedbackLinks:Polyline[]=[];
  private readonly messageLinks:Polyline[]=[];
  private readonly proof:ProofLine[]=[];
  private encoder!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Causal feedback preserves the DMC capacity bound",960,100,46);this.message=d.tex("J\\text{ fixed before transmission}",500,205,32,Palette.yellow);
    for(let i=0;i<3;i++){
      const x=250+i*240;for(let row=0;row<3;row++){const y=330+row*150;this.nodes.push(d.rectangle(x,y,150,90,row===1?"#3a2f4a":"#203952"));this.labels.push(d.tex([`X_${i+1}`,"W",`Y_${i+1}`][row],x,y,38,row===1?Palette.purple:Palette.blue));}
      this.channelLinks.push(d.line([[x,380],[x,430],[x-12,415],[x,430],[x+12,415]],Palette.axis),d.line([[x,530],[x,580],[x-12,565],[x,580],[x+12,565]],Palette.axis));
      this.messageLinks.push(d.line([[500,235],[x,270],[x,280]],Palette.yellow,3));
      if(i<2)this.feedbackLinks.push(d.line([[x,680],[x,725],[x+120,725],[x+120,330],[x+155,330],[x+143,318],[x+155,330],[x+143,342]],Palette.orange,4));
    }
    const proof:ReadonlyArray<readonly[string,number]>=[
      ["I(J;Y^n)\\ge(1-P_e)\\log_2M-1",5],
      ["I(J;Y^n)=\\sum_iI(J;Y_i\\mid Y^{i-1})",7],
      ["=\\sum_i[H(Y_i\\mid Y^{i-1})-H(Y_i\\mid J,Y^{i-1})]",8],
      ["H(Y_i\\mid J,Y^{i-1})=H(Y_i\\mid X_i)",12],
      ["I(J;Y^n)\\le\\sum_i I(X_i;Y_i)\\le nC",14],
      ["R_n\\le(C+1/n)/(1-P_e)",17],
      ["R<C:\\quad\\text{ignore feedback to attain the same rates}",18],
    ];
    for(let i=0;i<proof.length;i++)this.proof.push({label:d.tex(proof[i][0],1350,220+i*94,i===2||i===6?27:33,i>=4?Palette.yellow:Palette.text),sentence:proof[i][1]});
    this.encoder=d.tex("X_i=f_i(J,Y^{i-1})",500,800,37,Palette.orange);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime);
    this.title.set({opacity:c.p(0)});this.title.setContent(ctx.localTime<c.s(20)?"Can causal feedback raise DMC capacity?":"Causal feedback preserves the DMC capacity bound");this.message.set({opacity:c.p(0)});this.nodes.forEach((mesh:PanelMesh,i:number):void=>{Diagram.show(mesh,c.p(1));this.labels[i].set({opacity:c.p(1)});});this.channelLinks.forEach((line:Polyline):void=>line.setOpacity(c.p(1)));this.messageLinks.forEach((line:Polyline):void=>line.setOpacity(c.p(1)));this.feedbackLinks.forEach((line:Polyline):void=>line.setOpacity(c.p(2)*(1-.7*c.p(18))));this.encoder.set({opacity:c.p(2)});
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)}));this.note.set({opacity:c.p(10),y:845});this.note.setContent(ctx.localTime>=c.s(21)?"The proof conditions on past outputs at each time; it uses no whole-block J → Xⁿ → Yⁿ claim under feedback":"Given J and output past, the encoder fixes Xᵢ; memorylessness fixes the current output law W(·|Xᵢ)");
  }

  teardown(_layers:SceneLayers):void{this.nodes.length=0;this.labels.length=0;this.channelLinks.length=0;this.feedbackLinks.length=0;this.messageLinks.length=0;this.proof.length=0;}
}
export function causalFeedbackScene():Scene{return new CausalFeedbackScene();}
