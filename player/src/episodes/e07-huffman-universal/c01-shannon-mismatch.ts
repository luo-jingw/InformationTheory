import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface BillPanel {readonly mesh:PanelMesh;readonly code:FormulaHandle;readonly bill:FormulaHandle;readonly reveal:number;readonly costReveal:number;}
interface ModelBar {mesh:PanelMesh;label:FormulaHandle;x:number;}
interface ProofLine {label:FormulaHandle;sentence:number;}

export class ShannonMismatchScene implements Scene {
  readonly id="c01-shannon-mismatch";
  private title!:FormulaHandle;
  private inventory!:FormulaHandle;
  private readonly bills:BillPanel[]=[];
  private readonly probabilities:ModelBar[]=[];
  private readonly ideals:ModelBar[]=[];
  private readonly integers:ModelBar[]=[];
  private readonly proof:ProofLine[]=[];
  private model!:FormulaHandle;
  private average!:FormulaHandle;
  private rounding!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Model mismatch and integer rounding are separate costs",960,100,46);
    this.inventory=d.text("50 A + 30 B + 20 C · same 100-symbol inventory",960,225,35,Palette.yellow);
    const codebooks:ReadonlyArray<readonly[string,string,number,number]>=[
      ["A:00\\quad B:01\\quad C:10","50(2)+30(2)+20(2)=200",2,2],
      ["A:0\\quad B:10\\quad C:110","50(1)+30(2)+20(3)=170",4,5],
      ["A:0\\quad B:10\\quad C:11","50(1)+30(2)+20(2)=150",6,6],
    ];
    for(let index=0;index<codebooks.length;index++){
      const [code,bill,reveal,costReveal]=codebooks[index],x=350+610*index;
      this.bills.push({mesh:d.rectangle(x,470,530,270,index===0?"#203952":index===1?"#292039":"#244132"),code:d.tex(code,x,425,29),bill:d.tex(bill,x,530,27,index===2?Palette.green:Palette.yellow),reveal,costReveal});
    }
    for(let i=0;i<3;i++){
      const x=235+i*235;this.probabilities.push({mesh:d.rectangle(x,400,100,1,Palette.blue),label:d.tex("",x,455,28,Palette.blue),x});this.ideals.push({mesh:d.rectangle(x-45,720,70,1,Palette.purple),label:d.tex("",x-45,760,25,Palette.purple),x:x-45});this.integers.push({mesh:d.rectangle(x+45,720,70,1,Palette.green),label:d.tex("",x+45,760,25,Palette.green),x:x+45});
    }
    this.model=d.tex("P=(.5,.3,.2),\\quad Q=(.4,.35,.25)",470,220,33,Palette.blue);
    const proof:ReadonlyArray<readonly[string,number]>=[
      ["l_i^Q=\\lceil-\\log_2q_i\\rceil",11],
      ["L_{\\rm ideal}(P,Q)=\\sum_i p_i[-\\log_2q_i]",16],
      ["=\\sum_i p_i[-\\log_2p_i+\\log_2(p_i/q_i)]",19],
      ["=H(P)+D(P\\Vert Q)",22],
      ["-\\log_2q_i\\le l_i^Q<-\\log_2q_i+1",24],
      ["H(P)+D(P\\Vert Q)\\le L_Q<H(P)+D(P\\Vert Q)+1",27],
    ];
    for(let i=0;i<proof.length;i++)this.proof.push({label:d.tex(proof[i][0],1350,245+i*95,i===2||i===5?29:35,i===3||i===5?Palette.yellow:Palette.text),sentence:proof[i][1]});
    this.average=d.tex("",470,805,32,Palette.yellow);this.rounding=d.tex("",1350,800,30,Palette.green);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),matched=c.p(28)*(1-c.p(31)),unsupported=c.p(31),p=[.5,.3,.2],q=unsupported>.5?[.6,.4,0]:matched>.5?p:[.4,.35,.25];
    const puzzle=1-c.p(8);
    this.title.set({opacity:c.p(0)});
    this.title.setContent(ctx.localTime<c.s(4)?"Which symbol earns the short word?":ctx.localTime<c.s(8)?"Three prefix codebooks, one inventory":"Model mismatch and integer rounding are separate costs");
    this.inventory.set({opacity:c.p(1)*puzzle});
    this.bills.forEach((panel:BillPanel):void=>{Diagram.show(panel.mesh,c.p(panel.reveal)*puzzle);panel.code.set({opacity:c.p(panel.reveal)*puzzle});panel.bill.set({opacity:c.p(panel.costReveal)*puzzle});});
    this.model.set({opacity:c.p(8)});this.model.setContent(unsupported>.5?"P=(.5,.3,.2),\\quad Q=(.6,.4,0)":matched>.5?"Q=P=(.5,.3,.2)":"P=(.5,.3,.2),\\quad Q=(.4,.35,.25)");
    let idealAverage=0,integerAverage=0;
    this.probabilities.forEach((bar:ModelBar,i:number):void=>{Diagram.bar(bar.mesh,bar.x,400,p[i]*250,c.p(9));bar.label.setContent(`p_${i+1}=${p[i]}`);bar.label.set({opacity:c.p(9)});});
    this.ideals.forEach((bar:ModelBar,i:number):void=>{
      const ideal=q[i]>0?-Math.log2(q[i]):Infinity,integer=Math.ceil(ideal-1e-12);idealAverage+=p[i]*ideal;integerAverage+=p[i]*integer;
      Diagram.bar(bar.mesh,bar.x,720,Math.min(3.5,ideal)*65,c.p(15));Diagram.bar(this.integers[i].mesh,this.integers[i].x,720,Math.min(3.5,integer)*65,c.p(23));
      bar.label.setContent(Number.isFinite(ideal)?ideal.toFixed(3):"\\infty");bar.label.set({opacity:c.p(15)});this.integers[i].label.setContent(Number.isFinite(integer)?String(integer):"\\infty");this.integers[i].label.set({opacity:c.p(23)});
    });
    const h=-p.reduce((sum:number,v:number):number=>sum+v*Math.log2(v),0),divergence=idealAverage-h;
    this.average.set({opacity:c.p(22)});this.average.setContent(Number.isFinite(idealAverage)?`H=${h.toFixed(5)},\\quad D=${divergence.toFixed(5)}`:"p_3>0,\\ q_3=0:\\quad L_{\\rm ideal}=\\infty");
    this.rounding.set({opacity:c.p(26)});this.rounding.setContent(Number.isFinite(integerAverage)?`L_{\\rm ideal}=${idealAverage.toFixed(5)},\\quad L_Q=${integerAverage.toFixed(5)}`:"\\text{No finite Shannon length for the unsupported event}");
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)}));this.note.set({opacity:Math.max(c.p(1)*puzzle,c.p(15)),y:865});this.note.setContent(puzzle>.5?"Same inventory and symbol order; the codebook changes the bit bill":"Top: source probabilities. Lower purple: ideal lengths. Green: rounded lengths.");
  }

  teardown(_layers:SceneLayers):void{this.bills.length=0;this.probabilities.length=0;this.ideals.length=0;this.integers.length=0;this.proof.length=0;}
}
export function shannonMismatchScene():Scene{return new ShannonMismatchScene();}
