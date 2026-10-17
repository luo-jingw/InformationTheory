import type { ChapterTiming, Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

import { LostBitExperiment } from "./lib/LostBitExperiment";

export class MarkovFactorizationScene implements Scene {
  readonly id = "c01-markov";
  private title!: FormulaHandle;
  private lostBit!: LostBitExperiment;
  private legacyTiming!: ChapterTiming;
  private readonly nodes: PanelMesh[] = [];
  private readonly nodeLabels: FormulaHandle[] = [];
  private readonly arrows: Polyline[] = [];
  private bypass!: Polyline;
  private factorization!: FormulaHandle;
  private conditional!: FormulaHandle;
  private readonly cells: PanelMesh[] = [];
  private readonly values: FormulaHandle[] = [];
  private tableTitle!: FormulaHandle;
  private verdict!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers, timing: ChapterTiming): void {
    const d = new Diagram(layers);
    this.lostBit = new LostBitExperiment(d);
    this.legacyTiming = { duration: timing.duration, sentenceStarts: timing.sentenceStarts.slice(8), sentenceEnds: timing.sentenceEnds.slice(8) };
    this.title = d.text("A Markov chain is a factorization of a probability law", 960, 100, 45);
    for (let i = 0; i < 3; i++) { const x = 380 + 580 * i; this.nodes.push(d.rectangle(x, 295, 210, 110, i === 1 ? "#284333" : "#203952")); this.nodeLabels.push(d.tex(["Z", "X", "Y"][i], x, 295, 53, i === 1 ? Palette.green : Palette.blue)); }
    for (const x of [510,1090]) this.arrows.push(d.line([[x,295],[x+300,295],[x+280,280],[x+300,295],[x+280,310]],Palette.axis,4));
    this.bypass = d.line([[380,235],[380,190],[1540,190],[1540,235],[1525,215],[1540,235],[1555,215]],Palette.orange,4);
    this.factorization = d.tex("p(z,x,y)=p(z)p(x\\mid z)p(y\\mid x)",960,435,43,Palette.yellow);
    this.conditional = d.tex("Y\\perp Z\\mid X\\quad\\Longleftrightarrow\\quad p(y\\mid x,z)=p(y\\mid x)",960,550,39,Palette.green);
    for(let i=0;i<4;i++){ const x=480+(i%2)*155,y=665+Math.floor(i/2)*95;this.cells.push(d.rectangle(x,y,140,80,"#203952"));this.values.push(d.text("",x,y,32)); }
    this.tableTitle=d.tex("",550,580,30,Palette.blue);
    this.verdict=d.tex("",1320,710,36,Palette.yellow);
    this.note=d.text("",960,815,29,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    this.lostBit.draw(ctx);
    const c=new Cues(this.legacyTiming,ctx.localTime);
    const parity=c.p(17)*(1-c.p(23));
    const exact=c.p(10)*(1-c.p(17));
    const checking=c.p(36)*(1-c.p(39));
    const example=exact+parity+checking;
    const reverse=c.p(39)*(1-c.p(40));
    this.title.set({opacity:c.p(0)});
    this.title.setContent(parity>0.5?"Ordinary independence can disappear after conditioning":exact>0.5?"Conditional independence can coexist with dependent endpoints":"A Markov chain is a factorization of a probability law");
    this.nodes.forEach((node:PanelMesh,i:number):void=>{Diagram.show(node,c.p(1)*(parity>0.5?0.3:1));this.nodeLabels[i].set({opacity:c.p(1)});});
    this.arrows.forEach((arrow:Polyline):void=>arrow.setOpacity(c.p(1)*(1-parity)));
    // Reverse labels and factorization without relocating arrow geometry.
    if(reverse>0.5){this.nodeLabels[0].setContent("Y");this.nodeLabels[2].setContent("Z");}else{this.nodeLabels[0].setContent("Z");this.nodeLabels[2].setContent("Y");}
    this.factorization.set({opacity:c.p(2),y:example>0.5?435:460,scale:parity>0.5?0.9:1});
    this.factorization.setContent(parity>0.5?"X\\perp Y,\\quad Z=X\\oplus Y\\quad\\text{(a different law)}":reverse>0.5?"p(z,x,y)=p(y)p(x\\mid y)p(z\\mid x)":"p(z,x,y)=p(z)p(x\\mid z)p(y\\mid x)");
    this.conditional.set({opacity:c.p(4)*(1-example),y:560});
    this.conditional.setContent(ctx.localTime>=c.s(39)?"Z\\perp Y\\mid X:\\quad\\text{the middle variable remains }X":"Y\\perp Z\\mid X\\quad\\Longleftrightarrow\\quad p(y\\mid x,z)=p(y\\mid x)");
    this.bypass.setOpacity(c.p(34)*(1-c.p(36))*0.7);
    const conditioned=exact>0.5?c.p(13)*(1-c.p(15)):parity>0.5?c.p(20):1;
    const ps=parity>0.5?[0.25+0.25*conditioned,0.25*(1-conditioned),0.25*(1-conditioned),0.25+0.25*conditioned]:[0.5+0.5*conditioned,0,0,0.5*(1-conditioned)];
    this.cells.forEach((cell:PanelMesh,i:number):void=>{Diagram.show(cell,example*(ps[i]>0.001?1:0.2));this.values[i].setContent(ps[i].toFixed(2));this.values[i].set({opacity:example});});
    this.tableTitle.set({opacity:example});this.tableTitle.setContent(parity>0.5?conditioned>0.5?"P_{XY|Z=0}":"P_{XY}":conditioned>0.5?"P_{ZY|X=0}":"P_{ZY}");
    this.verdict.set({opacity:example});this.verdict.setContent(parity>0.5?conditioned>0.5?"P_{XY|Z=0}\\ne P_{X|Z=0}P_{Y|Z=0}":"P_{XY}=P_XP_Y":conditioned>0.5?"P_{ZY|X=0}=P_{Z|X=0}P_{Y|X=0}":"Z=Y\\text{ fair}:\\quad P_{ZY}\\ne P_ZP_Y");
    this.verdict.set({scale:0.9});
    this.note.set({opacity:c.p(0)});this.note.setContent(example>0.5?"Rows and columns list bit values 0 and 1; every displayed conditional table is normalized":ctx.localTime>=c.s(28)&&ctx.localTime<c.s(34)?"Sampling recipe: draw Z, then X given Z, then Y using only X":"An arrow factorizes a law; a causal interpretation needs additional assumptions");
  }

  teardown(_layers:SceneLayers):void{this.nodes.length=0;this.nodeLabels.length=0;this.arrows.length=0;this.cells.length=0;this.values.length=0;}
}

export function markovFactorizationScene():Scene{return new MarkovFactorizationScene();}
