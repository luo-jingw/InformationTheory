import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface AuditLine {label:FormulaHandle;sentence:number;}

export class WaterFillingAuditScene implements Scene {
  readonly id="c05-check";
  private title!:FormulaHandle;
  private readonly floors:PanelMesh[]=[];
  private readonly optimized:PanelMesh[]=[];
  private readonly equal:PanelMesh[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly powerLabels:FormulaHandle[]=[];
  private readonly audit:AuditLine[]=[];
  private level!:Polyline;
  private example!:FormulaHandle;
  private readonly capacityBars:PanelMesh[]=[];
  private readonly capacityLabels:FormulaHandle[]=[];
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Audit the budget, active derivatives, and inactive inequality",960,100,44);
    for(let i=0;i<3;i++){const x=250+i*250;this.floors.push(d.rectangle(x,600,165,1,"#353947"));this.optimized.push(d.rectangle(x-40,600,65,1,"#2863a2"));this.equal.push(d.rectangle(x+40,600,65,1,"#705126"));this.labels.push(d.tex(`N_${i+1}=${[1,2,5][i]}`,x,650,30));this.powerLabels.push(d.tex(`p_${i+1}^*=${[3.5,2.5,0][i]}`,x-40,300,26,Palette.blue));}
    this.level=d.line([[140,397.5],[860,397.5]],Palette.yellow,3);this.example=d.tex("P=6,\\quad\\nu=4.5,\\quad p^*=(3.5,2.5,0)",500,225,30,Palette.yellow);
    const audit:ReadonlyArray<readonly[string,number]>=[
      ["\\sum_i p_i^*-P=0",10],
      ["\\partial_1F=\\partial_2F=\\lambda=\\frac1{9\\ln2}",14],
      ["\\partial_3F(0)=\\frac1{10\\ln2}<\\lambda",16],
      ["\\mu_3=\\lambda-\\partial_3F(0)=\\frac1{90\\ln2}>0",19],
      ["\\partial_iF-\\lambda+\\mu_i=0\\quad\\forall i",20],
      ["\\lambda(\\sum_i p_i^*-P)=0,\\quad\\mu_i p_i^*=0",20],
    ];
    for(let i=0;i<audit.length;i++)this.audit.push({label:d.tex(audit[i][0],1350,250+i*105,i>=3?29:34,i===3||i===4?Palette.green:Palette.text),sentence:audit[i][1]});
    this.capacityBars.push(d.rectangle(150,720,1,27,Palette.green),d.rectangle(150,800,1,27,Palette.orange));this.capacityLabels.push(d.tex("p^*:\\quad C=1.669925\\text{ bits/vector use}",500,680,31,Palette.green),d.tex("p=(2,2,2):\\quad C=1.535195\\text{ bits/vector use}",500,760,29,Palette.orange));this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),noises=[1,2,5],powers=[3.5,2.5,0],compare=c.p(24);
    this.title.set({opacity:c.p(0)});this.floors.forEach((mesh:PanelMesh,i:number):void=>{const x=250+i*250,height=noises[i]*45;Diagram.bar(mesh,x,600,height,c.p(0));Diagram.bar(this.optimized[i],x-40,600-height,powers[i]*45,c.p(5+i));Diagram.bar(this.equal[i],x+40,600-height,90,compare);this.labels[i].set({opacity:c.p(0)});this.powerLabels[i].set({opacity:c.p(i===2?8:5+i),y:600-height-powers[i]*45-30});});
    this.level.setOpacity(c.p(4));this.example.set({opacity:c.p(4)});this.example.setContent(ctx.localTime<c.s(9)?"P=6,\\quad\\nu=4.5,\\quad p_3=?":"P=6,\\quad\\nu=4.5,\\quad p^*=(3.5,2.5,0)");this.audit.forEach((line:AuditLine):void=>line.label.set({opacity:c.p(line.sentence)}));
    this.capacityBars.forEach((mesh:PanelMesh,i:number):void=>{const value=[1.6699250014423,1.5351946639457][i],width=value*330;mesh.scale.x=width;mesh.position.x=(150+width/2-960)/100;Diagram.show(mesh,c.p(i===0?22:26));this.capacityLabels[i].set({opacity:c.p(i===0?22:26)});});
    this.note.set({opacity:c.p(11),y:845});this.note.setContent("Blue power is the certified optimum; orange adds the equal-allocation comparison. All displayed values are direct calculations.");
  }

  teardown(_layers:SceneLayers):void{this.floors.length=0;this.optimized.length=0;this.equal.length=0;this.labels.length=0;this.powerLabels.length=0;this.audit.length=0;this.capacityBars.length=0;this.capacityLabels.length=0;}
}
export function waterFillingAuditScene():Scene{return new WaterFillingAuditScene();}
