import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine { label: FormulaHandle; sentence: number; }
interface FlowPacket {
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
  readonly source: 0 | 1;
  readonly destination: 0 | 1;
}

export class StationaryDistributionScene implements Scene {
  readonly id = "c04-stationary";
  private title!: FormulaHandle;
  private readonly proof: ProofLine[] = [];
  private readonly nodes: PanelMesh[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly links: Polyline[] = [];
  private readonly masses: PanelMesh[] = [];
  private readonly massLabels: FormulaHandle[] = [];
  private readonly axis: Polyline[] = [];
  private mixturePoint!: PanelMesh;
  private mixture!: FormulaHandle;
  private matrix!: FormulaHandle;
  private note!: FormulaHandle;
  private trialLaw!: FormulaHandle;
  private resultLaw!: FormulaHandle;
  private readonly trialBars: PanelMesh[] = [];
  private readonly resultBars: PanelMesh[] = [];
  private readonly flowStateLabels: FormulaHandle[] = [];
  private readonly packets: FlowPacket[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Stationary distributions solve flow balance", 960, 100, 47);
    this.matrix = d.tex("P=\\begin{pmatrix}1/2&1/2\\\\1/2&1/2\\end{pmatrix}", 490, 270, 51, Palette.blue);
    const proof: ReadonlyArray<readonly [string, number]> = [
      ["\\pi P=\\pi,\\quad\\pi_i\\ge0,\\quad\\sum_i\\pi_i=1", 0],
      ["\\pi=(a,1-a)\\quad\\Rightarrow\\quad\\pi P=(1/2,1/2)", 5],
      ["\\pi=(1/2,1/2)\\text{ uniquely}", 7],
      ["2\\text{ recurrent states},\\quad1\\text{ closed class}", 9],
      ["\\text{Extreme solutions count closed classes}", 10],
    ];
    for (let i = 0; i < proof.length; i++) this.proof.push({ label: d.tex(proof[i][0], 1340, 255 + i * 110, i === 1 || i === 3 ? 30 : 34, i === 2 || i === 4 ? Palette.yellow : Palette.text), sentence: proof[i][1] });
    const positions: ReadonlyArray<readonly [number, number]> = [[270, 320], [680, 280], [680, 470], [270, 640]];
    for (let i = 0; i < 4; i++) {
      this.nodes.push(d.rectangle(positions[i][0], positions[i][1], 145, 80, i === 0 ? "#3b2c2f" : i === 3 ? "#3a2f4a" : "#244132")); this.labels.push(d.tex(["T", "A_1", "A_2", "B"][i], positions[i][0], positions[i][1], 38));
      this.masses.push(d.rectangle(190 + i * 220, 755, 95, 1, i === 0 ? Palette.red : i === 3 ? Palette.purple : Palette.green)); this.massLabels.push(d.tex("", 190 + i * 220, 795, 27));
    }
    this.links.push(d.line([[355,320],[590,280],[570,269],[590,280],[575,299]],Palette.axis),d.line([[270,365],[270,590],[258,575],[270,590],[282,575]],Palette.axis),d.line([[650,330],[650,420]],Palette.green),d.line([[710,420],[710,330]],Palette.green));
    this.axis.push(d.line([[180, 200], [820, 200]], Palette.axis));
    this.mixturePoint = d.rectangle(500, 200, 18, 18, Palette.yellow);
    this.mixture = d.tex("", 490, 135, 31, Palette.yellow);
    this.note = d.text("", 960, 850, 25, Palette.muted);
    this.trialLaw=d.tex("",490,410,30,Palette.blue);
    this.resultLaw=d.tex("",490,795,29,Palette.green);
    for(let index=0;index<2;index++){
      const x=330+index*320;
      this.trialBars.push(d.rectangle(x,530,95,1,index===0?Palette.blue:Palette.orange));
      this.resultBars.push(d.rectangle(x,740,95,1,index===0?Palette.blue:Palette.orange));
      this.flowStateLabels.push(d.text(String(index),x,528,23,Palette.muted));
    }
    for(const source of [0,1] as const){
      for(const destination of [0,1] as const){
        const mesh=d.rectangle(330+source*320,575,1,18,source===0?Palette.blue:Palette.orange);
        mesh.position.z=.05;
        this.packets.push({mesh,label:d.text("",330,575,18,Palette.text),source,destination});
      }
    }
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime), classes = c.p(11), early = 1 - classes, transient = c.p(14) * (1 - c.p(21)), mixture = c.p(24);
    this.title.set({ opacity: c.p(0) }); this.title.setContent(mixture > 0.5 ? "Class weights parameterize the stationary simplex" : transient > 0.5 ? "Transient states carry no stationary probability" : classes > 0.5 ? "One extreme stationary law per closed recurrent class" : ctx.localTime < c.s(7) ? "Two recurrent states: how many stationary laws?" : "Stationary distributions solve flow balance");
    this.matrix.set({ opacity: c.p(4) * early });
    this.nodes.forEach((mesh: PanelMesh, i: number): void => { Diagram.show(mesh, classes); this.labels[i].set({ opacity: classes }); }); this.links.forEach((link: Polyline): void => link.setOpacity(classes));
    const trial = c.p(5)*early;
    const a = .85 + (.5-.85)*c.over(7);
    this.trialLaw.set({opacity:trial});
    this.trialLaw.setContent(ctx.localTime<c.s(8)?`\\mu=(${a.toFixed(2)},${(1-a).toFixed(2)})`:'\\pi=(1/2,1/2)');
    this.resultLaw.set({opacity:c.p(6)*early});
    this.resultLaw.setContent(ctx.localTime<c.s(8)?'\\mu P=(1/2,1/2)':'\\pi P=\\pi=(1/2,1/2)');
    this.trialBars.forEach((bar:PanelMesh,index:number):void=>{
      Diagram.bar(bar,330+index*320,505,100*(index===0?a:1-a),trial);
      this.flowStateLabels[index].set({opacity:trial});
    });
    this.resultBars.forEach((bar:PanelMesh,index:number):void=>Diagram.bar(bar,330+index*320,760,50,c.p(6)*early));
    this.resultLaw.set({y:805});
    this.packets.forEach((packet:FlowPacket,index:number):void=>{
      const progress=Math.max(0,(ctx.localTime-c.s(6))/4.5+index*.19)%1;
      const x=330+320*(packet.source+(packet.destination-packet.source)*progress);
      const y=575+35*index;
      const mass=(packet.source===0?a:1-a)*.5;
      packet.mesh.position.set((x-960)/100,(540-y)/100,.05);
      packet.mesh.scale.x=mass*290;
      Diagram.show(packet.mesh,c.p(6)*early);
      packet.label.set({x,y:y-20,opacity:c.p(6)*early});
      packet.label.setContent(`${packet.source} → ${packet.destination}: ${mass.toFixed(3)}`);
    });
    const lambda = 0.5 + 0.3 * c.over(40), values = [0, lambda / 2, lambda / 2, 1 - lambda];
    this.masses.forEach((bar: PanelMesh, i: number): void => { Diagram.bar(bar, 190 + i * 220, 755, 150 * values[i], mixture); this.massLabels[i].setContent(`${["T","A_1","A_2","B"][i]}:${values[i].toFixed(2)}`); this.massLabels[i].set({ opacity: mixture }); });
    this.axis.forEach((line: Polyline): void => line.setOpacity(mixture)); this.mixturePoint.position.x = (180 + 640 * lambda - 960) / 100; Diagram.show(this.mixturePoint, mixture);
    this.mixture.set({ opacity: mixture, y: 160 }); this.mixture.setContent(`\\pi=\\lambda\\pi_A+(1-\\lambda)\\pi_B,\\quad\\lambda=${lambda.toFixed(2)}`);
    this.proof.forEach((line: ProofLine, i: number): void => {
      const initial = ["\\pi P=\\pi,\\quad\\pi_i\\ge0,\\quad\\sum_i\\pi_i=1", "\\pi=(a,1-a)\\Rightarrow\\pi P=(1/2,1/2)", "\\pi=(1/2,1/2)\\text{ uniquely}", "2\\text{ recurrent states},\\quad1\\text{ closed class}", "\\text{Extreme solutions count closed classes}"];
      const exit = ["Q\\text{ transient substochastic block}", "\\exists L,\\alpha>0:\\quad\\|Q^n\\|_\\infty\\le(1-\\alpha)^{\\lfloor n/L\\rfloor}\\to0", "\\mu=\\mu Q^n\\quad\\forall n", "\\mu=0", "\\text{Example: }Q=[1/2],\\quad Q^n=[2^{-n}]"];
      const mix = ["\\pi_A=(0,1/2,1/2,0),\\quad\\pi_B=(0,0,0,1)", "\\pi=\\lambda\\pi_A+(1-\\lambda)\\pi_B,\\quad0\\le\\lambda\\le1", "\\pi P=\\lambda\\pi_AP+(1-\\lambda)\\pi_BP=\\pi", "\\text{Two closed classes}\\Rightarrow\\text{two extreme solutions}", "\\text{Unique stationarity does not imply }P^n\\text{ converges}"];
      line.label.setContent((transient > 0.5 ? exit : classes > 0.5 ? mix : initial)[i]); const cue = transient > 0.5 ? [14,16,19,20,14][i] : classes > 0.5 ? [12,24,26,27,32][i] : line.sentence;
      line.label.set({ opacity: c.p(cue), scale: transient > 0.5 && i === 1 ? 0.8 : 1 });
    });
    this.note.set({ opacity: c.p(5), y: 840 });
    this.note.setContent(classes > 0.5 ? "Example: T retains probability 1/2 and exits to either class with probability 1/4; A has fair rows; B is absorbing" : "One-step probability transport: packet widths are masses; this is not a sampled path");
  }

  teardown(_layers: SceneLayers): void { this.proof.length = 0; this.nodes.length = 0; this.labels.length = 0; this.links.length = 0; this.masses.length = 0; this.massLabels.length = 0; this.axis.length = 0; this.trialBars.length=0; this.resultBars.length=0; this.flowStateLabels.length=0; this.packets.length=0; }
}
export function stationaryDistributionScene(): Scene { return new StationaryDistributionScene(); }
