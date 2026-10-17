import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface CovarianceCell {
  readonly mesh: PanelMesh;
  readonly value: FormulaHandle;
}

export class ToeplitzModesScene implements Scene {
  readonly id = "c01-toeplitz";
  private title!: FormulaHandle;
  private readonly cells: CovarianceCell[] = [];
  private readonly matrixLabels: FormulaHandle[] = [];
  private readonly bars: PanelMesh[] = [];
  private readonly barValues: FormulaHandle[] = [];
  private readonly axes: Polyline[] = [];
  private readonly vectors: Polyline[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly formulas: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Stationarity makes a finite covariance matrix Toeplitz", 960, 100, 42);
    const n=5, cell=48, left=390, top=315;
    this.matrixLabels.push(d.text("Kᵢⱼ=r(i−j)",left+2*cell,235,28,Palette.blue));
    for(let i=0;i<n;i++){
      this.matrixLabels.push(d.text(`z${i+1}`,left-38,top+i*cell,18,Palette.muted));
      this.matrixLabels.push(d.text(`z${i+1}`,left+i*cell,top-32,18,Palette.muted));
      for(let j=0;j<n;j++){
        const lag=Math.abs(i-j);
        const value=lag===0?"1":lag===1?".3":"0";
        const x=left+j*cell,y=top+i*cell;
        this.cells.push({mesh:d.rectangle(x,y,43,43,lag===0?"#31435f":lag===1?"#25354d":Palette.panel),value:d.text(value,x,y,20,Palette.text)});
      }
    }
    const barLeft=1080, base=590, gap=116;
    this.axes.push(d.line([[1010,base],[1650,base]],Palette.axis,3),d.line([[1010,base],[1010,345]],Palette.axis,3));
    const eigenvalues:number[]=[];
    for(let k=1;k<=n;k++)eigenvalues.push(1+0.6*Math.cos(k*Math.PI/(n+1)));
    for(let i=0;i<n;i++){
      const h=eigenvalues[i]*105;
      this.bars.push(d.rectangle(barLeft+i*gap,base-h/2,44,h,Palette.green));
      this.barValues.push(d.text(eigenvalues[i].toFixed(2),barLeft+i*gap,base-h-22,20,Palette.text));
    }
    const sine:Array<readonly[number,number]>=[];
    for(let j=1;j<=n;j++)sine.push([690+j*45,500-110*Math.sin(j*Math.PI/(n+1))]);
    this.vectors.push(d.line(sine,Palette.orange,4));
    this.labels.push(
      d.text("finite n=5 example: diagonal 1, adjacent lag .3",960,205,23,Palette.muted),
      d.text("mode k=1: sine-shaped eigenvector",790,370,22,Palette.orange),
      d.text("finite-block covariance eigenvalues",1320,630,21,Palette.green),
      d.text("eigenvalues are exact for this tridiagonal K",1320,670,20,Palette.text),
      d.text("not individual Fourier bins at finite n",960,660,22,Palette.red),
      d.text("independent modes follow Gaussianity plus orthogonal diagonalization",960,745,21,Palette.muted),
      d.text("eigenvalue distribution approaches the PSD only under spectral regularity",960,840,20,Palette.yellow),
    );
    this.formulas.push(
      d.tex("K_{ij}=r(i-j),\\qquad K=Q\\operatorname{diag}(\\lambda_k)Q^T",960,700,27,Palette.yellow),
      d.tex("C_n=\\max_{P_k\\ge0,\\;\\sum_kP_k\\le nP}\\frac1{2n}\\sum_k\\log_2(1+P_k/\\lambda_k)",960,780,24,Palette.green),
      d.tex("\\lambda_k=1+.6\\cos\\frac{k\\pi}{n+1},\\quad v_j^{(k)}=\\sin\\frac{jk\\pi}{n+1}",960,815,23,Palette.text),
    );
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime);
    const matrix=c.p(0);
    const modes=c.p(6);
    const example=c.p(19);
    const allocations=c.p(9);
    this.title.set({opacity:c.p(0)});
    this.title.setContent(ctx.localTime>=c.s(18)&&ctx.localTime<c.s(28)?"Does a finite Toeplitz matrix have to use the DFT eigenvectors?":example>0.5?"Finite eigenvalues are exact; their frequency interpretation is asymptotic":modes>0.5?"An orthogonal eigenbasis gives independent Gaussian modes":"Lag covariance repeats along every matrix diagonal");
    this.matrixLabels.forEach((label:FormulaHandle):void=>label.set({opacity:matrix}));
    this.cells.forEach((entry:CovarianceCell):void=>{Diagram.show(entry.mesh,matrix);entry.value.set({opacity:matrix});});
    this.axes.forEach((line:Polyline):void=>line.setOpacity(example));
    this.bars.forEach((bar:PanelMesh,i:number):void=>{
      const alpha=Math.max(c.p(26+i),example*0.4);
      Diagram.show(bar,alpha);
    });
    this.barValues.forEach((label:FormulaHandle,i:number):void=>label.set({opacity:Math.max(c.p(26+i),example*0.4)}));
    this.vectors.forEach((line:Polyline):void=>line.setOpacity(c.p(28)*example));
    this.labels.forEach((label:FormulaHandle,i:number):void=>{
      const visible=i<1?c.p(19)*example:i===1?c.p(28)*example:i===2?example:i===3?0:i===4?c.p(28):modes;
      label.set({opacity:visible});
    });
    this.formulas[0].set({opacity:c.p(2)*matrix,x:960,y:700});
    this.formulas[1].set({opacity:c.p(13)*allocations,x:960,y:780});
    this.formulas[2].set({opacity:c.p(26)*example,x:960,y:815});
  }

  teardown(_layers:SceneLayers):void{
    this.cells.length=0;this.matrixLabels.length=0;this.bars.length=0;this.barValues.length=0;
    this.axes.length=0;this.vectors.length=0;this.labels.length=0;this.formulas.length=0;
  }
}

export function toeplitzModesScene():Scene{return new ToeplitzModesScene();}
