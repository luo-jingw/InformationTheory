import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface CodewordRow {box:PanelMesh;label:FormulaHandle;word:string;distance:number;}
interface ProofLine {label:FormulaHandle;sentence:number;}

export class RandomCodebookScene implements Scene {
  readonly id="c03-random";
  private title!:FormulaHandle;
  private readonly codewords:CodewordRow[]=[];
  private readonly proof:ProofLine[]=[];
  private output!:FormulaHandle;
  private decision!:FormulaHandle;
  private readonly axes:Polyline[]=[];
  private exponent!:Polyline;
  private exponentLabel!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("A random-code ensemble proves a deterministic code exists",960,100,44);
    const words=["0010011010","0000000000","1111111111","1010101010","1100110011","1111000000","0000111100","0010011001","1101000110","0100100100","1001100101"],received="0010011011";
    for(let i=0;i<words.length;i++){
      const distance=[...words[i]].reduce((sum:number,v:string,j:number):number=>sum+(v===received[j]?0:1),0);
      this.codewords.push({box:d.rectangle(480,270+i*43,640,35,i===0?"#244132":"#203952"),label:d.tex(`j=${i+1}:\\quad\\mathtt{${words[i]}}`,480,270+i*43,27),word:words[i],distance});
    }
    this.output=d.tex("y^{10}=\\mathtt{0010011011}",480,205,32,Palette.orange);this.decision=d.tex("",480,800,31,Palette.yellow);
    const proof:ReadonlyArray<readonly[string,number]>=[
      ["0<R<I,\\quad M=\\lfloor2^{nR}\\rfloor",1],
      ["X^n(j)\\overset{\\rm iid}{\\sim}P_X^n\\quad\\text{independently over }j",5],
      ["a_n=P((X^n(J),Y^n)\\notin A)\\longrightarrow0",10],
      ["\\widetilde X^n(j)\\perp Y^n\\quad[j\\ne J,\\ \\text{ensemble average}]",14],
      ["\\mathbb E_{\\cal B}\\overline P_e\\le a_n+(M-1)2^{-n(I-3\\epsilon)}",19],
      ["\\le a_n+2^{-n\\Delta}\\to0,\\quad\\Delta=I-R-3\\epsilon>0",21],
    ];
    for(let i=0;i<proof.length;i++)this.proof.push({label:d.tex(proof[i][0],1350,240+i*105,i===1||i>=3?28:34,i>=4?Palette.yellow:Palette.text),sentence:proof[i][1]});
    this.axes.push(d.line([[180,300],[180,700],[830,700]],Palette.axis));
    this.exponent=d.line(Array.from({length:129},(_:unknown,n:number):readonly[number,number]=>[180+n*5,700-350*2**(-n*(.5310044064-.35-.12))]),Palette.green,5);
    this.exponentLabel=d.tex("I=.531004,\\ R=.35,\\epsilon=.04:\\quad2^{-n\\Delta}",500,770,29,Palette.green);this.note=d.text("",960,845,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),plot=c.p(20)*(1-c.p(24)),book=1-plot;
    this.title.set({opacity:c.p(0)});this.codewords.forEach((row:CodewordRow,i:number):void=>{const typical=row.distance===1;row.box.material.color.set(c.p(7)>.5&&typical?"#42613a":i===0?"#244132":"#203952");Diagram.show(row.box,c.p(5)*book);row.label.set({opacity:c.p(5)*book,color:c.p(7)>.5&&typical?Palette.yellow:Palette.text});});this.output.set({opacity:c.p(6)*book});
    this.decision.set({opacity:c.p(7)*book});this.decision.setContent(ctx.localTime>=c.s(24)?"\\exists\\,\\mathcal B:\\quad\\overline P_e(\\mathcal B)\\le\\mathbb E_{\\cal B}\\overline P_e":"\\text{This possible codebook has two typical candidates}");
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)}));this.axes.forEach((line:Polyline):void=>line.setOpacity(plot));this.exponent.setOpacity(plot);this.exponentLabel.set({opacity:plot});
    this.note.set({opacity:c.p(5)});this.note.setContent(plot>.5?"Only the exponential wrong-candidate term is plotted; aₙ vanishes by the weak law":ctx.localTime>=c.s(24)?"The possible codebook on the left illustrates confusion; existence does not claim every random codebook is reliable":"Finite example: n=10, M=11, uniform input, BSC(.1), ε=.04; distance-one pairs pass all three tests");
  }

  teardown(_layers:SceneLayers):void{this.codewords.length=0;this.proof.length=0;this.axes.length=0;}
}
export function randomCodebookScene():Scene{return new RandomCodebookScene();}
