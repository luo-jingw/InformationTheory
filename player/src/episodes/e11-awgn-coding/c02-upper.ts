import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}

export class AwgnUpperBoundScene implements Scene {
  readonly id="c02-upper";
  private title!:FormulaHandle;
  private readonly powers:PanelMesh[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly totals:PanelMesh[]=[];
  private readonly totalLabels:FormulaHandle[]=[];
  private readonly proof:ProofLine[]=[];
  private example!:FormulaHandle;
  private result!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Gaussian maximum entropy and Jensen give the ceiling",960,100,45);
    const values=[0,1,2,1];for(let i=0;i<4;i++){this.powers.push(d.rectangle(220+i*175,500,105,1,Palette.blue));this.labels.push(d.tex(`\\mathbb E X_${i+1}^2=${values[i]}`,220+i*175,550,27,Palette.blue));}
    this.example=d.tex("N=1,\\quad n=4,\\quad\\frac1n\\sum_i\\mathbb EX_i^2=1",490,235,32,Palette.blue);
    this.totals.push(d.rectangle(190,660,1,48,Palette.orange),d.rectangle(190,780,1,48,Palette.green));this.totalLabels.push(d.tex("\\sum_i\\tfrac12\\log_2(1+p_i)=1.792481",490,610,29,Palette.orange),d.tex("n\\tfrac12\\log_2(1+\\overline p)=2",490,730,29,Palette.green));
    const lines:ReadonlyArray<readonly[string,number]>=[
      ["(1-P_e)\\log_2M-1\\le I(J;Y^n)\\le I(X^n;Y^n)",3],
      ["I(X^n;Y^n)=h(Y^n)-h(Z^n)\\le\\sum_i[h(Y_i)-h(Z_i)]",7],
      ["\\operatorname{Var}(Y_i)=\\operatorname{Var}(X_i)+N\\le\\mathbb EX_i^2+N",11],
      ["h(Y_i)\\le\\tfrac12\\log_2[2\\pi e(\\mathbb EX_i^2+N)]",13],
      ["I(X^n;Y^n)\\le\\tfrac12\\sum_i\\log_2(1+\\mathbb EX_i^2/N)",16],
      ["\\le\\tfrac n2\\log_2(1+P/N)\\quad[\\text{Jensen, power budget}]",20],
    ];
    for(let i=0;i<lines.length;i++)this.proof.push({label:d.tex(lines[i][0],1350,235+i*102,i<2||i>=4?27:30,i===5?Palette.yellow:Palette.text),sentence:lines[i][1]});this.result=d.tex("R_n\\le\\frac{\\frac12\\log_2(1+P/N)+1/n}{1-P_e}",1350,795,33,Palette.yellow);this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),values=[0,1,2,1];this.title.set({opacity:c.p(0)});this.powers.forEach((mesh:PanelMesh,i:number):void=>{Diagram.bar(mesh,220+i*175,500,values[i]*105,c.p(17));this.labels[i].set({opacity:c.p(17)});});this.example.set({opacity:c.p(17)});
    this.totals.forEach((mesh:PanelMesh,i:number):void=>{const width=[1.79248125036,2][i]*290;mesh.scale.x=width;mesh.position.x=(190+width/2-960)/100;Diagram.show(mesh,c.p(i===0?16:20));this.totalLabels[i].set({opacity:c.p(i===0?16:20)});});
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)}));this.result.set({opacity:c.p(23)});this.note.set({opacity:c.p(8),y:845});this.note.setContent("No input density or independence of input coordinates is assumed; Gaussian noise makes the output entropies usable");
  }

  teardown(_layers:SceneLayers):void{this.powers.length=0;this.labels.length=0;this.totals.length=0;this.totalLabels.length=0;this.proof.length=0;}
}
export function awgnUpperBoundScene():Scene{return new AwgnUpperBoundScene();}
