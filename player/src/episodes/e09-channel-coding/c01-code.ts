import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface RepetitionBit {readonly box:PanelMesh;readonly label:FormulaHandle;readonly row:number;readonly index:number;}
interface CodeNode {box:PanelMesh;label:FormulaHandle;}
interface FormulaCue {label:FormulaHandle;sentence:number;}

export class BlockCodeScene implements Scene {
  readonly id="c01-code";
  private title!:FormulaHandle;
  private readonly repeatBits:RepetitionBit[]=[];
  private readonly repeatHeadings:FormulaHandle[]=[];
  private repeatAnswer!:FormulaHandle;
  private repeatError!:FormulaHandle;
  private repeatRate!:FormulaHandle;
  private readonly nodes:CodeNode[]=[];
  private readonly arrows:Polyline[]=[];
  private readonly errors:PanelMesh[]=[];
  private readonly errorLabels:FormulaHandle[]=[];
  private readonly limits:Polyline[]=[];
  private readonly scaleLabels:FormulaHandle[]=[];
  private readonly formulas:FormulaCue[]=[];
  private example!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("A block code maps messages to channel inputs and back",960,100,45);
    for(let row=0;row<3;row++){
      const y=300+row*150,word=["000","111","010"][row];
      this.repeatHeadings.push(d.text(["send 0","send 1","received"][row],350,y,32,row===2?Palette.orange:Palette.blue));
      for(let index=0;index<3;index++){
        const x=640+index*170;
        this.repeatBits.push({box:d.rectangle(x,y,115,85,"#203952"),label:d.text(word[index],x,y,40,Palette.text),row,index});
      }
    }
    this.repeatAnswer=d.tex("\\widehat J=0\\quad\\text{by majority}",1430,330,34,Palette.green);
    this.repeatError=d.tex("3(.10)^2(.90)+(.10)^3=.028",1430,490,31,Palette.yellow);
    this.repeatRate=d.tex("R=\\log_2(2)/3=1/3\\quad\\text{bit/use}",1430,650,30,Palette.orange);
    const labels=["J\\in\\{1,\\ldots,M\\}","x^n(J)","Y^n","\\widehat J(Y^n)"];
    for(let i=0;i<4;i++){const x=300+i%2*370,y=300+Math.floor(i/2)*260;this.nodes.push({box:d.rectangle(x,y,300,120,i===2?"#3a2f4a":"#203952"),label:d.tex(labels[i],x,y,i===0?29:38)});}
    this.arrows.push(d.line([[460,300],[500,300],[488,288],[500,300],[488,312]],Palette.axis),d.line([[670,370],[670,430],[300,430],[300,490],[288,475],[300,490],[312,475]],Palette.orange),d.line([[460,560],[500,560],[488,548],[500,560],[488,572]],Palette.axis));
    for(let i=0;i<8;i++){this.errors.push(d.rectangle(200+i*85,700,55,1,i===7?Palette.orange:Palette.blue));this.errorLabels.push(d.tex(String(i+1),200+i*85,755,23));}
    this.limits.push(d.line([[170,650],[840,650]],Palette.green,4),d.line([[170,390],[840,390]],Palette.orange,4),d.line([[170,200],[170,700],[840,700]],Palette.axis,2));
    this.scaleLabels.push(d.text("error probability",430,300,24,Palette.muted),d.text("0",145,700,20,Palette.muted),d.text("1",145,200,20,Palette.muted),d.text("mean .10",460,625,23,Palette.green),d.text("max .62",460,365,23,Palette.orange));
    const formulas:ReadonlyArray<readonly[string,number]>=[
      ["R=\\log_2M/n\\quad\\text{bits/channel use}",13],
      ["e_j=P(\\widehat J\\ne j\\mid J=j)",15],
      ["P_{e,\\rm avg}=M^{-1}\\sum_je_j",16],
      ["P_{e,\\max}=\\max_je_j\\ge P_{e,\\rm avg}",18],
      ["\\widehat J_{\\rm MAP}\\in\\arg\\max_jP_J(j)W^n(y^n\\mid x^n(j))",23],
    ];
    for(let i=0;i<formulas.length;i++)this.formulas.push({label:d.tex(formulas[i][0],1350,255+i*120,i===4?29:36,i===3?Palette.yellow:Palette.text),sentence:formulas[i][1]});
    this.example=d.tex("",500,810,31,Palette.yellow);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),errors=c.p(15)*(1-c.p(26)),flow=1-errors,map=c.p(26);
    const opening=1-c.p(8);
    this.repeatHeadings.forEach((label:FormulaHandle,row:number):void=>label.set({opacity:c.p(row===2?2:1)*opening}));
    this.repeatBits.forEach((cell:RepetitionBit):void=>{const opacity=c.p(cell.row===2?2:1)*opening;Diagram.show(cell.box,opacity);cell.label.set({opacity});cell.box.material.color.set(cell.row===2&&ctx.localTime>=c.s(3)?cell.index===1?"#533137":"#244132":"#203952");});
    this.repeatAnswer.set({opacity:c.p(3)*opening});this.repeatError.set({opacity:c.p(5)*opening});this.repeatRate.set({opacity:c.p(6)*opening});
    this.title.set({opacity:c.p(0)});
    this.title.setContent(ctx.localTime<c.s(3)?"Can redundant bits rescue a noisy bit?":ctx.localTime<c.s(8)?"A smaller error comes with a smaller rate":ctx.localTime<c.s(26)?"A block code maps messages to channel inputs and back":ctx.localTime<c.s(29)?"Received 011: likelihood or posterior?":"The prior weights can change the decoding decision");this.nodes.forEach((node:CodeNode,i:number):void=>{Diagram.show(node.box,c.p(i<2?10:i===2?11:12)*flow*(1-map));node.label.set({opacity:c.p(i<2?10:i===2?11:12)*flow*(1-map)});});this.arrows.forEach((line:Polyline):void=>line.setOpacity(c.p(12)*flow*(1-map)));
    const values=[.01,.02,.01,.03,.02,.04,.05,.62];this.errors.forEach((mesh:PanelMesh,i:number):void=>{Diagram.bar(mesh,200+i*85,700,values[i]*500,errors);this.errorLabels[i].set({opacity:errors});});this.limits.forEach((line:Polyline,i:number):void=>line.setOpacity(c.p(i===0?16:i===1?18:15)*errors));
    this.scaleLabels.forEach((label:FormulaHandle,i:number):void=>label.set({opacity:(i<3?c.p(15):c.p(i===3?16:18))*errors}));
    this.formulas.forEach((line:FormulaCue):void=>line.label.set({opacity:c.p(line.sentence)}));this.example.set({opacity:c.p(16),x:500,y:800});this.example.setContent(map>.5?(ctx.localTime<c.s(29)?"y=011:\\quad\\text{ML}=111,\\quad\\text{MAP}=?":"y=011:\\quad\\text{ML chooses }111;\\quad\\text{MAP chooses }000"):"M=8:\\quad P_{e,\\rm avg}=0.10,\\quad P_{e,\\max}=0.62");
    if(map>.5){this.nodes.forEach((node:CodeNode,i:number):void=>{Diagram.show(node.box,map);node.label.set({opacity:map,scale:i===0?1:.84});node.label.setContent(["P_J=(0.9,0.1)","x_0=000,\\ x_1=111","W^3(011\\mid x_0)=.032","W^3(011\\mid x_1)=.128"][i]);});}
    else this.nodes.forEach((node:CodeNode,i:number):void=>{node.label.set({scale:1});node.label.setContent(["J\\in\\{1,\\ldots,M\\}","x^n(J)","Y^n","\\widehat J(Y^n)"][i]);});
    this.note.set({opacity:c.p(16),y:845});this.note.setContent(map>.5?(ctx.localTime<c.s(29)?"BSC(.20): MAP compares prior-weighted likelihoods; the received triple is one possible output":"Prior-weighted likelihoods .0288 versus .0128 reverse the likelihood ranking"):"Left error list is an illustrative eight-message code; the definitions apply to its actual channel and decoder");
  }

  teardown(_layers:SceneLayers):void{this.repeatBits.length=0;this.repeatHeadings.length=0;this.nodes.length=0;this.arrows.length=0;this.errors.length=0;this.errorLabels.length=0;this.limits.length=0;this.scaleLabels.length=0;this.formulas.length=0;}
}
export function blockCodeScene():Scene{return new BlockCodeScene();}
