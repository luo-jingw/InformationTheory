import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface GraphEdge { line: Polyline; label: FormulaHandle; }

export class MarkovClassesScene implements Scene {
  readonly id = "c03-classes";
  private title!: FormulaHandle;
  private readonly nodes: PanelMesh[] = [];
  private readonly nodeLabels: FormulaHandle[] = [];
  private readonly edges: GraphEdge[] = [];
  private readonly groups: PanelMesh[] = [];
  private readonly groupLabels: FormulaHandle[] = [];
  private definition!: FormulaHandle;
  private readonly alternatingNodes: PanelMesh[] = [];
  private readonly alternatingLabels: FormulaHandle[] = [];
  private readonly alternatingEdges: Polyline[] = [];
  private readonly distributionBars: PanelMesh[] = [];
  private returnTimes!: FormulaHandle;
  private distribution!: FormulaHandle;
  private stationary!: FormulaHandle;
  private note!: FormulaHandle;
  private pathMarker!: PanelMesh;
  private alternatingMarker!: PanelMesh;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Communication, closure, and recurrence", 960, 100, 47);
    const points: ReadonlyArray<readonly [number, number]> = [[210, 450], [520, 450], [1030, 310], [1450, 310], [1030, 620], [1450, 620]];
    for (let i = 0; i < points.length; i++) { this.nodes.push(d.rectangle(points[i][0], points[i][1], 135, 90, i < 2 ? "#3b2c2f" : i < 4 ? "#244132" : "#3a2f4a")); this.nodeLabels.push(d.tex(String(i), points[i][0], points[i][1], 43)); }
    const paths: ReadonlyArray<readonly [ReadonlyArray<readonly [number, number]>, string, number, number]> = [
      [[[285,450],[440,450],[425,438],[440,450],[425,462]],"0.5",365,405],
      [[[600,430],[950,310],[925,305],[950,310],[935,328]],"0.4",760,300],
      [[[600,470],[950,620],[925,600],[950,620],[925,625]],"0.4",760,620],
      [[[1110,285],[1370,285],[1355,273],[1370,285],[1355,297]],"0.4",1240,245],
      [[[1370,345],[1110,345],[1125,333],[1110,345],[1125,357]],"0.3",1240,385],
      [[[1110,595],[1370,595],[1355,583],[1370,595],[1355,607]],"1",1240,555],
      [[[1370,655],[1110,655],[1125,643],[1110,655],[1125,667]],"1",1240,700],
    ];
    for (const [path,label,x,y] of paths) this.edges.push({line:d.line(path,Palette.axis,4),label:d.tex(label,x,y,28,Palette.muted)});
    this.groups.push(d.rectangle(1240,310,660,250,"#153625"),d.rectangle(1240,620,660,250,"#292039"));
    this.groups.forEach((mesh:PanelMesh):void=>{mesh.position.z=-0.1;});
    this.groupLabels.push(d.text("Closed class A: {2,3}",1240,180,30,Palette.green),d.text("Closed class B: {4,5}",1240,745,30,Palette.purple));
    this.definition=d.tex("i\\leftrightarrow j:\\quad i\\leadsto j\\text{ and }j\\leadsto i",960,790,32,Palette.yellow);
    for(let i=0;i<2;i++){this.alternatingNodes.push(d.rectangle(560+i*800,400,230,150,i===0?"#203952":"#3a2f4a"));this.alternatingLabels.push(d.tex(String(i),560+i*800,400,58));this.distributionBars.push(d.rectangle(720+i*470,710,135,1,i===0?Palette.blue:Palette.purple));}
    this.alternatingEdges.push(d.line([[700,365],[1220,365],[1200,350],[1220,365],[1200,380]],Palette.blue,5),d.line([[1220,440],[700,440],[720,425],[700,440],[720,455]],Palette.purple,5));
    this.returnTimes=d.tex("0\\to1\\to0:\\quad\\{2,4,6,\\ldots\\},\\quad\\gcd=2",960,245,43,Palette.yellow);
    this.distribution=d.tex("",960,745,35,Palette.orange);this.stationary=d.tex("\\pi=(1/2,1/2),\\quad\\pi P=\\pi",960,795,33,Palette.green);
    this.note=d.text("",960,860,24,Palette.muted);
    this.pathMarker=d.rectangle(210,450,26,26,Palette.yellow);
    this.pathMarker.position.z=0.05;
    this.alternatingMarker=d.rectangle(560,500,28,28,Palette.yellow);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),periodic=c.p(19),graph=1-periodic;
    this.title.set({opacity:c.p(0)});this.title.setContent(ctx.localTime >= c.s(24) ? "Stationarity and convergence ask different questions" : ctx.localTime >= c.s(23) ? "Start at zero: will this distribution settle down?" : periodic>0.5 ? "An irreducible chain can be periodic" : ctx.localTime < c.s(5) ? "Where can this chain get trapped?" : "Communication, closure, and recurrence");
    this.groups.forEach((mesh:PanelMesh,i:number):void=>{Diagram.show(mesh,c.p(4)*graph*.45);this.groupLabels[i].set({opacity:c.p(5)*graph});});
    this.nodes.forEach((mesh:PanelMesh,i:number):void=>{Diagram.show(mesh,c.p(0)*graph);this.nodeLabels[i].set({opacity:c.p(0)*graph});});
    this.edges.forEach((edge:GraphEdge):void=>{edge.line.setOpacity(c.p(1)*graph);edge.label.set({opacity:c.p(1)*graph});});
    this.definition.set({opacity:c.p(3)*graph});this.definition.setContent(ctx.localTime>=c.s(12)?"2\\text{ closed classes},\\quad4\\text{ recurrent states},\\quad2\\text{ transient states}":ctx.localTime>=c.s(7)?"\\text{States }0,1\\text{ transient; }2,3,4,5\\text{ recurrent}":"i\\leftrightarrow j:\\quad i\\leadsto j\\text{ and }j\\leadsto i");
    this.alternatingNodes.forEach((mesh:PanelMesh,i:number):void=>{Diagram.show(mesh,periodic);this.alternatingLabels[i].set({opacity:periodic});});this.alternatingEdges.forEach((edge:Polyline):void=>edge.setOpacity(periodic));
    const path: ReadonlyArray<readonly [number,number]> = [[210,450],[520,450],[1030,310],[1450,310],[1030,310]];
    const progress=Math.max(0,Math.min(3.999,(ctx.localTime-c.s(2))/Math.max(0.1,c.s(6)-c.s(2))*4));
    const pathIndex=Math.floor(progress),fraction=progress-pathIndex;
    const from=path[pathIndex],to=path[pathIndex+1];
    this.pathMarker.position.set((from[0]+(to[0]-from[0])*fraction-960)/100,(600-from[1]-(to[1]-from[1])*fraction)/100,0.05);
    Diagram.show(this.pathMarker,c.p(2)*graph);
    const step=Math.max(0,Math.floor((ctx.localTime-c.s(24))/1.5)),zero=step%2===0;
    this.alternatingMarker.position.set(((zero?560:1360)-960)/100,(540-500)/100,0.05);
    Diagram.show(this.alternatingMarker,c.p(24));
    this.distributionBars.forEach((mesh:PanelMesh,i:number):void=>Diagram.bar(mesh,720+i*470,710,(i===0?zero:!zero)?150:0,c.p(24)));
    this.returnTimes.set({opacity:periodic});this.distribution.set({opacity:c.p(24)});this.distribution.setContent(`\\mu_${step}=${zero?"(1,0)":"(0,1)"}\\quad[\\mu_0=(1,0)]`);
    this.stationary.set({opacity:c.p(24)});this.note.set({opacity:c.p(1),y:840});this.note.setContent(periodic>0.5 ? ctx.localTime < c.s(24) ? "Start at state 0. A different experiment starts with a fair random state." : "Stationary initialization stays fixed; initialization at state 0 alternates forever":"Self-loops at 0,1,2,3 are omitted from this graph; their remaining row probabilities make each row sum to one");
  }

  teardown(_layers:SceneLayers):void{this.nodes.length=0;this.nodeLabels.length=0;this.edges.length=0;this.groups.length=0;this.groupLabels.length=0;this.alternatingNodes.length=0;this.alternatingLabels.length=0;this.alternatingEdges.length=0;this.distributionBars.length=0;}
}
export function markovClassesScene():Scene{return new MarkovClassesScene();}
