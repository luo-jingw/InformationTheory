import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class ShannonLengthScene implements Scene {
  readonly id="c05-shannon";
  private title!:FormulaHandle;
  private readonly ideal:PanelMesh[]=[];
  private readonly rounded:PanelMesh[]=[];
  private readonly idealLabels:FormulaHandle[]=[];
  private readonly lengthLabels:FormulaHandle[]=[];
  private readonly symbolLabels:FormulaHandle[]=[];
  private readonly proof:ProofLine[]=[];
  private summary!:FormulaHandle;
  private code!:FormulaHandle;
  private readonly axes:Polyline[]=[];
  private overhead!:Polyline;
  private guarantee!:Polyline;
  private readonly plotLabels:FormulaHandle[]=[];
  private degenerate!:FormulaHandle;
  private note!:FormulaHandle;
  private readonly sourceCards:PanelMesh[]=[];
  private readonly outputCards:PanelMesh[]=[];
  private readonly sourceCounts:FormulaHandle[]=[];
  private readonly sourceWords:FormulaHandle[]=[];
  private readonly outputWords:FormulaHandle[]=[];
  private readonly framingArrows:Polyline[]=[];
  private receivedLabel!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Ceiling the ideal lengths costs less than one bit",960,100,46);
    const p=[.5,.3,.2],lengths=[1,2,3];
    for(let i=0;i<3;i++){
      const x=240+i*230,ideal=-Math.log2(p[i]);this.ideal.push(d.rectangle(x-45,640,70,1,Palette.blue));this.rounded.push(d.rectangle(x+45,640,70,1,Palette.green));this.idealLabels.push(d.tex(ideal.toFixed(3),x-45,610-ideal*100,29,Palette.blue));this.lengthLabels.push(d.tex(String(lengths[i]),x+45,610-lengths[i]*100,31,Palette.green));this.symbolLabels.push(d.tex(`p_${i+1}=${p[i]}`,x,700,30));
    }
    this.summary=d.tex("H=1.485475< L=1.7< H+1",500,790,35,Palette.yellow);this.code=d.tex("l=(1,2,3),\\quad C=\\{0,10,110\\},\\quad K=7/8",500,235,30,Palette.green);
    const lines:ReadonlyArray<readonly[string,number]>=[
      ["l_i=\\lceil-\\log_2p_i\\rceil\\quad[|\\operatorname{supp}P|\\ge2]",1],
      ["2^{-l_i}\\le p_i\\quad\\Rightarrow\\quad\\sum_i2^{-l_i}\\le1",5],
      ["-\\log_2p_i\\le l_i<-\\log_2p_i+1",9],
      ["H\\le L< H+1\\quad\\text{bits}",13],
      ["nH\\le L_n<nH+1\\quad[\\text{IID blocks}]",21],
      ["H\\le L_n/n<H+1/n",22],
    ];
    for(let i=0;i<lines.length;i++)this.proof.push({label:d.tex(lines[i][0],1350,250+i*105,i===0?30:35,i===3||i===5?Palette.yellow:Palette.text),sentence:lines[i][1]});
    this.axes.push(d.line([[170,290],[170,710],[850,710]],Palette.axis));
    const measured:Array<readonly[number,number]>=[],upper:Array<readonly[number,number]>=[];
    const h=-p.reduce((sum:number,v:number):number=>sum+v*Math.log2(v),0);
    for(let n=1;n<=64;n++){const x=180+(n-1)*10;measured.push([x,710-340*(this.expectedBlockLength(n,p)/n-h)]);upper.push([x,710-340/n]);}
    this.overhead=d.line(measured,Palette.green,5);this.guarantee=d.line(upper,Palette.orange,4);
    this.plotLabels.push(d.tex("L_n/n-H\\quad\\text{exact multinomial sum}",500,760,29,Palette.green),d.tex("1/n\\quad\\text{strict upper guarantee}",500,810,29,Palette.orange),d.text("Block length n = 1 … 64",500,250,30));
    this.degenerate=d.tex("H=0,\\ p=1:\\quad\\text{empty word only for a known fixed block}",960,470,38,Palette.yellow);
    this.note=d.text("",960,845,24,Palette.muted);
    for(let index=0;index<3;index++){
      const x=450+index*510;
      this.sourceCards.push(d.rectangle(x,340,300,115,Palette.panel));
      this.outputCards.push(d.rectangle(x,610,300,115,Palette.panel));
      this.sourceCounts.push(d.text("",x,255,28,Palette.blue));
      this.sourceWords.push(d.text("",x,340,40,Palette.text));
      this.outputWords.push(d.text("",x,610,43,Palette.green));
      this.framingArrows.push(d.line([[x,410],[x,530],[x-12,512],[x,530],[x+12,512]],Palette.axis,4));
    }
    this.receivedLabel=d.text("",960,720,29,Palette.yellow);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),block=c.p(16)*(1-c.p(26)),example=1-c.p(16),degenerate=c.p(26);
    this.title.set({opacity:c.p(0)});this.title.setContent(degenerate>.5?ctx.localTime<c.s(29)?"Can silence carry a message?":"An empty word cannot count a variable number of source symbols":block>.5?"Block coding spreads rounding overhead across n symbols":ctx.localTime<c.s(9)?"How much does integer rounding cost?":"Ceiling the ideal lengths costs less than one bit");this.title.set({scale:degenerate>.5?.87:1});
    const p=[.5,.3,.2],lengths=[1,2,3];
    this.ideal.forEach((mesh:PanelMesh,i:number):void=>{Diagram.bar(mesh,195+i*230,640,-Math.log2(p[i])*100,c.p(1)*example);Diagram.bar(this.rounded[i],285+i*230,640,lengths[i]*100,c.p(2)*example);this.idealLabels[i].set({opacity:c.p(1)*example});this.lengthLabels[i].set({opacity:c.p(2)*example});this.symbolLabels[i].set({opacity:c.p(0)*example});});
    this.summary.set({opacity:c.p(13)*example});this.code.set({opacity:c.p(7)*example});this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*(1-degenerate)}));
    this.axes.forEach((line:Polyline):void=>line.setOpacity(block));this.overhead.setOpacity(c.p(21)*block);this.guarantee.setOpacity(c.p(22)*block);this.plotLabels.forEach((label:FormulaHandle):void=>label.set({opacity:block}));
    this.degenerate.set({opacity:degenerate,y:795,scale:.77});
    this.degenerate.setContent(ctx.localTime>=c.s(30)?"C=\\{0\\}:\\quad 0^n\\text{ reveals the count},\\quad L=1":ctx.localTime>=c.s(29)?"\\epsilon=\\epsilon\\epsilon=\\epsilon\\epsilon\\epsilon\\quad\\Rightarrow\\quad n\\text{ is not identifiable}":ctx.localTime>=c.s(28)?"\\text{Unknown count }n=?\\quad\\text{received: }\\epsilon":"p=1,\\ H=0:\\quad\\text{known fixed block}\\Rightarrow\\text{one message, zero bits}");
    const unknown=ctx.localTime>=c.s(28),nonempty=ctx.localTime>=c.s(30);
    this.sourceCards.forEach((card:PanelMesh,index:number):void=>{
      const opacity=degenerate*(unknown||index===1?1:0),count=unknown?index+1:4;
      Diagram.show(card,opacity);Diagram.show(this.outputCards[index],opacity);
      this.sourceCounts[index].set({opacity});this.sourceCounts[index].setContent(unknown?`Possible n = ${count}`:'Known block n = 4');
      this.sourceWords[index].set({opacity});this.sourceWords[index].setContent('A'.repeat(count));
      this.outputWords[index].set({opacity});this.outputWords[index].setContent(nonempty?'0'.repeat(count):unknown&&ctx.localTime<c.s(29)?'?':'ε');
      this.framingArrows[index].setOpacity(opacity*(unknown&&ctx.localTime<c.s(29)?.35:1));
    });
    this.receivedLabel.set({opacity:degenerate});
    this.receivedLabel.setContent(nonempty?'A nonempty word makes the symbol count visible':unknown?'Received: silence. Which source count fits?':'One possible fixed block needs no identifying bits');
    this.note.set({opacity:c.p(6)});this.note.setContent(degenerate>.5 ? ctx.localTime<c.s(29)?"A known fixed block and an unknown-length stream have different framing assumptions":"An empty concatenation does not reveal how many symbols were encoded":"Blue: real-valued ideal length; green: integer codeword length. The displayed prefix code realizes the rounded lengths.");
  }

  teardown(_layers:SceneLayers):void{this.ideal.length=0;this.rounded.length=0;this.idealLabels.length=0;this.lengthLabels.length=0;this.symbolLabels.length=0;this.proof.length=0;this.axes.length=0;this.plotLabels.length=0;this.sourceCards.length=0;this.outputCards.length=0;this.sourceCounts.length=0;this.sourceWords.length=0;this.outputWords.length=0;this.framingArrows.length=0;}

  private expectedBlockLength(n:number,p:readonly number[]):number{
    let expected=0;
    const factorialLogs:number[]=[0];for(let i=1;i<=n;i++)factorialLogs.push(factorialLogs[i-1]+Math.log(i));
    for(let a=0;a<=n;a++)for(let b=0;b<=n-a;b++){
      const counts=[a,b,n-a-b];let logProbability=factorialLogs[n],information=0;
      for(let i=0;i<3;i++){logProbability-=factorialLogs[counts[i]];logProbability+=counts[i]*Math.log(p[i]);information-=counts[i]*Math.log2(p[i]);}
      expected+=Math.exp(logProbability)*Math.ceil(information-1e-10);
    }
    return expected;
  }
}
export function shannonLengthScene():Scene{return new ShannonLengthScene();}
