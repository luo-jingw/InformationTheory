import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface TypicalCell {box:PanelMesh;distance:number;}
interface ProofLine {label:FormulaHandle;sentence:number;}

export class JointTypicalityScene implements Scene {
  readonly id="c02-joint";
  private title!:FormulaHandle;
  private readonly cells:TypicalCell[]=[];
  private readonly proof:ProofLine[]=[];
  private gridLabel!:FormulaHandle;
  private example!:FormulaHandle;
  private bound!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Three surprisal tests define weak joint typicality",960,100,46);
    for(let x=0;x<16;x++)for(let y=0;y<16;y++){
      let z=x^y,distance=0;while(z){distance+=z&1;z>>=1;}
      this.cells.push({box:d.rectangle(230+y*33,250+x*33,29,29,distance===1?"#387a50":"#1c2b3c"),distance});
    }
    this.gridLabel=d.tex("n=4,\\ p_X(1)=1/2,\\ W=\\operatorname{BSC}(1/4),\\ \\epsilon=.04",490,210,27,Palette.blue);
    const proof:ReadonlyArray<readonly[string,number]>=[
      ["|-n^{-1}\\log_2P_X^n(x^n)-H(X)|\\le\\epsilon",4],
      ["|-n^{-1}\\log_2P_Y^n(y^n)-H(Y)|\\le\\epsilon",6],
      ["|-n^{-1}\\log_2P_{XY}^n(x^n,y^n)-H(X,Y)|\\le\\epsilon",8],
      ["P((X^n,Y^n)\\in A_\\epsilon^{(n)})\\longrightarrow1",20],
      ["\\widetilde X^n\\perp Y^n:\\quad P=P_X^nP_Y^n",24],
      ["P((\\widetilde X^n,Y^n)\\in A)\\le2^{-n(I-3\\epsilon)}",33],
    ];
    for(let i=0;i<proof.length;i++)this.proof.push({label:d.tex(proof[i][0],1350,245+i*105,i===2?28:33,i===3||i===5?Palette.yellow:Palette.text),sentence:proof[i][1]});
    this.example=d.tex("H(X)=H(Y)=1,\\ H(X,Y)=1.811278",490,805,28,Palette.blue);this.bound=d.tex("",1350,815,30,Palette.green);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),wrong=c.p(21),count=c.p(28);
    this.title.set({opacity:c.p(0)});this.title.setContent(wrong>.5?"An independent wrong pair passes with exponentially small probability":"Three surprisal tests define weak joint typicality");this.title.set({scale:wrong>.5?.88:1});
    this.cells.forEach((cell:TypicalCell):void=>{const reveal=ctx.localTime>=c.s(12);cell.box.material.color.set(reveal&&cell.distance===1?"#387a50":"#1c2b3c");Diagram.show(cell.box,c.p(3)*(reveal&&cell.distance!==1?.35:1));});this.gridLabel.set({opacity:c.p(0)});this.example.set({opacity:c.p(3)});
    this.proof.forEach((line:ProofLine,i:number):void=>{
      const tests=["|-n^{-1}\\log_2P_X^n(x^n)-H(X)|\\le\\epsilon","|-n^{-1}\\log_2P_Y^n(y^n)-H(Y)|\\le\\epsilon","|-n^{-1}\\log_2P_{XY}^n(x^n,y^n)-H(X,Y)|\\le\\epsilon","P((X^n,Y^n)\\in A_\\epsilon^{(n)})\\longrightarrow1","\\widetilde X^n\\perp Y^n:\\quad P=P_X^nP_Y^n","P((\\widetilde X^n,Y^n)\\in A)\\le2^{-n(I-3\\epsilon)}"];
      const independent=["P_X^n(x^n)\\le2^{-n(H(X)-\\epsilon)}","P_Y^n(y^n)\\le2^{-n(H(Y)-\\epsilon)}","P_X^nP_Y^n\\le2^{-n(H(X)+H(Y)-2\\epsilon)}","|A|\\le2^{n(H(X,Y)+\\epsilon)}","I=H(X)+H(Y)-H(X,Y)","P_{\\rm independent}(A)\\le2^{-n(I-3\\epsilon)}"];
      line.label.setContent((wrong>.5?independent:tests)[i]);const cue=wrong>.5?[25,26,27,31,34,33][i]:line.sentence;line.label.set({opacity:c.p(cue),scale:1});
    });
    this.bound.set({opacity:count});this.bound.setContent("\\epsilon=.04:\\quad P_{\\rm indep}(A)=.25\\le.826515");
    this.note.set({opacity:c.p(3),y:845});this.note.setContent(ctx.localTime<c.s(12)?"Each row is one four-bit input; each column is one output. A marginal test does not inspect their pairing":"Green: distance-one pairs. Their finite true-pair mass is .421875; the probability-one limit concerns growing n.");
  }

  teardown(_layers:SceneLayers):void{this.cells.length=0;this.proof.length=0;}
}
export function jointTypicalityScene():Scene{return new JointTypicalityScene();}
