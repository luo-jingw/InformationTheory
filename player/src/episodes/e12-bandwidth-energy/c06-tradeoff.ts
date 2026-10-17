import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class CapacityTradeoffScene implements Scene {
  readonly id = "c06-tradeoff";
  private title!: FormulaHandle;
  private readonly panels: PanelMesh[] = [];
  private readonly axes: Polyline[] = [];
  private readonly curves: Polyline[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];
  private readonly operatingPoints: PanelMesh[] = [];
  private readonly operatingValues: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Power and bandwidth raise rate in different ways",960,100,42);
    this.panels.push(d.rectangle(505,470,790,390,"#131b2b"),d.rectangle(1415,470,790,390,"#131b2b"));
    this.panels.forEach((panel: PanelMesh): void => { panel.position.z = -.1; });
    const left={left:180,right:830,top:300,bottom:650};
    const lx=(u:number):number=>left.left+(left.right-left.left)*u/6;
    const ly=(v:number):number=>left.bottom-(left.bottom-left.top)*v/1.6;
    this.axes.push(d.line([[left.left,left.bottom],[left.right,left.bottom]],Palette.axis,3),d.line([[left.left,left.bottom],[left.left,left.top]],Palette.axis,3));
    const wideband:Array<readonly[number,number]>=[];
    for(let i=1;i<=120;i++){
      const u=.025+5.975*i/120;
      wideband.push([lx(u),ly(u*Math.log2(1+1/u))]);
    }
    this.curves.push(d.line(wideband,Palette.green,5),d.line([[lx(.025),ly(1/Math.LN2)],[lx(6),ly(1/Math.LN2)]],Palette.orange,2));
    const right={left:1080,right:1730,top:300,bottom:650};
    const rx=(s:number):number=>right.left+(right.right-right.left)*s/16;
    const ry=(v:number):number=>right.bottom-(right.bottom-right.top)*v/5;
    this.axes.push(d.line([[right.left,right.bottom],[right.right,right.bottom]],Palette.axis,3),d.line([[right.left,right.bottom],[right.left,right.top]],Palette.axis,3));
    const powerCurve:Array<readonly[number,number]>=[];
    for(let i=0;i<=120;i++){
      const snr=16*i/120;
      powerCurve.push([rx(snr),ry(Math.log2(1+snr))]);
    }
    this.curves.push(d.line(powerCurve,Palette.blue,5));
    this.operatingPoints.push(d.rectangle(lx(.1),ly(.1*Math.log2(11)),15,15,Palette.yellow),d.rectangle(rx(.1),ry(Math.log2(1.1)),15,15,Palette.yellow));
    this.operatingValues.push(d.tex("",505,585,23,Palette.yellow),d.tex("",1415,585,23,Palette.yellow));
    this.labels.push(
      d.text("fixed P>0, N₀>0; vary W",505,245,25,Palette.green),
      d.text("u=N₀W/P (dimensionless)",505,695,22,Palette.muted),
      d.text("C/(P/N₀) (normalized bit rate)",505,275,21,Palette.blue),
      d.text("finite wideband limit 1/ln 2",690,445,21,Palette.orange),
      d.text("fixed W>0, N₀>0; vary P",1415,245,25,Palette.blue),
      d.text("P/(N₀W) (dimensionless SNR)",1415,695,22,Palette.muted),
      d.text("C/W (bits/s/Hz)",1415,275,21,Palette.blue),
      d.text("formula-evaluated curves; not experimental data",960,205,20,Palette.muted),
    );
    this.equations.push(
      d.tex("C(W,P)=W\\log_2(1+P/(N_0W))",960,735,29,Palette.yellow),
      d.tex("P\\;\\text{fixed}: C\\to P/(N_0\\ln2),\\quad C/W\\to0",960,775,27,Palette.green),
      d.tex("W\\;\\text{fixed}: C\\text{ grows as }\\log_2(1+P/(N_0W))",960,815,25,Palette.blue),
    );
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime);
    const model=c.p(0);
    const bandwidth=c.p(4);
    const power=c.p(1);
    this.title.set({opacity:c.p(0)});
    this.title.setContent(power>0.5&&ctx.localTime<c.s(4)?"At fixed bandwidth, power increases rate logarithmically":bandwidth>0.5?"At fixed power, bandwidth increases rate toward a finite limit":"One capacity formula describes both resource paths");
    this.panels.forEach((panel:PanelMesh,i:number):void=>Diagram.show(panel,i===0?bandwidth:model));
    this.axes.forEach((line:Polyline,i:number):void=>line.setOpacity(i<2?bandwidth:model));
    this.curves.forEach((line:Polyline,i:number):void=>line.setOpacity(i<2?bandwidth:model));
    const u=.1+5.9*c.p(4,c.s(8)-c.s(4));
    const snr=.1+15.9*c.p(1,c.s(4)-c.s(1));
    const normalizedRate=u*Math.log2(1+1/u);
    const efficiency=Math.log2(1+snr);
    this.operatingPoints[0].position.set((180+650*u/6-960)/100,(540-(650-350*normalizedRate/1.6))/100,.1);
    this.operatingPoints[1].position.set((1080+650*snr/16-960)/100,(540-(650-350*efficiency/5))/100,.1);
    this.operatingPoints.forEach((point:PanelMesh,i:number):void=>Diagram.show(point,i===0?bandwidth:power));
    this.operatingValues[0].set({opacity:bandwidth});
    this.operatingValues[0].setContent(`\\begin{gathered}u=${u.toFixed(2)},\\quad C/(P/N_0)=${normalizedRate.toFixed(4)}\\\\C/W=${Math.log2(1+1/u).toFixed(4)}\\end{gathered}`);
    this.operatingValues[1].set({opacity:power});
    this.operatingValues[1].setContent(`\\begin{gathered}P/(N_0W)=${snr.toFixed(2)}\\\\C/W=${efficiency.toFixed(4)}\\end{gathered}`);
    this.labels.forEach((label:FormulaHandle,i:number):void=>{
      const shown=i<4?bandwidth:i<7?model:Math.max(bandwidth,model);
      label.set({opacity:shown});
    });
    this.equations.forEach((formula:FormulaHandle,i:number):void=>formula.set({opacity:c.p([0,5,14][i]),x:960,y:[735,775,815][i]}));
  }

  teardown(_layers:SceneLayers):void{
    this.panels.length=0;
    this.axes.length=0;
    this.curves.length=0;
    this.labels.length=0;
    this.equations.length=0;
    this.operatingPoints.length=0;
    this.operatingValues.length=0;
  }
}

export function capacityTradeoffScene():Scene{
  return new CapacityTradeoffScene();
}
