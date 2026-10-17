import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class ExpurgationScene implements Scene {
  readonly id="c04-expurgation";
  private title!:FormulaHandle;
  private readonly errors:PanelMesh[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly axes:Polyline[]=[];
  private threshold!:Polyline;
  private thresholdLabel!:FormulaHandle;
  private readonly proof:ProofLine[]=[];
  private example!:FormulaHandle;
  private retained!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Delete the few messages above the error threshold",960,100,46);
    for(let i=0;i<20;i++){this.errors.push(d.rectangle(180+i*34,710,25,1,i>=18?Palette.orange:Palette.blue));this.labels.push(d.text(String(i+1),180+i*34,755,17));}
    this.axes.push(d.line([[160,280],[160,710],[870,710]],Palette.axis));
    this.threshold=d.line([[160,710-400*Math.sqrt(.0809)],[870,710-400*Math.sqrt(.0809)]],Palette.green,4);this.thresholdLabel=d.tex("\\tau=\\sqrt\\eta=0.284429",500,560,31,Palette.green);
    const proof:ReadonlyArray<readonly[string,number]>=[
      ["0<\\eta<1,\\quad\\tau=\\sqrt\\eta",1],
      ["\\eta\\ge\\frac{|B|}{M}\\tau\\quad\\Rightarrow\\quad|B|/M\\le\\sqrt\\eta",4],
      ["M'\\ge M(1-\\sqrt\\eta)",7],
      ["P'_{e,\\max}\\le\\sqrt\\eta",13],
      ["R'\\ge R+\\frac1n\\log_2(1-\\sqrt\\eta)",14],
      ["\\eta\\to0:\\quad R'-R\\to0\\text{ in the coding limit}",15],
    ];
    for(let i=0;i<proof.length;i++)this.proof.push({label:d.tex(proof[i][0],1350,245+i*105,i===1||i===5?30:35,i===2||i===3?Palette.yellow:Palette.text),sentence:proof[i][1]});
    this.example=d.tex("M=20,\\quad\\eta=0.0809",500,225,34,Palette.blue);this.retained=d.tex("",500,810,31,Palette.yellow);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),remove=c.p(6),zero=c.p(16);
    this.title.set({opacity:c.p(0)});this.errors.forEach((mesh:PanelMesh,i:number):void=>{const bad=i>=18;Diagram.bar(mesh,180+i*34,710,(bad?.8:.001)*400*(1-zero),c.p(0)*(bad?1-.85*remove:1));this.labels[i].set({opacity:c.p(0)*(bad?1-.85*remove:1)});});
    this.axes.forEach((line:Polyline):void=>line.setOpacity(c.p(0)));this.threshold.setOpacity(c.p(2)*(1-zero));this.thresholdLabel.set({opacity:c.p(2)*(1-zero)});
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*(1-zero)}));this.example.set({opacity:c.p(0)});this.example.setContent(zero>.5?"\\eta=0:\\quad\\text{every conditional error is zero}":"M=20:\\quad18(0.001)+2(0.8)=20\\eta");
    this.retained.set({opacity:c.p(7)});this.retained.setContent(zero>.5?"\\text{Delete nothing: }M'=M,\\quad P'_{e,\\max}=0":"M'=18,\\quad\\max_{j\\ \\rm retained}e_j=0.001\\le\\sqrt\\eta");
    this.note.set({opacity:c.p(9),y:845});this.note.setContent("Keep each retained correct decoding region; reassign deleted outputs to one retained message. No retained error increases.");
  }

  teardown(_layers:SceneLayers):void{this.errors.length=0;this.labels.length=0;this.axes.length=0;this.proof.length=0;}
}
export function expurgationScene():Scene{return new ExpurgationScene();}
