import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface CostCell {box:PanelMesh;value:FormulaHandle;row:number;column:number;}
interface DefinitionLine {label:FormulaHandle;sentence:number;}

export class UniversalCodingCriteriaScene implements Scene {
  readonly id="c05-universal";
  private title!:FormulaHandle;
  private readonly cells:CostCell[]=[];
  private readonly headers:FormulaHandle[]=[];
  private readonly outlines:Polyline[]=[];
  private readonly definitions:DefinitionLine[]=[];
  private classLabel!:FormulaHandle;
  private redundancy!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("A universal claim needs a source class and a criterion",960,100,45);
    const costs=[[1.2,1.9],[1.9,1.2]];
    for(let row=0;row<2;row++)for(let column=0;column<2;column++){
      const x=480+column*270,y=370+row*190;this.cells.push({box:d.rectangle(x,y,230,135,row===column?"#244132":"#44362b"),value:d.tex(costs[row][column].toFixed(1),x,y,52,row===column?Palette.green:Palette.orange),row,column});
    }
    this.headers.push(d.tex("C_1:\\ l=(1,2,2)",480,255,29,Palette.blue),d.tex("C_2:\\ l=(2,1,2)",750,255,29,Palette.purple),d.tex("P_1=(.8,.1,.1)",185,370,25),d.tex("P_2=(.1,.8,.1)",185,560,25));
    for(const x of [480,750])this.outlines.push(d.line([[x-125,285],[x+125,285],[x+125,650],[x-125,650],[x-125,285]],Palette.yellow,4));
    const defs:ReadonlyArray<readonly[string,number]>=[
      ["\\mathcal R_n(P,C_n)=\\mathbb E_P[\\ell_{C_n}(X^n)]-nH(P)",8],
      ["\\text{Pointwise: fix }P\\text{ before studying }n\\to\\infty",11],
      ["\\sup_{P\\in\\mathcal C}\\mathcal R_n(P,C_n)",12],
      ["\\inf_{C_n\\in\\mathcal A_n}\\sup_{P\\in\\mathcal C}\\mathcal R_n(P,C_n)",13],
      ["\\text{State source class, admissible codes, and claimed limit}",19],
    ];
    for(let i=0;i<defs.length;i++)this.definitions.push({label:d.tex(defs[i][0],1370,260+i*115,i===0||i===4?28:34,i===3?Palette.yellow:Palette.text),sentence:defs[i][1]});
    this.classLabel=d.tex("n=1:\\quad\\mathcal C_{\\rm example}=\\{P_1,P_2\\}",490,710,32,Palette.blue);
    this.redundancy=d.tex("H(P_1)=H(P_2)=0.921928\\text{ bits}",490,785,29,Palette.green);this.note=d.text("",960,845,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),worst=c.p(12),redundancy=c.p(9);
    this.title.set({opacity:c.p(0)});this.title.setContent(ctx.localTime<c.s(4)?"Which codebook wins for both sources?":ctx.localTime<c.s(5)?"The cheaper code changes when the source changes":"A universal claim needs a source class and a criterion");this.cells.forEach((cell:CostCell):void=>{Diagram.show(cell.box,c.p(1));cell.box.material.color.set(ctx.localTime<c.s(4)?"#203952":cell.row===cell.column?"#244132":"#44362b");cell.value.set({opacity:c.p(1)});const mean=cell.row===cell.column?1.2:1.9;cell.value.setContent(ctx.localTime<c.s(4)?"?":redundancy>.5?(mean-.9219280948873623).toFixed(5):mean.toFixed(1));});this.headers.forEach((label:FormulaHandle,index:number):void=>label.set({opacity:c.p(index<2?2:1)}));
    this.outlines.forEach((line:Polyline,i:number):void=>line.setOpacity(worst*(i===0?1:.25)));
    this.definitions.forEach((line:DefinitionLine):void=>line.label.set({opacity:c.p(line.sentence)}));this.classLabel.set({opacity:c.p(8)});this.redundancy.set({opacity:c.p(9)});
    this.note.set({opacity:c.p(8)});this.note.setContent(ctx.localTime>=c.s(28)?"LZ78 is introduced next as a dictionary mechanism; the short example establishes no asymptotic redundancy theorem":worst>.5?"Displayed prefix-code candidates illustrate worst-over-source order; this matrix does not establish global minimax optimality":"Each row fixes a source law; each column fixes one code. Entries change from expected length to redundancy.");
  }

  teardown(_layers:SceneLayers):void{this.cells.length=0;this.headers.length=0;this.outlines.length=0;this.definitions.length=0;}
}
export function universalCodingCriteriaScene():Scene{return new UniversalCodingCriteriaScene();}
