import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}
interface WaterAllocation {level:number;powers:readonly number[];}

export class WaterFillingDerivationScene implements Scene {
  readonly id="c04-waterfill";
  private title!:FormulaHandle;
  private readonly floors:PanelMesh[]=[];
  private readonly water:PanelMesh[]=[];
  private readonly floorLabels:FormulaHandle[]=[];
  private readonly powerLabels:FormulaHandle[]=[];
  private waterLine!:Polyline;
  private levelLabel!:FormulaHandle;
  private budget!:FormulaHandle;
  private readonly proof:ProofLine[]=[];
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Equal marginal values become one common water level",960,100,46);
    for(let i=0;i<3;i++){this.floors.push(d.rectangle(260+i*250,760,170,1,"#353947"));this.water.push(d.rectangle(260+i*250,760,170,1,"#2863a2"));this.floorLabels.push(d.tex("",260+i*250,810,30,Palette.text));this.powerLabels.push(d.tex("",260+i*250,300,29,Palette.blue));}
    this.waterLine=d.line([[150,760],[870,760]],Palette.yellow,4);this.levelLabel=d.tex("",500,240,32,Palette.yellow);this.budget=d.tex("",500,290,29,Palette.green);
    const lines:ReadonlyArray<readonly[string,number]>=[
      ["u_i'(p_i)=\\frac1{2\\ln2\\,(N_i+p_i)}",1],
      ["p_i>0:\\quad u_i'(p_i)=\\lambda",5],
      ["p_i=0:\\quad u_i'(0)\\le\\lambda",7],
      ["P>0\\Rightarrow\\lambda>0,\\quad\\nu=(2\\ln2\\,\\lambda)^{-1}",10],
      ["p_i=(\\nu-N_i)^+,\\quad\\sum_i(\\nu-N_i)^+=P",16],
      ["\\nu_k=\\frac{P+\\sum_{i=1}^kN_i}{k},\\quad N_k<\\nu_k\\le N_{k+1}",23],
    ];
    for(let i=0;i<lines.length;i++)this.proof.push({label:d.tex(lines[i][0],1350,245+i*108,i>=3?28:35,i===4||i===5?Palette.yellow:Palette.text),sentence:lines[i][1]});this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),power=6+3*c.p(28),noises=[1,2,5+5*c.p(29)],allocation=this.solve(noises,power),level=allocation.level;
    this.title.set({opacity:c.p(0)});this.floors.forEach((mesh:PanelMesh,i:number):void=>{const x=260+i*250,height=noises[i]*40,waterHeight=allocation.powers[i]*40;Diagram.bar(mesh,x,760,height,c.p(0));Diagram.bar(this.water[i],x,760-height,waterHeight,c.p(14));this.floorLabels[i].setContent(`N_${i+1}=${noises[i].toFixed(4)}`);this.floorLabels[i].set({opacity:c.p(0)});this.powerLabels[i].setContent(`p_${i+1}=${allocation.powers[i].toFixed(3)}`);this.powerLabels[i].set({opacity:c.p(16),y:760-height-waterHeight-30});});
    this.waterLine.object.position.y=level*40/100;this.waterLine.setOpacity(c.p(10));this.levelLabel.set({opacity:c.p(10)});this.levelLabel.setContent(`\\nu=${level.toFixed(4)},\\quad\\lambda=${(1/(2*Math.log(2)*level)).toFixed(5)}`);this.budget.set({opacity:c.p(17)});this.budget.setContent(`\\sum_i p_i=${allocation.powers.reduce((a:number,b:number):number=>a+b,0).toFixed(4)}=P=${power.toFixed(4)}`);
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)}));this.note.set({opacity:c.p(20),y:845});this.note.setContent(ctx.localTime>=c.s(29)?"At P=9, raising floor N3 through 6 deactivates mode 3":ctx.localTime>=c.s(28)?"Floors (1,2,5): mode 3 activates strictly above P=(5-1)+(5-2)=7":"Sort the noise floors; omit the next-floor upper test when all modes are active. Equality permits zero power.");
  }

  teardown(_layers:SceneLayers):void{this.floors.length=0;this.water.length=0;this.floorLabels.length=0;this.powerLabels.length=0;this.proof.length=0;}
  private solve(noises:readonly number[],power:number):WaterAllocation{
    if(power===0)return{level:noises[0],powers:noises.map(():number=>0)};
    let sum=0;for(let k=1;k<=noises.length;k++){sum+=noises[k-1];const level=(power+sum)/k;if(level>noises[k-1]&&(k===noises.length||level<=noises[k]))return{level,powers:noises.map((n:number):number=>Math.max(0,level-n))};}
    throw new Error("No consistent water level for the sorted positive floors");
  }
}
export function waterFillingDerivationScene():Scene{return new WaterFillingDerivationScene();}
