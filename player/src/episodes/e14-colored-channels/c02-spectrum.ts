import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class ToeplitzSpectrumScene implements Scene {
  readonly id = "c02-spectrum";
  private title!: FormulaHandle;
  private readonly axes:Polyline[]=[];
  private spectrum!:Polyline;
  private readonly histograms:PanelMesh[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly equations:FormulaHandle[]=[];

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);
    this.title=d.text("Toeplitz eigenvalue averages converge to PSD averages",960,100,41);
    const p={left:410,right:1510,top:250,bottom:465};
    const wx=(w:number):number=>p.left+(p.right-p.left)*(w+Math.PI)/(2*Math.PI);
    const sy=(s:number):number=>p.bottom-(p.bottom-p.top)*(s-0.2)/1.6;
    this.axes.push(d.line([[p.left,p.bottom],[p.right,p.bottom]],Palette.axis,3),d.line([[p.left,p.bottom],[p.left,p.top]],Palette.axis,3));
    const psd:Array<readonly[number,number]>=[];
    for(let i=0;i<=120;i++){
      const w=-Math.PI+2*Math.PI*i/120;
      psd.push([wx(w),sy(1+0.6*Math.cos(w))]);
    }
    this.spectrum=d.line(psd,Palette.blue,5);
    const n=32,bins=12,counts:number[]=Array.from({length:bins},()=>0);
    for(let k=1;k<=n;k++){
      const lambda=1+0.6*Math.cos(k*Math.PI/(n+1));
      const idx=Math.min(bins-1,Math.floor((lambda-0.4)/1.2*bins));
      counts[idx]+=1;
    }
    const hist={left:410,right:1510,top:540,bottom:680};
    this.axes.push(d.line([[hist.left,hist.bottom],[hist.right,hist.bottom]],Palette.axis,3),d.line([[hist.left,hist.bottom],[hist.left,hist.top]],Palette.axis,3));
    for(let i=0;i<bins;i++){
      const width=(hist.right-hist.left)/bins-5;
      const height=counts[i]/n*115/.25;
      const x=hist.left+(hist.right-hist.left)*(i+0.5)/bins;
      this.histograms.push(d.rectangle(x,hist.bottom-height/2,width,height,Palette.orange));
    }
    this.labels.push(
      d.text("PSD S(ω)  (power/normalized-frequency unit)",960,220,22,Palette.blue),
      d.text("ω (radians/sample)",960,495,20,Palette.muted),
      d.text("−π",p.left,485,18,Palette.muted),d.text("0",wx(0),485,18,Palette.muted),d.text("π",p.right,485,18,Palette.muted),
      d.text("finite n=32 eigenvalue histogram; λ units match covariance",960,710,21,Palette.orange),
      d.text("not a term-by-term frequency pairing",960,735,21,Palette.red),
      d.text("absolute-summable lags; real continuous S; continuous test F",960,745,20,Palette.muted),
      d.text("water-filling additionally assumes 0<m≤S≤M<∞",960,745,20,Palette.yellow),
    );
    this.labels.push(d.text("mass/bin",300,575,19,Palette.muted),d.text("0",385,680,18,Palette.muted),d.text(".25",380,565,18,Palette.muted));
    this.equations.push(
      d.tex("S(\\omega)=\\sum_k r(k)e^{-ik\\omega}=1+.6\\cos\\omega",960,525,27,Palette.yellow),
      d.tex("\\frac1n\\sum_{k=1}^nF(\\lambda_k)\\longrightarrow\\frac1{2\\pi}\\int_{-\\pi}^{\\pi}F(S(\\omega))\\,d\\omega",960,785,24,Palette.green),
      d.tex("\\operatorname{tr}(K_n^j)/n\\to\\frac1{2\\pi}\\int S(\\omega)^j d\\omega;\\;O(1)/n\\to0",960,815,21,Palette.text),
      d.tex("S_X=(\\nu-S_Z)^+;\\quad\\nu_n\\to\\nu\\;\\text{by monotone bracketing}",960,845,22,Palette.yellow),
    );
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime);
    const psd=c.p(0);
    const distribution=c.p(3);
    const theorem=c.p(4);
    const proof=c.during(9,19);
    const water=c.p(20);
    this.title.set({opacity:c.p(0)});
    this.title.setContent(water>0.5?"Continuity and positive spectral bounds support water-filling limits":"The theorem matches empirical distributions, not individual eigenvalues");
    this.axes.forEach((line:Polyline,i:number):void=>line.setOpacity(i<2?psd:distribution));
    this.spectrum.setOpacity(psd);
    this.histograms.forEach((bar:PanelMesh,i:number):void=>Diagram.show(bar,c.p(3+Math.floor(i/3))*distribution));
    this.labels.forEach((label:FormulaHandle,i:number):void=>{
      const visible=i>=9?distribution:i<5?psd:i===5?distribution:i===6?0:i===7?theorem*(1-water):water;
      label.set({opacity:visible});
    });
    this.equations[0].set({opacity:c.p(1)*psd,x:960,y:525});
    this.equations[1].set({opacity:c.p(4)*theorem,x:960,y:785});
    this.equations[2].set({opacity:c.p(12)*proof,x:960,y:815});
    this.equations[3].setContent(ctx.localTime<c.s(29)?"S_X=(\\nu-S_Z)^+;\\quad\\text{bracket the finite water level}":"S_X=(\\nu-S_Z)^+;\\quad\\nu_n\\to\\nu\\;\\text{by monotone bracketing}");
    this.equations[3].set({opacity:c.p(22)*water,x:960,y:845});
  }

  teardown(_layers:SceneLayers):void{
    this.axes.length=0;this.histograms.length=0;this.labels.length=0;this.equations.length=0;
  }
}

export function toeplitzSpectrumScene():Scene{return new ToeplitzSpectrumScene();}
