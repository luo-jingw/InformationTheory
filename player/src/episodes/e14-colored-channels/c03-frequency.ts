import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

export class FrequencyWaterfillScene implements Scene {
  readonly id="c03-frequency";
  private title!:FormulaHandle;
  private readonly axes:Polyline[]=[];
  private readonly noise:Polyline[]=[];
  private waterline!:Polyline;
  private readonly allocation:PanelMesh[]=[];
  private readonly whiteBars:PanelMesh[]=[];
  private whiteNoise!:Polyline;
  private readonly labels:FormulaHandle[]=[];
  private readonly equations:FormulaHandle[]=[];

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);
    this.title=d.text("Spectral water-filling turns parallel modes into a frequency integral",960,100,40);
    const x0=390,x1=1530,top=255,split=420,bottom=535;
    const xAt=(f:number):number=>x0+(x1-x0)*(f+1)/2;
    const yNoise=(s:number):number=>split-(split-top)*s/2.1;
    this.axes.push(
      d.line([[x0,split],[x1,split]],Palette.axis,3),d.line([[x0,top],[x0,split]],Palette.axis,2),
      d.line([[x0,bottom],[x1,bottom]],Palette.axis,3),d.line([[x0,split],[x0,bottom]],Palette.axis,2),
    );
    const levels=[1.8,1.0,.5,.5,.5,.5,1.0,1.8];
    const powers=levels.map((s:number):number=>Math.max(1.4-s,0));
    const noisePoints:Array<readonly[number,number]>=[];
    for(let i=0;i<levels.length;i++){
      const a=-1+2*i/levels.length,b=-1+2*(i+1)/levels.length;
      noisePoints.push([xAt(a),yNoise(levels[i])],[xAt(b),yNoise(levels[i])]);
      if(i<levels.length-1)noisePoints.push([xAt(b),yNoise(levels[i+1])]);
      const cx=xAt((a+b)/2),h=powers[i];
      if(h>0)this.allocation.push(d.rectangle(cx,bottom-(bottom-split)*h/(2*1.1), (x1-x0)/levels.length-5, (bottom-split)*h/1.1,"#315641"));
      const whiteHeight=(bottom-split)*.65/1.1;
      this.whiteBars.push(d.rectangle(cx,bottom-whiteHeight/2,(x1-x0)/levels.length-5,whiteHeight,"#315641"));
    }
    this.noise.push(d.line(noisePoints,Palette.purple,5));
    this.waterline=d.line([[x0,yNoise(1.4)],[x1,yNoise(1.4)]],Palette.yellow,3);
    this.whiteNoise=d.line([[x0,yNoise(.7)],[x1,yNoise(.7)]],Palette.purple,5);
    this.labels.push(
      d.text("two-sided colored-noise PSD S_Z(f)  (W/Hz)",960,225,22,Palette.purple),
      d.text("water level ν=1.4 W/Hz",1490,190,21,Palette.yellow),
      d.text("allocated input PSD S_X(f)  (W/Hz)",960,405,21,Palette.green),
      d.text("−π",x0,555,18,Palette.muted),d.text("0",960,555,18,Palette.muted),d.text("+π",x1,555,18,Palette.muted),
      d.text("ω (radians/sample)",1450,585,20,Palette.muted),
      d.text("−W",x0,555,18,Palette.muted),d.text("0",960,555,18,Palette.muted),d.text("+W",x1,555,18,Palette.muted),
      d.text("frequency f (Hz)",1450,585,20,Palette.muted),
      d.text("illustrative piecewise PSD; area under S_X is total power P",960,590,20,Palette.text),
      d.text("white-noise check: S_Z=N₀/2=.7; input S_X=P/(2W)=.65 W/Hz",960,610,21,Palette.purple),
      d.text("two-sided real spectrum: units integrate to watts and bits/second",960,845,19,Palette.muted),
    );
    this.equations.push(
      d.tex("S_X(f)=(\\nu-S_Z(f))^+",960,185,25,Palette.yellow),
      d.tex("P_{DT}=\\frac1{2\\pi}\\int_{-\\pi}^{\\pi}S_X(\\omega)d\\omega",960,625,25,Palette.blue),
      d.tex("C_{DT}=\\frac1{4\\pi}\\int_{-\\pi}^{\\pi}\\log_2(1+S_X/S_Z)d\\omega\\quad\\text{bits/real use}",960,670,23,Palette.blue),
      d.tex("P_{CT}=\\int_{\\mathbb R}S_X(f)df,\\qquad C_{CT}=\\frac12\\int_{\\mathbb R}\\log_2(1+S_X/S_Z)df\\;\\text{bits/s}",960,715,22,Palette.green),
      d.tex("F_s=2W,\\quad S_D(\\omega)=F_sS_C(f),\\quad f=F_s\\omega/(2\\pi)",960,760,24,Palette.text),
      d.tex("\\frac{S_X}{S_Z}\\text{ unchanged};\\quad F_s C_{DT}=C_{CT}",960,800,24,Palette.yellow),
      d.tex("S_Z=N_0/2,\\;S_X=P/(2W)\\Rightarrow C=W\\log_2(1+P/(N_0W))",960,825,23,Palette.green),
    );
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime);
    const dt=c.during(0,10);
    const ct=c.during(10,18);
    const sampling=c.during(18,25);
    const white=c.p(25);
    const finish=c.p(33);
    this.labels[0].setContent(dt > .5 ? "discrete noise PSD S_Z(ω); covariance units" : "two-sided noise PSD S_Z(f) (W/Hz)");
    this.labels[1].setContent(dt > .5 ? "water level ν=1.4; covariance units" : "water level ν=1.4 W/Hz");
    this.labels[2].setContent(dt > .5 ? "input PSD S_X(ω); covariance units" : "input PSD S_X(f) (W/Hz)");
    this.labels[11].setContent(dt > .5 ? "illustrative PSD: (1/2π)∫ S_X(ω)dω = average power" : "illustrative PSD: ∫ S_X(f)df = total power P");
    this.labels[12].setContent("example: N₀=1.4 W/Hz; P/(2W)=.65 W/Hz; S_Z=N₀/2=.7 W/Hz");
    this.equations[0].setContent(dt > .5 ? "S_X(\\omega)=(\\nu-S_Z(\\omega))^+" : "S_X(f)=(\\nu-S_Z(f))^+");
    this.title.set({opacity:c.p(0)});
    this.title.setContent(white>0.5?"White two-sided noise recovers the lowpass capacity formula":sampling>0.5?"Sampling preserves spectral ratios when densities scale consistently":"Both frequency signs contribute under the real-channel convention");
    this.axes.forEach((line:Polyline):void=>line.setOpacity(Math.max(dt,ct,sampling,white)));
    this.noise.forEach((line:Polyline):void=>line.setOpacity(Math.max(dt,ct,sampling)*(1-white)));
    this.waterline.setOpacity(Math.max(c.p(9),c.p(20))*(1-white));
    this.allocation.forEach((bar:PanelMesh):void=>Diagram.show(bar,Math.max(c.p(9),c.p(20))*(1-white)));
    this.whiteNoise.setOpacity(white);
    this.whiteBars.forEach((bar:PanelMesh):void=>Diagram.show(bar,white));
    this.labels.forEach((label:FormulaHandle,i:number):void=>{
      const visible=i===0?Math.max(dt,ct,sampling,white):i<3?Math.max(dt,ct,sampling)*(1-white):i<7?dt:i<11?Math.max(ct,sampling,white):i===11?Math.max(dt,ct,sampling):i===12?white:finish;
      label.set({opacity:visible});
    });
    this.equations[0].set({opacity:c.p(9)*(1-white),x:960,y:185});
    this.equations[1].set({opacity:c.p(3)*dt,x:960,y:625});
    this.equations[2].set({opacity:Math.max(c.p(5)*dt,c.p(13)*ct),x:960,y:670});
    this.equations[3].set({opacity:c.p(12)*ct,x:960,y:715});
    this.equations[4].set({opacity:c.p(19)*sampling,x:960,y:760});
    this.equations[5].set({opacity:c.p(23)*sampling,x:960,y:800});
    this.equations[6].set({opacity:white,x:960,y:805});
  }

  teardown(_layers:SceneLayers):void{
    this.axes.length=0;this.noise.length=0;this.allocation.length=0;this.whiteBars.length=0;
    this.labels.length=0;this.equations.length=0;
  }
}

export function frequencyWaterfillScene():Scene{return new FrequencyWaterfillScene();}
