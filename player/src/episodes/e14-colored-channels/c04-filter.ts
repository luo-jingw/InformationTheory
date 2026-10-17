import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class FilteredChannelScene implements Scene {
  readonly id="c04-filter";
  private title!:FormulaHandle;
  private readonly panels:PanelMesh[]=[];
  private readonly axes:Polyline[]=[];
  private readonly curves:Polyline[]=[];
  private readonly markers:Polyline[]=[];
  private readonly labels:FormulaHandle[]=[];
  private readonly equations:FormulaHandle[]=[];

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);
    this.title=d.text("A channel zero removes a signal mode; a receive filter cannot create SNR",960,100,39);
    const background=d.rectangle(960,380,1510,300,"#131b2b");
    background.position.z=-.1;
    this.panels.push(background);
    const xs=[450,600,750,900,1050,1200,1350,1500];
    const h2=[1,.8,.4,0,.4,.8,1,.85];
    const sx=.8,sn=.2;
    const gain=xs.map((x:number,i:number):readonly[number,number]=>[x,380-110*h2[i]]);
    const outSignal=xs.map((x:number,i:number):readonly[number,number]=>[x,510-105*h2[i]*sx]);
    const noise=xs.map((x:number):readonly[number,number]=>[x,510-105*sn]);
    const snr=xs.map((x:number,i:number):readonly[number,number]=>[x,640-22.5*(h2[i]*sx/sn)]);
    this.axes.push(
      d.line([[390,380],[1580,380]],Palette.axis,2),d.line([[390,265],[390,380]],Palette.axis,2),
      d.line([[390,510],[1580,510]],Palette.axis,2),d.line([[390,405],[390,510]],Palette.axis,2),
      d.line([[390,640],[1580,640]],Palette.axis,2),d.line([[390,550],[390,640]],Palette.axis,2),
    );
    this.curves.push(d.line(gain,Palette.orange,4),d.line(outSignal,Palette.blue,4),d.line(noise,Palette.purple,3),d.line(snr,Palette.green,4));
    this.markers.push(
      d.line([[900,255],[900,385]],Palette.red,2),
      d.line([[900,415],[900,520]],Palette.red,2),
      d.line([[900,550],[900,650]],Palette.red,2),
    );
    this.labels.push(
      d.text("|H(f)|² gain (dimensionless)",960,235,21,Palette.orange),
      d.text("output signal and noise PSD (W/Hz)",960,400,21,Palette.blue),
      d.text("SNR (dimensionless)",960,535,21,Palette.green),
      d.text("H(f₀)=0: signal mode vanishes; S_N(f₀)>0",960,170,21,Palette.red),
      d.text("schematic sample: S_X=.8, S_N=.2; ratio at f₀ is zero",960,195,19,Palette.muted),
      d.text("receiver filter G acts after both signal and noise",960,660,21,Palette.yellow),
      d.text("ordered schematic samples (not a measured frequency response)",960,685,18,Palette.muted),
    );
    this.equations.push(
      d.tex("Y(f)=H(f)X(f)+N(f),\\qquad\\int_{\\mathbb R}S_X(f)df\\le P",960,710,25,Palette.yellow),
      d.tex("S_{sig,out}=|H|^2S_X;\\quad\\mathrm{SNR}=|H|^2S_X/S_N=S_X/(S_N/|H|^2)\\;(H\\ne0)",960,745,21,Palette.text),
      d.tex("H=0,\\;S_N>0\\Rightarrow\\mathrm{SNR}=0;\\quad S_N/|H|^2\\text{ is undefined}",960,780,21,Palette.red),
      d.tex("|G|^2S_{sig}/|G|^2S_N=S_{sig}/S_N\\;(G\\ne0);\\quad G=0\\text{ erases mode}",960,815,20,Palette.green),
      d.tex("C=\\frac12\\int_{\\mathbb R}\\log_2(1+|H|^2S_X/S_N)df\\quad\\text{bits/s}",960,845,21,Palette.yellow),
    );
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime);
    const response=c.p(0);
    const notch=c.p(8);
    const receive=c.p(17);
    this.title.set({opacity:c.p(0)});
    this.title.setContent(receive>0.5&&ctx.localTime<c.s(20)?"Can receiver amplification alone improve the signal-to-noise ratio?":receive>0.5?"A nonzero receive weighting cancels; a zero weighting erases":"The transmitter spends power before the channel response");
    this.panels.forEach((panel:PanelMesh):void=>Diagram.show(panel,response));
    this.axes.forEach((line:Polyline):void=>line.setOpacity(response));
    this.curves.forEach((line:Polyline,i:number):void=>line.setOpacity(i===3?notch:response));
    this.markers.forEach((line:Polyline):void=>line.setOpacity(c.p(8)*notch));
    this.labels.forEach((label:FormulaHandle,i:number):void=>{
      const visible=i<3?response:i<5?notch:i<7?receive:response;
      label.set({opacity:visible});
    });
    this.equations[0].set({opacity:c.p(2)*response,x:960,y:710});
    this.equations[1].set({opacity:c.p(6)*response,x:960,y:745});
    this.equations[2].set({opacity:c.p(9)*notch,x:960,y:780});
    this.equations[3].set({opacity:c.p(20)*receive,x:960,y:815});
    this.equations[4].set({opacity:c.p(30)*response,x:960,y:845});
  }

  teardown(_layers:SceneLayers):void{
    this.panels.length=0;this.axes.length=0;this.curves.length=0;this.markers.length=0;
    this.labels.length=0;this.equations.length=0;
  }
}

export function filteredChannelScene():Scene{return new FilteredChannelScene();}
