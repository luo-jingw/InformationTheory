import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class FanoInequalityScene implements Scene {
  readonly id="c04-fano";
  private title!:FormulaHandle;
  private model!:FormulaHandle;
  private example!:FormulaHandle;
  private readonly branches:PanelMesh[]=[];
  private readonly branchLabels:FormulaHandle[]=[];
  private readonly outcomes:PanelMesh[]=[];
  private readonly outcomeLabels:FormulaHandle[]=[];
  private readonly proof:ProofLine[]=[];
  private result!:FormulaHandle;
  private observation!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);
    this.title=d.text("An error indicator separates two kinds of uncertainty",960,100,45);
    this.model=d.tex("\\Theta\\in\\{1,\\ldots,M\\},\\quad M\\ge2,\\quad\\widehat\\Theta=g(X)",960,215,39,Palette.text);
    this.example=d.text("Illustration: M = 4",400,275,30,Palette.muted);
    this.branches.push(d.rectangle(400,365,540,100,"#284333"),d.rectangle(400,625,540,100,"#60412a"));
    this.branchLabels.push(d.tex("E=0,\\quad P=1-P_e",400,365,38,Palette.green),d.tex("E=1,\\quad P=P_e",400,625,38,Palette.orange));
    for(let i=0;i<4;i++){const x=190+i*145;this.outcomes.push(d.rectangle(x,500,110,75,i===0?"#284333":"#60412a"));this.outcomeLabels.push(d.tex(i===0?"\\widehat\\theta":`\\theta_${i}`,x,500,29,i===0?Palette.green:Palette.orange));}
    const proof:ReadonlyArray<readonly[string,number]>=[
      ["H(E\\mid\\Theta,\\widehat\\Theta)=0",6],
      ["H(\\Theta\\mid\\widehat\\Theta)=H(E,\\Theta\\mid\\widehat\\Theta)",8],
      ["=H(E\\mid\\widehat\\Theta)+H(\\Theta\\mid E,\\widehat\\Theta)",10],
      ["H(E\\mid\\widehat\\Theta)\\le h_2(P_e)",11],
      ["H(\\Theta\\mid E=0,\\widehat\\Theta)=0",16],
      ["H(\\Theta\\mid E=1,\\widehat\\Theta)\\le\\log_2(M-1)",20],
    ];
    for(let i=0;i<proof.length;i++)this.proof.push({label:d.tex(proof[i][0],1315,305+i*80,i===2||i===5?32:36,i>=4?Palette.yellow:Palette.text),sentence:proof[i][1]});
    this.result=d.tex("H(\\Theta\\mid\\widehat\\Theta)\\le h_2(P_e)+P_e\\log_2(M-1)",960,810,41,Palette.yellow);
    this.observation=d.tex("\\Theta\\longrightarrow X\\longrightarrow\\widehat\\Theta",960,395,51,Palette.blue);
    this.note=d.text("",960,815,29,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),proof=1-c.p(30),observation=c.p(30);
    this.title.set({opacity:c.p(0)});this.title.setContent(observation>0.5?"An observation contains at least as much information as its estimate":"An error indicator separates two kinds of uncertainty");
    this.model.set({opacity:c.p(0)});
    this.example.set({opacity:c.p(16)*proof});this.example.setContent(ctx.localTime>=c.s(27)?"Binary boundary: M = 2":"Illustration: M = 4");
    this.branches.forEach((box:PanelMesh,i:number):void=>{Diagram.show(box,c.p(i===0?16:18)*proof);this.branchLabels[i].set({opacity:c.p(i===0?16:18)*proof});});
    this.outcomes.forEach((box:PanelMesh,i:number):void=>{Diagram.show(box,c.p(i===0?16:20)*proof*(i>=2?1-c.p(27):1));this.outcomeLabels[i].set({opacity:c.p(i===0?16:20)*proof*(i>=2?1-c.p(27):1)});});
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*proof}));
    this.result.set({opacity:c.p(25),y:observation>0.5?710:810,scale:observation>0.5?0.9:1});
    this.result.setContent(observation>0.5?"H(\\Theta\\mid X)\\le H(\\Theta\\mid\\widehat\\Theta)\\le h_2(P_e)+P_e\\log_2(M-1)":"H(\\Theta\\mid\\widehat\\Theta)\\le h_2(P_e)+P_e\\log_2(M-1)");
    this.observation.set({opacity:c.p(31)*observation});this.observation.setContent(ctx.localTime>=c.s(33)?"I(\\Theta;\\widehat\\Theta)\\le I(\\Theta;X)":"\\Theta\\longrightarrow X\\longrightarrow\\widehat\\Theta");
    this.note.set({opacity:c.p(27)*(1-c.p(30))+c.p(35)*observation,x:observation>0.5?960:400,y:observation>0.5?815:745,scale:observation>0.5?1:0.68});this.note.setContent(observation>0.5?"Processing X into an estimate cannot reduce the remaining uncertainty about Θ":"For M=2, only one alternative remains after an error, so log₂(M−1)=0");
    // The displayed count changes for the binary boundary.
    this.outcomeLabels.forEach((label:FormulaHandle,i:number):void=>label.setContent(i===0?"\\widehat\\theta":`\\theta_${i}`));
  }

  teardown(_layers:SceneLayers):void{this.branches.length=0;this.branchLabels.length=0;this.outcomes.length=0;this.outcomeLabels.length=0;this.proof.length=0;}
}

export function fanoInequalityScene():Scene{return new FanoInequalityScene();}
