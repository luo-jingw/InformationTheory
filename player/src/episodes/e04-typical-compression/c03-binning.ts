import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";
import { BinningExperiment } from "./lib/BinningExperiment";

interface ProofStep { formula: FormulaHandle; sentence: number; }

/** A viewer's green card makes the two collision events physically distinct. */
export class RandomBinningScene implements Scene {
  readonly id = "c03-binning";
  private experiment!: BinningExperiment;
  private title!: FormulaHandle;
  private cardCount!: FormulaHandle;
  private tracker!: FormulaHandle;
  private drawerCount!: FormulaHandle;
  private questionA!: FormulaHandle;
  private questionB!: FormulaHandle;
  private answerA!: FormulaHandle;
  private answerB!: FormulaHandle;
  private prediction!: FormulaHandle;
  private note!: FormulaHandle;
  private localDrawer!: PanelMesh;
  private remoteDrawer!: PanelMesh;
  private localLabel!: FormulaHandle;
  private remoteLabel!: FormulaHandle;
  private youCard!: PanelMesh;
  private youLabel!: FormulaHandle;
  private competitor!: PanelMesh;
  private competitorLabel!: FormulaHandle;
  private readonly remoteCards: PanelMesh[] = [];
  private ambiguity!: FormulaHandle;
  private readonly localProof: ProofStep[] = [];
  private readonly globalProof: ProofStep[] = [];
  private readonly limitProof: ProofStep[] = [];
  private readonly plot: Polyline[] = [];
  private readonly plotLabels: FormulaHandle[] = [];
  private payoff!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.experiment = new BinningExperiment(layers);
    this.title = d.text("100 messages. 1000 drawers. Two bets.", 960, 105, 48);
    this.tracker = d.text("YOU ↓", 1582, 430, 34, Palette.green);
    this.cardCount = d.text("100 messages", 350, 220, 30, Palette.blue);
    this.drawerCount = d.text("1000 numbered drawers", 1250, 195, 30, Palette.muted);
    this.questionA = d.text("A collision anywhere?", 480, 825, 34, Palette.orange);
    this.questionB = d.text("Is YOUR drawer unambiguous?", 1410, 825, 34, Palette.green);
    this.answerA = d.text("99.40%", 480, 750, 68, Palette.orange);
    this.answerB = d.text("90.57% yes", 1410, 750, 68, Palette.green);
    this.prediction = d.text("YOUR PREDICTION", 960, 810, 28, Palette.yellow);
    this.note = d.text("", 960, 825, 24, Palette.muted);
    this.localDrawer = d.rectangle(455, 475, 550, 270, "#172e29");
    this.remoteDrawer = d.rectangle(1390, 475, 550, 270, "#352b27");
    this.localLabel = d.text("YOUR DRAWER #512", 455, 305, 33, Palette.green);
    this.remoteLabel = d.text("A DIFFERENT DRAWER #184", 1390, 305, 33, Palette.orange);
    this.youCard = d.rectangle(370, 475, 130, 165, "#6ee2ad");
    this.youLabel = d.text("YOU", 370, 475, 35, "#10271d");
    this.competitor = d.rectangle(1660, 650, 130, 165, "#83b8ef");
    this.competitorLabel = d.text("?", 1660, 650, 44, "#152339");
    this.remoteCards.push(d.rectangle(1320, 475, 130, 165, "#f5ac61"), d.rectangle(1465, 475, 130, 165, "#f5ac61"));
    this.ambiguity = d.text("", 455, 665, 32, Palette.green);
    const local: ReadonlyArray<readonly [string, number]> = [
      ["P(\\text{one competitor avoids YOU})=1-\\frac1N", 16],
      ["P(\\text{all competitors avoid YOU})=\\left(1-\\frac1N\\right)^{M-1}", 17],
      ["P(\\text{YOUR collision})=1-\\left(1-\\frac1N\\right)^{M-1}", 18],
      ["M=100,\\ N=1000\\quad\\Rightarrow\\quad 9.43\\%", 19],
      ["P(\\text{YOUR collision})\\le\\sum_{j\\ne\\text{YOU}}\\frac1N=\\frac{M-1}{N}=9.9\\%", 21],
    ];
    local.forEach(([tex, sentence], i): void => { this.localProof.push({ formula: d.tex(tex, 1300, 245 + i * 112, i === 1 || i === 4 ? 29 : 32, i >= 2 ? Palette.green : Palette.text), sentence }); });
    const global: ReadonlyArray<readonly [string, number]> = [
      ["1,\\quad 1-\\frac1N,\\quad 1-\\frac2N,\\quad\\ldots",25],
      ["P(\\text{all distinct})=\\prod_{k=0}^{M-1}\\left(1-\\frac{k}{N}\\right),\\quad M\\le N",27],
      ["1-u\\le e^{-u}\\quad(0\\le u\\le1)",28],
      ["\\prod_k\\left(1-\\frac{k}{N}\\right)\\le\\exp\\left[-\\frac1N\\sum_{k=0}^{M-1}k\\right]",29],
      ["\\sum_{k=0}^{M-1}k=\\frac{M(M-1)}2",30],
      ["P(\\text{any collision})\\ge1-e^{-M(M-1)/(2N)}",31],
    ];
    global.forEach(([tex,sentence],i): void => { this.globalProof.push({formula:d.tex(tex,1295,225+i*99,i===1||i===3?27:31,i===5?Palette.orange:Palette.text),sentence}); });
    const limits: ReadonlyArray<readonly [string,number]> = [
      ["n\\in4\\mathbb N,\\quad M=2^{n/2},\\quad N=2^{3n/4}",35],
      ["P(\\text{YOUR collision})\\le2^{-n/4}\\longrightarrow0",36],
      ["\\frac{M(M-1)}{2N}=\\frac{2^{n/4}-2^{-n/4}}2\\longrightarrow\\infty",37],
      ["P(\\text{any collision})\\longrightarrow1",38],
    ];
    limits.forEach(([tex,sentence],i):void=>{this.limitProof.push({formula:d.tex(tex,1310,290+i*125,i===0||i===2?29:32,i===1?Palette.green:i===3?Palette.orange:Palette.text),sentence});});
    this.plot.push(d.line([[140,300],[140,690],[850,690]],Palette.axis));
    const chosen: Array<readonly [number,number]>=[],any:Array<readonly [number,number]>=[];
    for(let j=1;j<=8;j++) {const n=4*j,exponent=(2**(n/4)-2**(-n/4))/2;chosen.push([140+22*n,690-350*2**(-n/4)]);any.push([140+22*n,690-350*(1-Math.exp(-exponent))]);}
    this.plot.push(d.line(chosen,Palette.green,5),d.line(any,Palette.orange,5));
    this.plotLabels.push(d.text("0",115,690,24,Palette.muted),d.text("1",115,340,24,Palette.muted),d.text("n = 4, 8, …, 32",500,735,25,Palette.muted),d.text("YOUR collision: upper bound",490,785,26,Palette.green),d.text("Any collision: lower bound",490,250,26,Palette.orange));
    this.payoff=d.text("Protect the message actually sent.",960,770,37,Palette.green);
  }

  draw(ctx: SceneContext): void {
    const c=new Cues(ctx,ctx.localTime);
    const cabinet=(1-c.p(9)) + c.p(23)*(1-c.p(34))*.42;
    const focus=c.p(9)*(1-c.p(23));
    const proof=c.p(15),move=c.p(12,1.8)*(1-c.p(14,1.3));
    const graph=c.p(34)*(1-c.p(40));
    this.title.set({opacity:c.p(0)});
    this.tracker.set({opacity:c.p(2)*(1-c.p(9))+c.p(40)});
    this.title.setContent(ctx.localTime<c.s(9)?"100 messages. 1000 drawers. Two bets.":ctx.localTime<c.s(12)?"A collision elsewhere does not confuse YOUR drawer.":ctx.localTime<c.s(14)?"Same drawer number. Two possible messages.":ctx.localTime<c.s(15)?"A collision elsewhere does not confuse YOUR drawer.":ctx.localTime<c.s(23)?"Count YOUR competitors.":ctx.localTime<c.s(34)?"Now require EVERY message to be distinct.":ctx.localTime<c.s(40)?"One risk vanishes. The other tends to one.":"Protect the message actually sent.");
    this.experiment.draw(c.p(1,3.0),cabinet,c.p(23)*(1-c.p(40)));
    this.cardCount.set({opacity:(1-c.p(9))*c.p(0)});
    this.drawerCount.set({opacity:cabinet*c.p(1),x:1250-750*c.p(23)*(1-c.p(40))});
    this.questionA.set({opacity:c.p(3)*(1-c.p(9))});this.questionB.set({opacity:c.p(4)*(1-c.p(9))});
    this.answerA.set({opacity:c.p(6)*(1-c.p(9))});this.answerB.set({opacity:c.p(7)*(1-c.p(9))});
    this.prediction.set({opacity:c.p(5)*(1-c.p(6))});
    const thinking=Math.max(0,c.s(6)-ctx.localTime);
    this.prediction.setContent(ctx.localTime>c.e(5)?`YOUR PREDICTION  ${Math.ceil(Math.min(3.2,thinking))}`:"YOUR PREDICTION");
    this.note.set({opacity:c.p(9)});
    this.note.setContent(ctx.localTime<c.s(15)?"One possible assignment • moving a competitor changes this illustrative assignment":ctx.localTime<c.s(23)?"Preselected message • independent uniform assignments • competitors may collide elsewhere":ctx.localTime<c.s(34)?"Exact product gives 99.40% for M = 100, N = 1000":"Bounds evaluated at n divisible by four • connecting lines guide the eye");
    Diagram.show(this.localDrawer,focus+c.p(40));Diagram.show(this.remoteDrawer,focus*(1-proof));
    this.localLabel.set({opacity:focus+c.p(40)});this.remoteLabel.set({opacity:focus*(1-proof)});
    const yourX=370+proof*35;
    this.youCard.position.x=(yourX-960)/100;Diagram.show(this.youCard,focus+c.p(40));this.youLabel.set({x:yourX,opacity:focus+c.p(40)});
    this.remoteCards.forEach((card:PanelMesh):void=>Diagram.show(card,focus*(1-proof)));
    const competitorOpacity=c.p(12)*(1-proof)*focus;
    const x=1660+(545-1660)*move,y=650+(475-650)*move-Math.sin(Math.PI*move)*190;
    this.competitor.position.set((x-960)/100,(540-y)/100,.08);Diagram.show(this.competitor,competitorOpacity);this.competitorLabel.set({x,y,opacity:competitorOpacity});
    this.ambiguity.set({opacity:focus*c.p(11)*(1-proof),color:move>.5?Palette.red:Palette.green});
    this.ambiguity.setContent(move>.5?"Same number. Which message?":"One card. One answer.");
    this.localProof.forEach((step:ProofStep):void=>step.formula.set({opacity:c.p(step.sentence)*(1-c.p(23))}));
    this.globalProof.forEach((step:ProofStep):void=>step.formula.set({opacity:c.p(step.sentence)*(1-c.p(34))}));
    this.limitProof.forEach((step:ProofStep):void=>step.formula.set({opacity:c.p(step.sentence)*(1-c.p(40))}));
    this.plot.forEach((line:Polyline):void=>line.setOpacity(graph));this.plotLabels.forEach((label:FormulaHandle):void=>label.set({opacity:graph}));
    this.payoff.set({opacity:c.p(22)*(1-c.p(23))+c.p(40)});
    if(ctx.localTime>=c.s(40)) {this.experiment.draw(1,.50);this.note.setContent("Average the error of the source message • then add the non-typical event");}
  }

  teardown(_layers:SceneLayers):void {this.remoteCards.length=0;this.localProof.length=0;this.globalProof.length=0;this.limitProof.length=0;this.plot.length=0;this.plotLabels.length=0;}
}
export function randomBinningScene():Scene {return new RandomBinningScene();}
