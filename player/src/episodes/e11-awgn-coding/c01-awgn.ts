import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface CodePoint {marker:PanelMesh;label:FormulaHandle;x:number;y:number;}
interface ProofLine {label:FormulaHandle;sentence:number;}

export class RealAwgnScene implements Scene {
  readonly id="c01-awgn";
  private title!:FormulaHandle;
  private readonly points:CodePoint[]=[];
  private readonly axes:Polyline[]=[];
  private ball!:Polyline;
  private noiseStep!:Polyline;
  private received!:PanelMesh;
  private ballLabel!:FormulaHandle;
  private observation!:FormulaHandle;
  private readonly proof:ProofLine[]=[];
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("One real coordinate per channel use",960,100,47);
    this.axes.push(d.line([[170,490],[870,490]],Palette.axis),d.line([[500,180],[500,790]],Palette.axis));
    this.ball=d.line(Array.from({length:161},(_:unknown,i:number):readonly[number,number]=>[960+Math.cos(i*Math.PI/80),540+Math.sin(i*Math.PI/80)]),Palette.green,4);this.ball.object.position.set((500-960)/100,(540-490)/100,0);
    const points:ReadonlyArray<readonly[number,number]>=[[-1,-1],[-1,1],[1,-1],[1,1],[1.5,1.5]];
    for(let i=0;i<points.length;i++){const[x,y]=points[i];this.points.push({marker:d.rectangle(500+x*170,490-y*170,18,18,i===4?Palette.red:Palette.blue),label:d.tex(i===4?"\\|x\\|^2=4.5>2":"x_"+String(i+1),500+x*170,455-y*170,27,i===4?Palette.red:Palette.blue),x,y});}
    this.noiseStep=d.line([[670,320],[636,388],[638,368],[636,388],[652,377]],Palette.orange,4);this.received=d.rectangle(636,388,17,17,Palette.orange);this.observation=d.tex("x=(1,1),\\ z=(-.2,-.4),\\ y=(.8,.6)",500,790,28,Palette.orange);this.ballLabel=d.tex("n=2,\\ P=1:\\quad\\|x\\|\\le\\sqrt2",500,160,33,Palette.green);
    const lines:ReadonlyArray<readonly[string,number]>=[
      ["Y_i=X_i+Z_i,\\quad Z_i\\overset{\\rm iid}{\\sim}N(0,N),\\quad N>0",0],
      ["Z^n\\perp(J,X^n)\\quad[\\text{nonfeedback code}]",4],
      ["\\forall j:\\quad\\sum_{i=1}^n x_i(j)^2\\le nP",8],
      ["\\text{Every codeword is constrained individually}",10],
      ["P=0\\Rightarrow X^n=0\\Rightarrow C=0",12],
      ["\\operatorname{SNR}=P/N;\\quad C\\text{ in bits/real use}",14],
    ];
    for(let i=0;i<lines.length;i++)this.proof.push({label:d.tex(lines[i][0],1350,250+i*107,i===0||i===1||i===5?29:35,i===2||i===4?Palette.yellow:Palette.text),sentence:lines[i][1]});this.note=d.text("",960,850,24,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),zero=c.p(12)*(1-c.p(14)),radius=Math.sqrt(2*(1-zero))*170;
    this.title.set({opacity:c.p(0)});this.axes.forEach((line:Polyline):void=>line.setOpacity(c.p(0)));this.ball.object.scale.set(Math.max(.001,radius),Math.max(.001,radius),1);this.ball.setOpacity(c.p(7));
    this.points.forEach((point:CodePoint,i:number):void=>{const shrink=i===4?1:1-zero;point.marker.position.set((500+point.x*170*shrink-960)/100,(540-490+point.y*170*shrink)/100,.1);point.marker.material.color.set(i===4&&ctx.localTime>=c.s(8)?Palette.red:Palette.blue);Diagram.show(point.marker,c.p(i===3?0:5)*(i===4?c.p(7):1));if(i===4)point.label.setContent(ctx.localTime<c.s(8)?"x=(1.5,1.5):\\ \\text{allowed?}":"\\|x\\|^2=4.5>2");point.label.set({color:i===4&&ctx.localTime>=c.s(8)?Palette.red:Palette.blue,opacity:c.p(i===3?0:5)*(i===4?c.p(7):1-zero),x:500+point.x*170*shrink,y:455-point.y*170*shrink});});
    this.noiseStep.setOpacity(c.p(0)*(1-zero)*(1-c.p(7)));Diagram.show(this.received,c.p(0)*(1-zero)*(1-c.p(7)));this.observation.set({opacity:c.p(0)*(1-c.p(7))});this.ballLabel.set({opacity:c.p(7)});this.ballLabel.setContent(zero>.5?"P=0:\\quad\\text{all admissible codewords coincide at the origin}":"n=2,\\ P=1:\\quad\\|x\\|^2\\le2");this.ballLabel.set({scale:zero>.5?.8:1});
    this.proof.forEach((line:ProofLine):void=>line.label.set({opacity:c.p(line.sentence)}));this.note.set({opacity:c.p(5),y:845});this.note.setContent("Left: an exact two-coordinate power illustration. The displayed noise displacement is one possible vector, not a measurement.");
  }

  teardown(_layers:SceneLayers):void{this.points.length=0;this.axes.length=0;this.proof.length=0;}
}
export function realAwgnScene():Scene{return new RealAwgnScene();}
