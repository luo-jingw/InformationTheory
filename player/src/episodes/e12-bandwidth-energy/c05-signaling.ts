import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface SignalingMark {
  readonly line: Polyline;
  readonly sentence: number;
}

export class SignalingFamiliesScene implements Scene {
  readonly id = "c05-signaling";
  private title!: FormulaHandle;
  private readonly panels: PanelMesh[] = [];
  private readonly marks: SignalingMark[] = [];
  private readonly axes: Polyline[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Modulation comparisons depend on waveform and detector assumptions", 960, 100, 40);
    const centers: ReadonlyArray<readonly [number, number]> = [[470,355],[960,355],[1450,355],[710,635],[1210,635]];
    for (const [x,y] of centers) this.panels.push(d.rectangle(x,y,420,220,"#151e30"));
    this.panels.forEach((panel: PanelMesh): void => { panel.position.z = -.1; });
    this.axes.push(
      d.line([[335,355],[605,355]],Palette.axis,1), d.line([[470,250],[470,460]],Palette.axis,1),
      d.line([[825,355],[1095,355]],Palette.axis,1), d.line([[960,250],[960,460]],Palette.axis,1),
      d.line([[1315,355],[1585,355]],Palette.axis,1), d.line([[1450,250],[1450,460]],Palette.axis,1),
      d.line([[575,635],[845,635]],Palette.axis,1), d.line([[710,530],[710,740]],Palette.axis,1),
      d.line([[1075,635],[1345,635]],Palette.axis,1), d.line([[1210,530],[1210,740]],Palette.axis,1),
    );
    this.addQamPoints(d, 470, 355, 16, 4);
    this.addLinePoints(d, 960, 355, 8, Palette.orange);
    this.addRingPoints(d, 1450, 355, 8, Palette.purple);
    this.addRingPoints(d, 710, 635, 4, Palette.teal, 14);
    const phaseArc: Array<readonly [number, number]> = [];
    for (let i = 0; i <= 24; i++) {
      const angle = Math.PI * i / 48;
      phaseArc.push([710 + 50 * Math.cos(angle), 635 - 50 * Math.sin(angle)]);
    }
    this.marks.push({line:d.line(phaseArc,Palette.yellow,3),sentence:14});
    for (let k = 0; k < 8; k++) {
      const wave: Array<readonly [number, number]> = [];
      for (let j = 0; j <= 96; j++) {
        const t = j / 96;
        wave.push([1060 + 300 * t, 555 + 23 * k - 7 * (k === 0 ? 1 : Math.SQRT2 * Math.cos(k * Math.PI * t))]);
      }
      this.marks.push({line:d.line(wave,Palette.green,2),sentence:17});
    }
    this.labels.push(
      d.text("QAM: 16 / 64 points",470,485,24,Palette.blue),
      d.text("PAM (SSB): 4 / 8 amplitudes",960,485,23,Palette.orange),
      d.text("PSK: 4 / 8 / 16 phases",1450,485,23,Palette.purple),
      d.text("DPSK: 2 / 4 / 8 phase changes",710,765,22,Palette.teal),
      d.text("orthogonal: M=8 / 16 / 32 / 64; coherent",1210,765,21,Palette.green),
      d.text("sketches: Δphase and orthogonal cosine modes on [0,1]; no error-rate data",960,845,19,Palette.yellow),
      d.text("source target: P_M=10⁻⁵",960,820,21,Palette.text),
      d.text("families require a bandwidth and detector convention",960,225,17,Palette.muted),
    );
    this.equations.push(
      d.tex("C_{Shannon}=W\\log_2(1+P/(N_0W))",960,190,30,Palette.yellow),
      d.text("reference frontier is exact; practical family curves are not reconstructed",960,225,22,Palette.green),
      d.text("need occupied bandwidth • symbol rate • code rate • detector assumptions",960,790,20,Palette.orange),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx,ctx.localTime);
    const families = c.p(0);
    const source = c.p(2);
    const caution = c.p(25);
    this.title.set({opacity:c.p(0)});
    this.title.setContent(ctx.localTime>=c.s(24)&&ctx.localTime<c.s(25)?"Can this plot determine universal numerical performance curves?":caution>0.5?"The lecture plot supports qualitative comparison, not universal curves":"Signal families use different dimensions and modulation rules");
    this.equations[0].set({opacity:c.p(0),x:960,y:190});
    this.equations[1].set({opacity:c.p(27),x:960,y:225});
    this.equations[2].set({opacity:c.p(29),x:960,y:795});
    this.panels.forEach((panel:PanelMesh,i:number):void=>Diagram.show(panel,c.p([4,8,11,14,17][i])*families));
    this.axes.forEach((line:Polyline,i:number):void=>line.setOpacity(c.p([4,8,11,14,17][Math.floor(i/2)])*families));
    this.marks.forEach((mark:SignalingMark):void=>mark.line.setOpacity(c.p(mark.sentence)*families));
    this.labels.forEach((label:FormulaHandle,i:number):void=>{
      const visible=i<5?c.p([4,8,11,14,17][i])*families:i===5?caution:i===6?source:0;
      label.set({opacity:visible});
    });
  }

  teardown(_layers:SceneLayers):void{
    this.panels.length=0;
    this.marks.length=0;
    this.axes.length=0;
    this.labels.length=0;
    this.equations.length=0;
  }

  private addQamPoints(d:Diagram,cx:number,cy:number,count:number,sentence:number):void{
    const n=Math.sqrt(count);
    for(let row=0;row<n;row++)for(let col=0;col<n;col++){
      const x=cx+(col-(n-1)/2)*42;
      const y=cy+(row-(n-1)/2)*42;
      this.marks.push({line:d.line([[x-2,y],[x+2,y]],Palette.blue,5),sentence},{line:d.line([[x,y-2],[x,y+2]],Palette.blue,5),sentence});
    }
  }

  private addLinePoints(d:Diagram,cx:number,cy:number,count:number,color:string,sentence:number=8):void{
    for(let i=0;i<count;i++){
      const x=count===1?cx:cx-92+i*184/(count-1);
      this.marks.push({line:d.line([[x-7,cy],[x+7,cy]],color,5),sentence},{line:d.line([[x,cy-7],[x,cy+7]],color,5),sentence});
    }
  }

  private addRingPoints(d:Diagram,cx:number,cy:number,count:number,color:string,sentence:number=11):void{
    for(let i=0;i<count;i++){
      const angle=2*Math.PI*i/count;
      const x=cx+76*Math.cos(angle);
      const y=cy+76*Math.sin(angle);
      this.marks.push({line:d.line([[x-7,y],[x+7,y]],color,5),sentence},{line:d.line([[x,y-7],[x,y+7]],color,5),sentence});
    }
  }
}

export function signalingFamiliesScene():Scene{
  return new SignalingFamiliesScene();
}
