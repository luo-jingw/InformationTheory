import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram } from "../e01-entropy-information/lib/Diagram";

export class GaussianVolumeGeometryScene implements Scene {
  readonly id="c04-geometry";
  private title!:FormulaHandle;
  private readonly circles:Polyline[]=[];
  private readonly labels:FormulaHandle[]=[];
  private ratio!:FormulaHandle;
  private rate!:FormulaHandle;
  private parameters!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Compare the typical output region with the noise region",960,100,45);
    for(let i=0;i<3;i++){
      const circle=d.line(Array.from({length:181},(_:unknown,j:number):readonly[number,number]=>[960+Math.cos(j*Math.PI/90),540+Math.sin(j*Math.PI/90)]),[Palette.blue,Palette.purple,Palette.green][i],i===0?5:4);circle.object.position.set(((i===2?1430:500)-960)/100,(540-465)/100,0);this.circles.push(circle);
    }
    this.labels.push(d.tex("R_{\\rm out}\\approx\\sqrt{n(P+N)}",990,250,35,Palette.blue),d.tex("R_Z\\approx\\sqrt{nN}",500,485,33,Palette.purple),d.tex("R_{\\rm in}=\\sqrt{nP}",1430,220,35,Palette.green),d.text("INPUT POWER BALL",1430,780,30,Palette.green));
    this.ratio=d.tex("\\frac{V_n(R_{\\rm out})}{V_n(R_Z)}\\approx\\left(\\frac{P+N}{N}\\right)^{n/2}",960,800,39,Palette.yellow);this.rate=d.tex("n^{-1}\\log_2\\frac{V_{\\rm out}}{V_Z}\\approx\\tfrac12\\log_2(1+P/N)",960,300,37,Palette.yellow);this.parameters=d.tex("",960,370,32,Palette.text);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),p=1+3*c.p(23),noise=1+3*c.p(25),radii=[Math.sqrt(100*(p+noise))*10,Math.sqrt(100*noise)*10,Math.sqrt(100*p)*10];
    this.title.set({opacity:c.p(0)});this.title.setContent(ctx.localTime<c.s(8)?"Which regions belong in the receiver-side volume ratio?":"Compare the typical output region with the noise region");this.circles.forEach((circle:Polyline,i:number):void=>{circle.object.scale.set(radii[i],radii[i],1);circle.setOpacity(c.p(i===0?4:i===1?5:1));});this.labels.forEach((label:FormulaHandle,i:number):void=>label.set({opacity:c.p(i===0?4:i===1?5:1)}));
    this.ratio.set({opacity:c.p(9),y:795});this.rate.set({opacity:c.p(10),x:960,y:165,scale:.9});this.parameters.set({opacity:c.p(4),x:990,y:430});this.parameters.setContent(`\\begin{gathered}n=100\\\\P=${p.toFixed(1)},\\ N=${noise.toFixed(1)}\\\\C=${(.5*Math.log2(1+p/noise)).toFixed(4)}\\end{gathered}`);
    this.note.set({opacity:c.p(8),y:845});this.note.setContent("Circles show radii in a two-dimensional schematic. The exponent uses n real dimensions; this is not a disjoint-sphere proof.");
  }

  teardown(_layers:SceneLayers):void{this.circles.length=0;this.labels.length=0;}
}
export function gaussianVolumeGeometryScene():Scene{return new GaussianVolumeGeometryScene();}
