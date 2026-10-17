import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";
import { BpskNumerics, type CapacityPoint } from "./lib/BpskNumerics";

interface NumericRow {label:FormulaHandle;sentence:number;}

export class GaussianBinaryComparisonScene implements Scene {
  readonly id="c06-comparison";
  private title!:FormulaHandle;
  private readonly axes:Polyline[]=[];
  private readonly curves:Polyline[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly markers:PanelMesh[]=[];
  private readonly table:NumericRow[]=[];
  private source!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Identical power and noise, different admissible input families",960,100,43);
    const xAt=(s:number):number=>170+(Math.log10(s)+2)*230,yAt=(bits:number):number=>740-bits*135;
    this.axes.push(d.line([[170,230],[170,740],[1090,740]],Palette.axis));
    const gaussian:Array<readonly[number,number]>=[],soft:Array<readonly[number,number]>=[],hard:Array<readonly[number,number]>=[];
    for(const p of BpskNumerics.points){gaussian.push([xAt(p.snr),yAt(p.gaussian)]);soft.push([xAt(p.snr),yAt(p.soft)]);hard.push([xAt(p.snr),yAt(p.hard)]);}
    this.curves.push(d.line(gaussian,Palette.green,5),d.line(soft,Palette.blue,5),d.line(hard,Palette.orange,4),d.line([[170,yAt(1)],[1090,yAt(1)]],Palette.axis,2));
    this.labels.push(d.text("Gaussian input",350,210,29,Palette.green),d.text("BPSK, soft",650,210,29,Palette.blue),d.text("BPSK, hard",920,210,29,Palette.orange),d.text("s=P/N · logarithmic horizontal scale",650,810,29,Palette.muted),d.text("bits/real use",230,160,25,Palette.muted));
    for(const s of [.01,.1,1,10,100])this.labels.push(d.tex(String(s),xAt(s),775,25));for(const bits of [0,1,2,3])this.labels.push(d.tex(String(bits),130,yAt(bits),24));
    this.labels.push(d.tex("H(X_{\\rm BPSK})=1",400,yAt(1)-35,29,Palette.axis));
    for(let i=0;i<3;i++)this.markers.push(d.rectangle(0,0,17,17,[Palette.green,Palette.blue,Palette.orange][i]));
    this.table.push({label:d.tex("s\\qquad C_G\\qquad I_{\\rm soft}\\qquad I_{\\rm hard}",1480,280,27,Palette.yellow),sentence:0});
    for(let i=0;i<3;i++){
      const snr=[.1,1,10][i],point=this.point(snr);this.table.push({label:d.tex(`${snr}\\quad${point.gaussian.toFixed(6)}\\quad${point.soft.toFixed(6)}\\quad${point.hard.toFixed(6)}`,1480,375+i*115,24),sentence:[5,7,9][i]});
    }
    this.source=d.tex("Z\\in[-12,12],\\quad\\epsilon_{\\rm abs}=\\epsilon_{\\rm rel}=10^{-10}",1480,710,28,Palette.green);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime);this.title.set({opacity:c.p(0)});this.axes.forEach((line:Polyline):void=>line.setOpacity(c.p(0)));this.curves.forEach((line:Polyline,i:number):void=>{line.setProgress(ctx.localTime<c.s(9)?.5:1);line.setOpacity(c.p(i===0?1:i===1?2:18));});this.labels.forEach((label:FormulaHandle,i:number):void=>label.set({opacity:c.p(i===2?18:0)}));this.table.forEach((row:NumericRow):void=>row.label.set({opacity:c.p(row.sentence)}));
    const snr=ctx.localTime>=c.s(9)?10:ctx.localTime>=c.s(7)?1:.1,point=this.point(snr),x=170+(Math.log10(snr)+2)*230;
    this.markers.forEach((mesh:PanelMesh,i:number):void=>{mesh.position.set((x-960)/100,(540-740+[point.gaussian,point.soft,point.hard][i]*135)/100,.1);Diagram.show(mesh,c.p(i===2?18:5));});
    this.source.set({opacity:c.p(11)});this.note.set({opacity:c.p(3),y:845});this.note.setContent("Each SNR uses N=1 and P=s for both input families. Curves are numerical formula evaluations, not measured coding performance.");
  }

  teardown(_layers:SceneLayers):void{this.axes.length=0;this.curves.length=0;this.labels.length=0;this.markers.length=0;this.table.length=0;}
  private point(snr:number):CapacityPoint{const point=BpskNumerics.points.find((p:CapacityPoint):boolean=>Math.abs(p.snr-snr)<1e-9);if(point===undefined)throw new Error(`Missing BPSK quadrature at ${snr}`);return point;}
}
export function gaussianBinaryComparisonScene():Scene{return new GaussianBinaryComparisonScene();}
