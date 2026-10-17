import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class ConcavePowerKktScene implements Scene {
  readonly id="c02-kkt";
  private title!:FormulaHandle;
  private readonly axes:Polyline[]=[];
  private readonly contours:Polyline[]=[];
  private feasible!:Polyline;
  private optimum!:PanelMesh;
  private interior!:PanelMesh;
  private optimumLabel!:FormulaHandle;
  private slater!:FormulaHandle;
  private objective!:FormulaHandle;
  private readonly proof:ProofLine[]=[];
  private example!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("KKT distinguishes the total budget from nonnegative boundaries",960,100,43);
    this.axes.push(d.line([[170,240],[170,740],[840,740]],Palette.axis));this.feasible=d.line([[170,740],[770,740],[170,290],[170,740]],Palette.green,4);
    for(const utility of [.5,1,1.4,1.669925001442]){
      const points:Array<readonly[number,number]>=[];for(let j=0;j<=240;j++){const p1=j/40,p2=2*(2**(2*utility)/(1+p1)-1);if(p2>=0&&p2<=6)points.push([170+p1*100,740-p2*75]);}
      if(points.length>1)this.contours.push(d.line(points,Palette.blue,3));
    }
    this.optimum=d.rectangle(520,552.5,20,20,Palette.yellow);this.interior=d.rectangle(320,627.5,17,17,Palette.orange);this.optimumLabel=d.tex("p^*=(3.5,2.5)",550,495,30,Palette.yellow);this.slater=d.tex("(1.5,1.5):\\quad p_i>0,\\ \\sum p_i<6",490,800,28,Palette.orange);this.objective=d.tex("F=\\tfrac12\\log_2(1+p_1)+\\tfrac12\\log_2(1+p_2/2)",500,220,27,Palette.blue);
    const lines:ReadonlyArray<readonly[string,number]>=[
      ["\\mathcal L=F-\\lambda(\\sum_ip_i-P)+\\sum_i\\mu_ip_i",9],
      ["\\partial_iF-\\lambda+\\mu_i=0",10],
      ["p_i\\ge0,\\ \\sum_ip_i\\le P;\\quad\\lambda,\\mu_i\\ge0",11],
      ["\\lambda(\\sum_ip_i-P)=0,\\quad\\mu_ip_i=0",13],
      ["p_i>0\\Rightarrow\\partial_iF=\\lambda",20],
      ["p_i=0\\Rightarrow\\partial_iF\\le\\lambda",21],
    ];
    for(let i=0;i<lines.length;i++)this.proof.push({label:d.tex(lines[i][0],1350,245+i*105,i===0||i===2||i===3?29:35,i>=4?Palette.yellow:Palette.text),sentence:lines[i][1]});this.example=d.tex("",1350,815,31,Palette.green);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),zero=c.p(33)*(1-c.p(35)),single=c.p(35);
    this.title.set({opacity:c.p(0)});this.axes.forEach((line:Polyline):void=>line.setOpacity(c.p(0)));this.feasible.setOpacity(c.p(2)*(1-zero));this.contours.forEach((line:Polyline):void=>line.setOpacity(c.p(0)*(1-zero)));
    this.optimum.position.set(((zero>.5?170:520)-960)/100,(540-(zero>.5?740:552.5))/100,.1);Diagram.show(this.optimum,c.p(20));this.optimumLabel.set({opacity:c.p(20)*(1-zero)*(1-single)});Diagram.show(this.interior,c.p(30)*(1-zero)*(1-single));this.slater.set({opacity:c.p(30)*(1-zero)*(1-single)});this.objective.set({opacity:c.p(0)});
    const suff=["F(q)\\le F(p^*)+\\nabla F(p^*)\\cdot(q-p^*)","\\nabla F(p^*)=\\lambda\\mathbf1-\\mu","\\lambda(\\sum_iq_i-\\sum_ip_i^*)\\le0","-\\sum_i\\mu_i(q_i-p_i^*)=-\\sum_i\\mu_iq_i\\le0","F(q)\\le F(p^*)\\quad\\text{for every feasible }q","\\text{Concavity makes KKT sufficient}"];
    const early=["\\mathcal L=F-\\lambda(\\sum_ip_i-P)+\\sum_i\\mu_ip_i","\\partial_iF-\\lambda+\\mu_i=0","p_i\\ge0,\\ \\sum_ip_i\\le P;\\quad\\lambda,\\mu_i\\ge0","\\lambda(\\sum_ip_i-P)=0,\\quad\\mu_ip_i=0","p_i>0\\Rightarrow\\partial_iF=\\lambda","p_i=0\\Rightarrow\\partial_iF\\le\\lambda"];
    this.proof.forEach((line:ProofLine,i:number):void=>{line.label.setContent(ctx.localTime>=c.s(25)?suff[i]:early[i]);line.label.set({opacity:c.p(ctx.localTime>=c.s(25)?[25,26,27,28,29,29][i]:line.sentence)*(1-zero)*(1-single)});});
    this.example.set({opacity:c.p(30)});this.example.setContent(single>.5?"F(p)=\\ln(1+p):\\quad p^*=P,\\ \\lambda=1/(1+P)>0,\\ \\mu=0":zero>.5?"P=0:\\quad p^*=0\\text{ directly; no Slater claim}":"P>0:\\quad p_i=P/(2d)\\text{ is strictly feasible}");
    this.note.set({opacity:c.p(2),y:845});this.note.setContent(zero>.5?"At zero budget the feasible set collapses to the origin; solve this boundary directly.":single>.5?"Left: the two-variable budget-6 example. Right: a separate one-variable KKT calculation.":"Left: a concave two-variable example, budget 6. Feasibility, signs and complementary products are separate conditions.");
  }

  teardown(_layers:SceneLayers):void{this.axes.length=0;this.contours.length=0;this.proof.length=0;}
}
export function concavePowerKktScene():Scene{return new ConcavePowerKktScene();}
