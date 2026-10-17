import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine { label: FormulaHandle; sentence: number; }
interface PrefixBit {
  readonly card: PanelMesh;
  readonly label: FormulaHandle;
  readonly bit: number;
  readonly source: 0 | 1;
  readonly index: number;
}

export class ErgodicEquipartitionScene implements Scene {
  readonly id = "c06-ergodic-aep";
  private title!: FormulaHandle;
  private readonly theorem: ProofLine[] = [];
  private readonly roadmap: PanelMesh[] = [];
  private readonly roadmapLabels: FormulaHandle[] = [];
  private readonly arrows: Polyline[] = [];
  private readonly cells: PanelMesh[] = [];
  private readonly cellValues: FormulaHandle[] = [];
  private readonly contributions: PanelMesh[] = [];
  private readonly contributionLabels: FormulaHandle[] = [];
  private tableLabel!: FormulaHandle;
  private readonly markovProof: ProofLine[] = [];
  private readonly axes: Polyline[] = [];
  private readonly curves: Polyline[] = [];
  private readonly curveLabels: FormulaHandle[] = [];
  private readonly mixtureProof: ProofLine[] = [];
  private note!: FormulaHandle;
  private componentChoice!: FormulaHandle;
  private readonly prefixBits: PrefixBit[] = [];
  private readonly prefixTitles: FormulaHandle[] = [];
  private readonly choiceArrows: Polyline[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Stationary ergodic sources have a pathwise AEP", 960, 100, 46);
    const theorem: ReadonlyArray<readonly [string, number]> = [
      ["\\text{Stationary + ergodic + finite alphabet}", 3],
      ["-\\frac1n\\log_2P(X^n)\\xrightarrow{\\rm a.s.}\\bar H", 4],
      ["\\text{Invoked: Shannon–McMillan–Breiman theorem}", 13],
      ["2^{-n(\\bar H+\\epsilon)}\\le P(x^n)\\le2^{-n(\\bar H-\\epsilon)}", 16],
      ["P(A_\\epsilon^{(n)})\\to1\\quad\\Rightarrow\\quad R>\\bar H\\text{ is achievable}", 18],
    ];
    for (let i = 0; i < theorem.length; i++) this.theorem.push({ label: d.tex(theorem[i][0], 1350, 250 + i * 120, i === 2 || i === 4 ? 29 : 36, i === 1 ? Palette.yellow : Palette.text), sentence: theorem[i][1] });
    const titles = ["Conditional information increments", "Martingale convergence", "Ergodic time averages"];
    for (let i = 0; i < 3; i++) { this.roadmap.push(d.rectangle(500, 300 + i * 180, 680, 105, i === 2 ? "#244132" : "#203952")); this.roadmapLabels.push(d.text(titles[i], 500, 300 + i * 180, 32)); if (i < 2) this.arrows.push(d.line([[500,360+i*180],[500,415+i*180],[488,400+i*180],[500,415+i*180],[512,400+i*180]],Palette.axis)); }
    const values = [0.675, 0.075, 0.075, 0.175], transitions = [0.9,0.1,0.3,0.7];
    for (let i = 0; i < 4; i++) {
      const x = 370 + i % 2 * 240, y = 360 + Math.floor(i / 2) * 150;
      this.cells.push(d.rectangle(x, y, 210, 125, "#203952")); this.cellValues.push(d.text(values[i].toFixed(3), x, y, 41, Palette.blue));
      const contribution = -values[i] * Math.log2(transitions[i]);
      this.contributions.push(d.rectangle(230+i*200,730,90,1,i%2===0?Palette.green:Palette.orange)); this.contributionLabels.push(d.tex(contribution.toFixed(5),230+i*200,780,26,i%2===0?Palette.green:Palette.orange));
    }
    this.tableLabel = d.tex("N_{ij}(n)/n\\to\\pi_iP_{ij}\\quad\\text{a.s.}", 490, 235, 37, Palette.blue);
    const markov: ReadonlyArray<readonly [string, number]> = [
      ["P(x^n)=\\pi_{x_1}\\prod_{t=2}^nP_{x_{t-1},x_t}",22],
      ["-\\frac1n\\log_2P(x^n)=-\\frac{\\log_2\\pi_{x_1}}n",23],
      ["\\phantom{xxx}-\\sum_{i,j}\\frac{N_{ij}(n)}n\\log_2P_{ij}",25],
      ["\\longrightarrow-\\sum_{i,j}\\pi_iP_{ij}\\log_2P_{ij}=\\bar H",28],
      ["\\bar H=0.57206942\\text{ bits/symbol}",29],
    ];
    for(let i=0;i<markov.length;i++)this.markovProof.push({label:d.tex(markov[i][0],1350,270+i*115,i===0||i===3?31:36,i===4?Palette.yellow:Palette.text),sentence:markov[i][1]});
    this.axes.push(d.line([[170,270],[170,710],[850,710]],Palette.axis));
    const a:Array<readonly[number,number]>=[],b:Array<readonly[number,number]>=[];
    for(let n=2;n<=64;n++){const x=170+n*10;a.push([x,710-200*(1+1/n)]);b.push([x,710-200*(-Math.log2(.5+.5*2**(-n))/n)]);}
    this.curves.push(d.line(a,Palette.blue,5),d.line(b,Palette.purple,5),d.line([[170,610],[850,610]],Palette.green,3));
    this.curveLabels.push(d.tex("A:\\quad1+1/n\\to1",500,265,32,Palette.blue),d.tex("B:\\quad-\\log_2(1/2+2^{-n-1})/n\\to0",500,760,29,Palette.purple),d.tex("\\bar H_{\\rm mixture}=1/2",500,810,31,Palette.green));
    const mixture:ReadonlyArray<readonly[string,number]>=[
      ["L\\text{ fair};\\quad A=\\text{IID fair},\\quad B=\\text{all zero}",36],
      ["A\\text{ path eventually contains 1}:\\quad P(x^n)=2^{-n-1}",48],
      ["P(0^n)=1/2+2^{-n-1}",50],
      ["H(X^n\\mid L)=n/2,\\quad0\\le I(L;X^n)\\le1",52],
      ["\\frac{H(X^n)}n=\\frac12+\\frac{I(L;X^n)}n\\to\\frac12",53],
    ];
    for(let i=0;i<mixture.length;i++)this.mixtureProof.push({label:d.tex(mixture[i][0],1350,260+i*125,i===0||i===1?28:34,i===4?Palette.yellow:Palette.text),sentence:mixture[i][1]});
    this.note=d.text("",960,850,25,Palette.muted);
    this.componentChoice=d.text("Choose the source once · 1/2 each",490,220,29,Palette.yellow);
    const prefixes: ReadonlyArray<readonly number[]> = [[1,0,1,1,0,0,1,0],[0,0,0,0,0,0,0,0]];
    for(const source of [0,1] as const){
      const y=400+source*210;
      this.prefixTitles.push(d.text(source===0?"A · one possible IID fair prefix":"B · the constant-zero prefix",490,y-65,29,source===0?Palette.blue:Palette.purple));
      for(let index=0;index<8;index++){
        const bit=prefixes[source][index],x=210+index*80;
        this.prefixBits.push({card:d.rectangle(x,y,58,64,bit===0?Palette.blue:Palette.orange),label:d.text(String(bit),x,y,34,"#102237"),bit,source,index});
      }
    }
    this.choiceArrows.push(d.line([[490,245],[490,290],[478,275],[490,290],[502,275]],Palette.axis,3));
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),theorem=1-c.p(19),markov=c.p(19)*(1-c.p(35)),mixture=c.p(35);
    this.title.set({opacity:c.p(0)});this.title.setContent(mixture>.5 ? ctx.localTime < c.s(41) ? "One hidden choice for an entire infinite run" : "A stationary mixture can have different pathwise limits":markov>.5?"Transition frequencies recover the Markov entropy rate":"Stationary ergodic sources have a pathwise AEP");
    this.theorem.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*theorem}));
    this.roadmap.forEach((mesh:PanelMesh,i:number):void=>{Diagram.show(mesh,c.p(10+i)*theorem);this.roadmapLabels[i].set({opacity:c.p(10+i)*theorem});});this.arrows.forEach((line:Polyline):void=>line.setOpacity(c.p(11)*theorem));
    this.cells.forEach((mesh:PanelMesh,i:number):void=>{Diagram.show(mesh,c.p(21)*markov);this.cellValues[i].set({opacity:c.p(21)*markov});});this.tableLabel.set({opacity:c.p(21)*markov});
    const weights=[.675,.075,.075,.175],p=[.9,.1,.3,.7];
    this.contributions.forEach((mesh:PanelMesh,i:number):void=>{Diagram.bar(mesh,230+i*200,730,-weights[i]*Math.log2(p[i])*500,c.p(28)*markov);this.contributionLabels[i].set({opacity:c.p(28)*markov});});
    this.markovProof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*markov}));
    const prefix=c.p(36)*(1-c.p(48));
    this.componentChoice.set({opacity:prefix});
    this.choiceArrows.forEach((line:Polyline):void=>line.setOpacity(prefix));
    this.prefixTitles.forEach((label:FormulaHandle,index:number):void=>label.set({opacity:c.p(37+index)*(1-c.p(48))}));
    this.prefixBits.forEach((item:PrefixBit):void=>{
      const opacity=c.p(37+item.source,.7,item.index*.10)*(1-c.p(48));
      Diagram.show(item.card,opacity);item.label.set({opacity});
    });
    this.axes.forEach((line:Polyline):void=>line.setOpacity(c.p(48)));this.curves.forEach((line:Polyline):void=>line.setOpacity(c.p(48)));this.curveLabels.forEach((label:FormulaHandle,i:number):void=>{
      const prefixStage=ctx.localTime<c.s(48);
      label.set({opacity:c.p(i===2?40:41)*mixture,x:i<2&&prefixStage?1350:500,y:i===0?(prefixStage?400:265):i===1?(prefixStage?610:760):810});
      if(i===0)label.setContent(ctx.localTime>=c.s(49)?"A:\\quad1+1/n\\to1":"A:\\quad \\text{path rate}\\to1");
      if(i===1)label.setContent(ctx.localTime>=c.s(51)?"B:\\quad-\\log_2(1/2+2^{-n-1})/n\\to0":"B:\\quad \\text{path rate}\\to0");
    });
    this.mixtureProof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*mixture}));
    this.note.set({opacity:c.p(8),y:845});this.note.setContent(mixture>.5 ? ctx.localTime < c.s(43) ? "One source generates the entire run; the displayed prefixes are schematic possibilities" : "The hidden component is invariant under time shift; its probability is 1/2, so the mixture is not ergodic":markov>.5?"Left table contains limiting transition frequencies, rather than measurements from a simulated path":"The general theorem is invoked with its assumptions; the left diagram is only its proof roadmap");
  }

  teardown(_layers:SceneLayers):void{this.theorem.length=0;this.roadmap.length=0;this.roadmapLabels.length=0;this.arrows.length=0;this.cells.length=0;this.cellValues.length=0;this.contributions.length=0;this.contributionLabels.length=0;this.markovProof.length=0;this.axes.length=0;this.curves.length=0;this.curveLabels.length=0;this.mixtureProof.length=0;this.prefixBits.length=0;this.prefixTitles.length=0;this.choiceArrows.length=0;}
}
export function ergodicEquipartitionScene():Scene{return new ErgodicEquipartitionScene();}
