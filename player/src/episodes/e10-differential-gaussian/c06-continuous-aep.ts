import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface SupportVolumeBar {readonly mesh:PanelMesh;readonly index:FormulaHandle;readonly value:FormulaHandle;readonly volume:number;readonly y:number;}

export class ContinuousAepScene implements Scene {
  readonly id = "c06-continuous-aep";
  private title!: FormulaHandle;
  private supportAxis!:Polyline;
  private supportHeading!:FormulaHandle;
  private readonly supportAxisLabels:FormulaHandle[]=[];
  private readonly supportBars:SupportVolumeBar[]=[];
  private readonly supportFacts:FormulaHandle[]=[];
  private readonly axes: Polyline[] = [];
  private readonly curves: Polyline[] = [];
  private readonly panels: PanelMesh[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("The continuous AEP turns typical density into coordinate volume", 960, 100, 41);
    this.supportHeading=d.text("Exact support volumes for IID Uniform[0,1/4] blocks",960,220,29,Palette.yellow);
    this.supportAxis=d.line([[350,285],[950,285]],Palette.axis,3);
    this.supportAxisLabels.push(d.text("0",350,260,21,Palette.muted),d.text("1 coordinate-volume unit",950,260,21,Palette.muted));
    for(let n=1;n<=4;n++){
      const volume=4**(-n),y=335+(n-1)*75;
      this.supportBars.push({mesh:d.rectangle(350,y,1,30,Palette.green),index:d.text(`n=${n}`,270,y,26,Palette.blue),value:d.text(String(volume),990,y,24,Palette.green),volume,y});
    }
    this.supportFacts.push(d.tex("h(X)=\\log_2(1/4)=-2",1400,335,31,Palette.yellow),d.tex("\\operatorname{Vol}([0,1/4]^n)=4^{-n}\\to0",1400,440,29,Palette.green),d.tex("P(X^n\\in[0,1/4]^n)=1",1400,545,30,Palette.blue));
    const plot = { left: 340, right: 970, top: 295, bottom: 550 };
    const xAt = (i: number): number => plot.left + (plot.right - plot.left) * i / 40;
    const yAt = (v: number): number => plot.bottom - (plot.bottom - plot.top) * (v + 1) / 4;
    this.axes.push(
      d.line([[plot.left, plot.bottom], [plot.right, plot.bottom]], Palette.axis, 3),
      d.line([[plot.left, plot.bottom], [plot.left, plot.top]], Palette.axis, 3),
      d.line([[plot.left, yAt(0.5)], [plot.right, yAt(0.5)]], Palette.muted, 1),
      d.line([[plot.left, yAt(-0.5)], [plot.right, yAt(-0.5)]], Palette.muted, 1),
    );
    const illustrative: Array<readonly [number, number]> = [];
    for (let i = 0; i <= 40; i++) {
      const n = i;
      const value = 2.8 * Math.exp(-.15 * n) + 0.12 * Math.sin(.7 * n) * Math.exp(-.1 * n);
      illustrative.push([xAt(i), yAt(value)]);
    }
    this.curves.push(d.line(illustrative, Palette.green, 4));
    this.panels.push(d.rectangle(1350, 425, 570, 270, "#172338"));
    for (let i = 0; i < 6; i++) {
      this.panels.push(d.rectangle(1195 + i * 62, 425, 58, 210, i % 2 === 0 ? "#25354d" : "#1d2a3d"));
    }
    this.labels.push(
      d.text("block length n", 650, 590, 23, Palette.muted),
      d.text("−(1/n) log₂ f(Xⁿ)  (bits/sample)", 345, 250, 22, Palette.blue),
      d.text("h(X)+ε", 300, yAt(0.5), 20, Palette.orange),
      d.text("h(X)", 300, yAt(0), 21, Palette.yellow),
      d.text("h(X)−ε", 300, yAt(-0.5), 20, Palette.orange),
      d.text("illustrative convergence path, not measured data", 650, 625, 19, Palette.muted),
      d.text("typical set Aₙ", 1350, 270, 28, Palette.green),
      d.text("density height ≈ 2⁻ⁿʰ", 1350, 590, 23, Palette.blue),
      d.text("mass ≥ 1−δ", 1350, 660, 24, Palette.yellow),
    );
    this.equations.push(
      d.tex("f_{X^n}(x^n)=\\prod_{i=1}^n f(x_i)", 960, 660, 30, Palette.yellow),
      d.tex("-\\frac1n\\log_2 f_{X^n}(X^n)\\xrightarrow{a.s.}h(X)", 960, 710, 29, Palette.green),
      d.tex("2^{-n(h+\\epsilon)}\\le f_{X^n}(x^n)\\le2^{-n(h-\\epsilon)}", 960, 760, 27, Palette.text),
      d.tex("(1-\\delta)2^{n(h-\\epsilon)}\\le\\operatorname{Vol}(A_n)\\le2^{n(h+\\epsilon)}", 960, 810, 26, Palette.yellow),
      d.text("IID; h finite; E|log₂ f(X)| finite; volume uses these coordinate units", 960, 838, 21, Palette.muted),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const law = c.during(0, 12);
    const aep = c.p(8);
    const volume = c.p(13);
    const caveat = c.p(32);
    const exact=c.p(28);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime>=c.s(28)?"Probability one can occupy shrinking coordinate volume":ctx.localTime>=c.s(27)?"Can probability stay one while coordinate volume vanishes?":volume > 0.5 ? "Typical mass divided by typical density gives volume" : aep > 0.5 ? "The strong law makes block surprisal per sample approach h" : "The continuous AEP turns typical density into coordinate volume");
    this.axes.forEach((line: Polyline): void => line.setOpacity(c.p(0)*(1-exact)));
    this.curves.forEach((line: Polyline): void => line.setOpacity(c.p(8)*(1-exact)));
    this.panels.forEach((panel: PanelMesh, i: number): void => Diagram.show(panel,(i===0?volume:c.p(14)*volume)*(1-exact)));
    this.labels.forEach((label: FormulaHandle, i: number): void => {
      const visible = i < 6 ? c.p(0) : volume;
      label.set({ opacity:visible*(1-exact) });
    });
    this.supportHeading.set({opacity:exact});this.supportAxis.setOpacity(exact);this.supportAxisLabels.forEach((label:FormulaHandle):void=>label.set({opacity:exact}));
    this.supportBars.forEach((bar:SupportVolumeBar):void=>{const width=600*bar.volume;bar.mesh.scale.x=width;bar.mesh.position.set((350+width/2-960)/100,(540-bar.y)/100,0);Diagram.show(bar.mesh,exact);bar.index.set({opacity:exact});bar.value.set({opacity:exact});});
    this.supportFacts.forEach((label:FormulaHandle):void=>label.set({opacity:exact}));
    this.equations[0].set({ opacity: c.p(4) * law, x: 960, y: 660 });
    this.equations[1].set({ opacity: c.p(8) * aep, x: 960, y: 710 });
    this.equations[2].set({ opacity: c.p(10) * aep, x: 960, y: 760 });
    this.equations[3].set({ opacity: c.p(17) * volume, x: 960, y: 810 });
    this.equations[4].set({ opacity: c.p(32) * caveat, x: 960, y: 838 });
    this.labels[5].setContent(ctx.localTime >= c.s(28)
      ? "Negative h permits shrinking typical volume in these units"
      : "illustrative convergence path, not measured data");
  }

  teardown(_layers: SceneLayers): void {
    this.supportBars.length=0;this.supportFacts.length=0;this.supportAxisLabels.length=0;
    this.axes.length = 0;
    this.curves.length = 0;
    this.panels.length = 0;
    this.labels.length = 0;
    this.equations.length = 0;
  }
}

export function continuousAepScene(): Scene {
  return new ContinuousAepScene();
}
