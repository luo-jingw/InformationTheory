import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class GaussianCodebookSelectionScene implements Scene {
  readonly id="c03-codebook";
  private title!:FormulaHandle;
  private readonly proof:ProofLine[]=[];
  private readonly powers:PanelMesh[]=[];
  private readonly errors:PanelMesh[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly thresholds:Polyline[]=[];
  private powerLabel!:FormulaHandle;
  private errorLabel!:FormulaHandle;
  private selection!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("A Gaussian ensemble needs both power and error selection",960,100,44);
    for(let i=0;i<20;i++){this.powers.push(d.rectangle(180+i*34,455,24,1,Palette.blue));this.errors.push(d.rectangle(180+i*34,710,24,1,Palette.orange));this.labels.push(d.text(String(i+1),180+i*34,755,17));}
    this.thresholds.push(d.line([[160,255],[860,255]],Palette.green,4),d.line([[160,650],[860,650]],Palette.green,4));
    this.powerLabel=d.tex("P=1:\\quad\\|x^n(j)\\|^2/n",500,210,32,Palette.blue);this.errorLabel=d.tex("\\tau=\\sqrt\\delta=.3,\\quad\\delta=.09",500,520,32,Palette.orange);
    const lines:ReadonlyArray<readonly[string,number]>=[
      ["0<P'<P,\\quad X_i(j)\\overset{\\rm iid}{\\sim}N(0,P')",0],
      ["R<I=\\tfrac12\\log_2(1+P'/N),\\quad3\\epsilon<I-R",2],
      ["\\frac{f_X^nf_Y^n}{f_{XY}^n}\\le2^{-n(I-3\\epsilon)}\\quad\\text{on }A",16],
      ["P_{\\rm independent}(A)\\le2^{-n(I-3\\epsilon)}\\int_Af_{XY}^n\\le2^{-n(I-3\\epsilon)}",19],
      ["\\epsilon_n=\\mathbb E_{\\cal B}\\overline P_e\\to0,\\quad\\beta_n=\\mathbb E_{\\cal B}b_{\\rm power}\\to0",28],
      ["\\exists\\mathcal B:\\quad\\overline P_e+b_{\\rm power}\\le\\delta_n=\\epsilon_n+\\beta_n",30],
    ];
    for(let i=0;i<lines.length;i++)this.proof.push({label:d.tex(lines[i][0],1350,245+i*105,i===3||i===4||i===5?26:30,i>=4?Palette.yellow:Palette.text),sentence:lines[i][1]});
    this.selection=d.tex("",500,810,30,Palette.yellow);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),powerDelete=c.p(31),errorDelete=c.p(34),selection=c.p(22);
    this.title.set({opacity:c.p(0)});this.powers.forEach((mesh:PanelMesh,i:number):void=>{const opacity=selection*(i===19?1-.9*powerDelete:i===18?1-.9*errorDelete:1);Diagram.bar(mesh,180+i*34,455,(i===19?1.2:i%2===0?.6:.8)*200,opacity);Diagram.bar(this.errors[i],180+i*34,710,(i===18?.6:.001)*200,opacity);this.labels[i].set({opacity});});
    this.thresholds.forEach((line:Polyline,i:number):void=>line.setOpacity(c.p(i===0?22:34)));this.powerLabel.set({opacity:selection});this.errorLabel.set({opacity:c.p(34)});
    this.proof.forEach((line:ProofLine,i:number):void=>{
      const initial=["0<P'<P,\\quad X_i(j)\\overset{\\rm iid}{\\sim}N(0,P')","R<I=\\tfrac12\\log_2(1+P'/N),\\quad3\\epsilon<I-R","\\frac{f_X^nf_Y^n}{f_{XY}^n}\\le2^{-n(I-3\\epsilon)}\\quad\\text{on }A","P_{\\rm independent}(A)\\le2^{-n(I-3\\epsilon)}\\int_Af_{XY}^n\\le2^{-n(I-3\\epsilon)}","\\epsilon_n=\\mathbb E_{\\cal B}\\overline P_e\\to0,\\quad\\beta_n=\\mathbb E_{\\cal B}b_{\\rm power}\\to0","\\exists\\mathcal B:\\quad\\overline P_e+b_{\\rm power}\\le\\delta_n=\\epsilon_n+\\beta_n"];
      const selected=["\\delta_n=0:\\quad\\text{no deletion is needed}","\\delta_n>0:\\quad\\text{discard overpowered messages}","\\overline P_e\\le\\delta_n\\Rightarrow\\text{bad-error fraction}\\le\\sqrt{\\delta_n}","\\text{Total removed fraction}\\le\\delta_n+\\sqrt{\\delta_n}\\to0","\\forall j\\text{ retained}:\\quad\\|x^n(j)\\|^2\\le nP,\\quad e_j\\le\\sqrt{\\delta_n}","R'\\to R;\\quad P'\\uparrow P\\text{ gives every }R<C"];
      line.label.setContent((ctx.localTime>=c.s(33)?selected:initial)[i]);line.label.set({opacity:c.p(ctx.localTime>=c.s(33)?[33,34,35,36,38,42][i]:line.sentence)});
    });
    this.selection.set({opacity:c.p(30)});this.selection.setContent(errorDelete>.5?"\\text{Retain 18/20: all powers}\\le1,\\quad e_j=.001":"\\overline P_e=.03095,\\ b_{\\rm power}=.05:\\quad.08095\\le\\delta=.09");this.note.set({opacity:c.p(22),y:845});this.note.setContent("Left: finite schematic selection numbers. The proof selects an actual codebook from its ensemble expectation, then preserves retained decoding regions.");
  }

  teardown(_layers:SceneLayers):void{this.proof.length=0;this.powers.length=0;this.errors.length=0;this.labels.length=0;this.thresholds.length=0;}
}
export function gaussianCodebookSelectionScene():Scene{return new GaussianCodebookSelectionScene();}
