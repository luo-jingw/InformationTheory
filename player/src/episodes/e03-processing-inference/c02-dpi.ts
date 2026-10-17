import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine { label:FormulaHandle; sentence:number; }

export class DataProcessingScene implements Scene {
  readonly id="c02-dpi";
  private title!:FormulaHandle;
  private readonly nodes:PanelMesh[]=[];
  private readonly nodeLabels:FormulaHandle[]=[];
  private readonly arrows:Polyline[]=[];
  private bypass!:Polyline;
  private readonly proof:ProofLine[]=[];
  private readonly eventBars:PanelMesh[]=[];
  private readonly eventLabels:FormulaHandle[]=[];
  private readonly eventValues:FormulaHandle[]=[];
  private readonly informationBars:PanelMesh[]=[];
  private readonly informationLabels:FormulaHandle[]=[];
  private gap!:FormulaHandle;
  private equality!:FormulaHandle;
  private result!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);
    this.title=d.text("The same joint information, expanded in two orders",960,100,47);
    for(let i=0;i<3;i++){const x=360+i*600;this.nodes.push(d.rectangle(x,245,200,90,i===1?"#284333":"#203952"));this.nodeLabels.push(d.tex(["Z","X","Y"][i],x,245,49,i===1?Palette.green:Palette.blue));}
    this.arrows.push(d.line([[485,245],[820,245],[800,230],[820,245],[800,260]],Palette.axis,4),d.line([[1085,245],[1420,245],[1400,230],[1420,245],[1400,260]],Palette.axis,4));
    this.bypass=d.line([[360,195],[360,155],[1560,155],[1560,195],[1545,175],[1560,195],[1575,175]],Palette.orange,4);
    const proof:ReadonlyArray<readonly[string,number]>=[
      ["I(Z;X,Y)=I(Z;X)+I(Z;Y\\mid X)",6],
      ["Z\\perp Y\\mid X\\quad\\Rightarrow\\quad I(Z;Y\\mid X)=0",7],
      ["I(Z;X,Y)=I(Z;X)",9],
      ["I(Z;X,Y)=I(Z;Y)+I(Z;X\\mid Y)",11],
      ["I(Z;X)-I(Z;Y)=I(Z;X\\mid Y)\\ge0",14],
    ];
    for(let i=0;i<proof.length;i++)this.proof.push({label:d.tex(proof[i][0],960,355+i*90,40,i===4?Palette.yellow:Palette.text),sentence:proof[i][1]});
    this.equality=d.tex("\\text{Equality}\\iff I(Z;X\\mid Y)=0\\iff Z\\perp X\\mid Y",960,820,34,Palette.green);
    const ps=[0.72,0.18,0.08,0.02];
    for(let i=0;i<4;i++){const x=280+i*240;this.eventBars.push(d.rectangle(x,650,130,1,i===1||i===2?Palette.orange:Palette.blue));this.eventLabels.push(d.tex(["N_1=0,N_2=0","N_1=0,N_2=1","N_1=1,N_2=0","N_1=1,N_2=1"][i],x,710,27));this.eventValues.push(d.text(ps[i].toFixed(2),x,610-ps[i]*300,35,i===1||i===2?Palette.orange:Palette.blue));}
    this.informationBars.push(d.rectangle(1310,650,130,1,Palette.green),d.rectangle(1620,650,130,1,Palette.purple));
    this.informationLabels.push(d.tex("I(Z;X)=0.531004",1310,720,29,Palette.green),d.tex("I(Z;Y)=0.173254",1620,790,29,Palette.purple));
    this.gap=d.tex("p_{\\rm eff}=0.1(0.8)+0.9(0.2)=0.26",960,380,41,Palette.orange);
    this.result=d.tex("I(Z;X)-I(Z;Y)=0.357751\\text{ bits}",960,820,38,Palette.yellow);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime);
    const proof=1-c.p(23)+c.p(41)*(1-c.p(43)),numeric=c.p(23)*(1-c.p(41)),bypass=c.p(43);
    this.title.set({opacity:c.p(0)});
    this.title.setContent(ctx.localTime>=c.s(43)?"A bypass breaks the Markov premise":ctx.localTime>=c.s(41)?"The conditional-independence premise must hold":ctx.localTime>=c.s(23)?"Two noisy steps lose information about the source":"The same joint information, expanded in two orders");
    this.nodes.forEach((node:PanelMesh,i:number):void=>{Diagram.show(node,c.p(1));this.nodeLabels[i].set({opacity:c.p(1)});});
    this.arrows.forEach((arrow:Polyline):void=>arrow.setOpacity(c.p(1)*(1-bypass)));
    this.bypass.setOpacity(bypass);
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)*proof}));
    this.equality.set({opacity:c.p(17)*proof});
    const ps=[0.72,0.18,0.08,0.02];
    this.eventBars.forEach((bar:PanelMesh,i:number):void=>{Diagram.bar(bar,280+i*240,650,ps[i]*300,c.p(27)*numeric);this.eventLabels[i].set({opacity:c.p(27)*numeric});this.eventValues[i].set({opacity:c.p(27)*numeric});});
    this.informationBars.forEach((bar:PanelMesh,i:number):void=>{const opacity=c.p(i===0?32:34)*numeric+bypass;const h=bypass>0.5?(i===0?0:1):(i===0?0.5310044064:0.1732536275);Diagram.bar(bar,i===0?1310:1620,650,300*h,opacity);this.informationLabels[i].set({opacity});this.informationLabels[i].setContent(bypass>0.5?i===0?"I(Z;X)=0":"I(Z;Y)=1":"I(Z;"+(i===0?"X)=0.531004":"Y)=0.173254"));});
    this.gap.set({opacity:c.p(29)*numeric+bypass});this.gap.setContent(bypass>0.5?"X\\perp Z,\\quad Y=Z\\quad\\Longrightarrow\\quad p(y\\mid x,z)\\ne p(y\\mid x)":"p_{\\rm eff}=0.1(0.8)+0.9(0.2)=0.26");
    this.result.set({opacity:c.p(36)*numeric+bypass});this.result.setContent(bypass>0.5?"I(Z;Y)>I(Z;X):\\quad\\text{the required conditional independence fails}":"I(Z;X)-I(Z;Y)=I(Z;X\\mid Y)=0.357751\\text{ bits}");
  }

  teardown(_layers:SceneLayers):void{this.nodes.length=0;this.nodeLabels.length=0;this.arrows.length=0;this.proof.length=0;this.eventBars.length=0;this.eventLabels.length=0;this.eventValues.length=0;this.informationBars.length=0;this.informationLabels.length=0;}
}

export function dataProcessingScene():Scene{return new DataProcessingScene();}
