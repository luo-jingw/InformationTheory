import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface DictionaryRow {box:PanelMesh;label:FormulaHandle;}
interface EncodedRecord {pointer:number;symbol:string|null;phrase:string;pointerBits:number;}

export class LempelZivDictionaryScene implements Scene {
  readonly id="c06-lz78";
  private title!:FormulaHandle;
  private readonly bits:PanelMesh[]=[];
  private readonly bitLabels:FormulaHandle[]=[];
  private readonly dictionary:DictionaryRow[]=[];
  private readonly records:DictionaryRow[]=[];
  private readonly recordData:readonly EncodedRecord[]=[
    {pointer:0,symbol:"0",phrase:"0",pointerBits:0},
    {pointer:0,symbol:"1",phrase:"1",pointerBits:1},
    {pointer:1,symbol:"0",phrase:"00",pointerBits:2},
    {pointer:2,symbol:"0",phrase:"10",pointerBits:2},
    {pointer:1,symbol:null,phrase:"0",pointerBits:3},
  ];
  private dictionaryTitle!:FormulaHandle;
  private recordTitle!:FormulaHandle;
  private reconstructed!:FormulaHandle;
  private terminal!:FormulaHandle;
  private readonly budget:PanelMesh[]=[];
  private readonly budgetLabels:FormulaHandle[]=[];
  private total!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("LZ78 sends a dictionary pointer and one new symbol",960,100,46);
    for(let i=0;i<7;i++){this.bits.push(d.rectangle(525+i*145,235,105,70,"#203952"));this.bitLabels.push(d.text("0100100"[i],525+i*145,235,39,Palette.blue));}
    const phrases=["\\epsilon","0","1","00","10"];
    for(let i=0;i<5;i++){
      const y=385+i*78;this.dictionary.push({box:d.rectangle(460,y,480,62,"#203952"),label:d.tex(`${i}\\quad\\mapsto\\quad${i===0?"\\epsilon":`\\mathtt{${phrases[i]}}`}`,460,y,34,Palette.blue)});
      this.records.push({box:d.rectangle(1280,y,700,62,"#292039"),label:d.tex("",1280,y,32,Palette.purple)});
    }
    this.dictionaryTitle=d.text("DICTIONARY",460,320,31,Palette.blue);this.recordTitle=d.text("RECORD → OUTPUT PHRASE",1280,320,31,Palette.purple);
    this.reconstructed=d.tex("",1280,805,37,Palette.green);this.terminal=d.tex("",460,805,31,Palette.orange);
    for(let i=0;i<3;i++){this.budget.push(d.rectangle(0,540,1,95,[Palette.blue,Palette.green,Palette.orange][i]));this.budgetLabels.push(d.tex("",0,650,29,[Palette.blue,Palette.green,Palette.orange][i]));}
    this.total=d.tex("5+4+3=12\\text{ counted field bits}",460,760,35,Palette.yellow);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),decode=c.p(20),fields=c.p(32);
    this.title.set({opacity:c.p(0)});this.title.setContent(fields>.5?"Raw field counts need separate framing and EOF overhead":decode>.5?"The decoder rebuilds the same dictionary":"LZ78 sends a dictionary pointer and one new symbol");
    const encoding=[7,9,12,15,17],decoding=[21,23,25,27,28];
    const count=(decode>.5?decoding:encoding).filter((i:number):boolean=>ctx.localTime>=c.s(i)).length,consumed=[0,1,2,4,6,7][count];
    this.bits.forEach((mesh:PanelMesh,i:number):void=>{mesh.material.color.set(i<consumed?"#244132":"#203952");Diagram.show(mesh,c.p(0));this.bitLabels[i].set({opacity:decode>.5&&i>=consumed?.2:c.p(0),color:i<consumed?Palette.green:Palette.blue});});
    this.dictionary.forEach((row:DictionaryRow,i:number):void=>{const opacity=c.p(1)*(1-fields)*(i<=Math.min(count,4)?1:0);Diagram.show(row.box,opacity);row.label.set({opacity});});this.dictionaryTitle.set({opacity:(1-fields)*c.p(1)});
    this.records.forEach((row:DictionaryRow,i:number):void=>{
      const opacity=(decode>.5||fields>.5?1:i<count?1:0)*c.p(4),data=this.recordData[i];Diagram.show(row.box,opacity);row.box.material.color.set(i===count-1?"#244132":"#292039");
      row.label.setContent(fields>.5?data.symbol===null?`\\text{terminal }(1):\\quad${data.pointerBits}\\text{ pointer bits}`:`(${data.pointer},${data.symbol}):\\quad${data.pointerBits}\\text{ pointer bits}+1\\text{ new bit}`:data.symbol===null?"\\text{terminal pointer }1\\quad\\mapsto\\quad0":`(${data.pointer},${data.symbol})\\quad\\mapsto\\quad\\mathtt{${data.phrase}}`);row.label.set({opacity,color:i===count-1?Palette.green:Palette.purple});
    });this.recordTitle.set({opacity:c.p(4)});this.recordTitle.setContent(fields>.5?"ORDINARY RECORDS + TERMINAL RECORD":"RECORD → OUTPUT PHRASE");
    this.reconstructed.set({opacity:decode*(1-fields)});this.reconstructed.setContent(`\\text{Recovered: }\\mathtt{${"0100100".slice(0,consumed)||" "}}`);
    this.terminal.set({opacity:c.p(17)*(1-fields)});this.terminal.setContent("\\text{Terminal pointer uses an existing phrase; no new entry}");this.terminal.set({scale:.85});
    let x=190;const values=[5,4,3];this.budget.forEach((mesh:PanelMesh,i:number):void=>{const width=values[i]*45;mesh.scale.x=width;mesh.position.x=(x+width/2-960)/100;Diagram.show(mesh,fields);this.budgetLabels[i].setContent(["Pointers: 5","New bits: 4","Terminal: 3"][i]);this.budgetLabels[i].set({opacity:fields,x:190+i*205,y:650});x+=width;});this.total.set({opacity:c.p(37)*fields});
    this.note.set({opacity:c.p(2),y:845});this.note.setContent(fields>.5?(ctx.localTime<c.s(37)?"Count pointer fields, new bits and the terminal separately; framing adds protocol cost":"Twelve counts only the raw fields; record types, framing and end-of-file signaling add protocol bits"):decode>.5?"Pointers always reference previously known entries; the terminal record adds no dictionary phrase":ctx.localTime<c.s(17)?"Input 0100100; the dictionary grows only when a new phrase is created":"The distinguished pointer-only final record assumes known end of file");
  }

  teardown(_layers:SceneLayers):void{this.bits.length=0;this.bitLabels.length=0;this.dictionary.length=0;this.records.length=0;this.budget.length=0;this.budgetLabels.length=0;}
}
export function lempelZivDictionaryScene():Scene{return new LempelZivDictionaryScene();}
