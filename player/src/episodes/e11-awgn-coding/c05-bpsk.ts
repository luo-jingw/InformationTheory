import { Vector3 } from "three";
import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";
import { BpskNumerics, type CapacityPoint } from "./lib/BpskNumerics";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class BinaryGaussianInputScene implements Scene {
  readonly id="c05-bpsk";
  private title!:FormulaHandle;
  private readonly axes:Polyline[]=[];
  private readonly densities:Polyline[]=[];
  private readonly densityLabels:FormulaHandle[]=[];
  private readonly observationLines:Polyline[]=[];
  private readonly confidenceBars:PanelMesh[]=[];
  private readonly confidenceLabels:FormulaHandle[]=[];
  private readonly proof:ProofLine[]=[];
  private model!:FormulaHandle;
  private values!:FormulaHandle;
  private note!:FormulaHandle;
  private renderedGamma=Number.NaN;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Soft observations retain magnitude as well as sign",960,100,46);
    this.axes.push(d.line([[170,620],[850,620]],Palette.axis));
    this.densities.push(d.line([[170,620],[850,620]],Palette.blue,5),d.line([[170,620],[850,620]],Palette.purple,5));
    this.densityLabels.push(d.tex("f(r\\mid X=-\\sqrt P)",360,285,30,Palette.blue),d.tex("f(r\\mid X=+\\sqrt P)",680,285,30,Palette.purple));
    for(let i=0;i<2;i++){
      const r=i===0?.25:2,x=170+(r+6)*55;this.observationLines.push(d.line([[x,330],[x,620]],Palette.orange,3));this.confidenceBars.push(d.rectangle(i===0?310:690,760,120,1,i===0?Palette.blue:Palette.purple));this.confidenceLabels.push(d.tex("",i===0?310:690,800,25,i===0?Palette.blue:Palette.purple));
    }
    const proof:ReadonlyArray<readonly[string,number]>=[
      ["I(a)=I(1-a),\\quad I\\text{ concave}\\Rightarrow a=1/2\\text{ optimal}",4],
      ["X\\to R\\to\\operatorname{sign}(R)\\quad\\Rightarrow I_{\\rm hard}\\le I_{\\rm soft}",10],
      ["\\Lambda(r)=\\ln\\frac{f(r\\mid+\\sqrt P)}{f(r\\mid-\\sqrt P)}=\\frac{2\\sqrt P\\,r}{N}",13],
      ["P(X=+\\sqrt P\\mid r)=\\frac1{1+e^{-\\Lambda(r)}}",14],
      ["I_{\\rm soft}=1-\\mathbb E_{Z\\sim N(0,1)}\\log_2(1+e^{-2\\gamma-2\\sqrt\\gamma Z})",20],
      ["I_{\\rm hard}=1-h_2(Q(\\sqrt\\gamma)),\\quad\\gamma=P/N",24],
    ];
    for(let i=0;i<proof.length;i++)this.proof.push({label:d.tex(proof[i][0],1350,230+i*108,i===0||i===1||i===4?27:32,i===4?Palette.yellow:Palette.text),sentence:proof[i][1]});this.model=d.tex("N=1,\\ P=1,\\quad X\\in\\{-1,+1\\}\\text{ equally likely}",500,210,29,Palette.yellow);this.values=d.tex("",1350,815,30,Palette.green);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),gamma=ctx.localTime>=c.s(27)?10:1;
    this.title.set({opacity:c.p(0)});this.axes.forEach((line:Polyline):void=>line.setOpacity(c.p(5)));
    if(this.renderedGamma!==gamma){this.densities.forEach((line:Polyline,i:number):void=>{const mean=(i===0?-1:1)*Math.sqrt(gamma);line.setPoints(Array.from({length:241},(_:unknown,j:number):Vector3=>{const r=-6+j/20,x=170+(r+6)*55,y=620-650*Math.exp(-.5*(r-mean)**2)/Math.sqrt(2*Math.PI);return new Vector3((x-960)/100,(540-y)/100,0);}));});this.renderedGamma=gamma;}
    this.densities.forEach((line:Polyline):void=>line.setOpacity(c.p(5)));this.densityLabels.forEach((label:FormulaHandle):void=>label.set({opacity:c.p(5)}));this.observationLines.forEach((line:Polyline):void=>line.setOpacity(c.p(8)));
    this.confidenceBars.forEach((mesh:PanelMesh,i:number):void=>{const r=i===0?.25:2,posterior=1/(1+Math.exp(-2*Math.sqrt(gamma)*r));Diagram.bar(mesh,i===0?310:690,760,posterior*110,c.p(14));this.confidenceLabels[i].setContent(ctx.localTime<c.s(14)?`r=${r}>0:\\quad P(+\\mid r)=?`:`r=${r}>0:\\quad P(+\\mid r)=${posterior.toFixed(4)}`);this.confidenceLabels[i].set({opacity:c.p(8)});});
    this.model.set({opacity:c.p(0)});this.model.setContent(`N=1,\\ P=${gamma}:\\quad X=\\pm\\sqrt{${gamma}}\\text{ equiprobably}`);this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)}));
    const point=this.point(gamma);this.values.set({opacity:c.p(25)});this.values.setContent(`\\gamma=${gamma}:\\quad I_{\\rm soft}=${point.soft.toFixed(6)},\\quad I_{\\rm hard}=${point.hard.toFixed(6)}`);this.note.set({opacity:c.p(8),y:845});this.note.setContent(ctx.localTime<c.s(14)?"Both observations have positive sign. Compare what a sign-only decoder retains":"Their posterior confidences differ; the soft-information integral averages over actual transmitted signs");
  }

  teardown(_layers:SceneLayers):void{this.axes.length=0;this.densities.length=0;this.densityLabels.length=0;this.observationLines.length=0;this.confidenceBars.length=0;this.confidenceLabels.length=0;this.proof.length=0;this.renderedGamma=Number.NaN;}
  private point(snr:number):CapacityPoint{const point=BpskNumerics.points.find((p:CapacityPoint):boolean=>Math.abs(p.snr-snr)<1e-9);if(point===undefined)throw new Error(`Missing BPSK quadrature at ${snr}`);return point;}
}
export function binaryGaussianInputScene():Scene{return new BinaryGaussianInputScene();}
