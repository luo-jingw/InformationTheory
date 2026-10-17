import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class McMillanCountingScene implements Scene {
  readonly id = "c03-mcmillan";
  private title!: FormulaHandle;
  private readonly bins: PanelMesh[] = [];
  private readonly labels: FormulaHandle[] = [];
  private readonly strings: FormulaHandle[] = [];
  private readonly proof: ProofLine[] = [];
  private readonly axes: Polyline[] = [];
  private rootCurve!: Polyline;
  private rootLabel!: FormulaHandle;
  private example!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Count concatenations by total encoded length", 960, 100, 47);
    const groups: readonly (readonly string[])[] = [["000"], ["0001", "0010", "0100"], ["00101", "01001", "01010"], ["010101"]];
    for (let i = 0; i < 4; i++) {
      const x = 260 + i % 2 * 375, y = 300 + Math.floor(i / 2) * 250;
      this.bins.push(d.rectangle(x, y + 55, 330, 180, "#203952"));
      this.labels.push(d.tex(`j=${i + 3}:\\quad A_j=${[1,3,3,1][i]}\\le2^{${i + 3}}`, x, y - 65, 29, Palette.yellow));
      for (let k = 0; k < groups[i].length; k++) this.strings.push(d.text(groups[i][k], x, y + 10 + k * 48, 30, Palette.blue));
    }
    this.example = d.tex("C=\\{0,01\\},\\quad k=3,\\quad K=3/4", 470, 800, 35, Palette.green);
    const proof: ReadonlyArray<readonly [string, number]> = [
      ["K=\\sum_iD^{-l_i}", 2],
      ["A_j\\le D^j\\quad[\\text{unique decodability}]", 6],
      ["K^k=\\sum_j A_jD^{-j}", 11],
      ["kl_{\\min}\\le j\\le kl_{\\max}", 12],
      ["K^k\\le k(l_{\\max}-l_{\\min})+1", 16],
      ["K\\le[k(l_{\\max}-l_{\\min})+1]^{1/k}\\longrightarrow1", 17],
    ];
    for (let i = 0; i < proof.length; i++) this.proof.push({ label: d.tex(proof[i][0], 1350, 240 + i * 110, i === 5 ? 29 : 36, i >= 4 ? Palette.yellow : Palette.text), sentence: proof[i][1] });
    this.axes.push(d.line([[170,300],[170,700],[850,700]],Palette.axis),d.line([[170,600],[850,600]],Palette.green,3));
    this.rootCurve = d.line(Array.from({length:64},(_:unknown,i:number):readonly[number,number]=>[180+i*10,600-230*((i+2)**(1/(i+1))-1)]),Palette.orange,5);
    this.rootLabel = d.tex("\\Delta l=1:\\quad(k+1)^{1/k}\\to1",500,760,35,Palette.orange);
    this.note = d.text("",960,845,25,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),root=c.p(18)*(1-c.p(21)),groups=1-root;
    this.title.set({opacity:c.p(0)});this.bins.forEach((mesh:PanelMesh,i:number):void=>{Diagram.show(mesh,c.p(4)*groups);this.labels[i].set({opacity:c.p(5)*groups});});this.strings.forEach((label:FormulaHandle):void=>label.set({opacity:c.p(4)*groups}));
    this.example.set({opacity:c.p(4)*groups});this.proof.forEach((line:ProofLine,index:number):void=>{
      line.label.set({opacity:c.p(line.sentence)});
      if(index===5)line.label.setContent(ctx.localTime<c.s(18)?"K\\le[k(l_{\\max}-l_{\\min})+1]^{1/k}":"K\\le[k(l_{\\max}-l_{\\min})+1]^{1/k}\\longrightarrow1");
    });
    this.axes.forEach((line:Polyline):void=>line.setOpacity(root));this.rootCurve.setOpacity(root);this.rootLabel.set({opacity:root});
    this.note.set({opacity:c.p(6)});this.note.setContent(root>.5?"Polynomial growth in the number of possible lengths becomes one after taking the k-th root":"Every displayed concatenation is distinct for this UD code; the count concerns ordered codeword sequences");
  }

  teardown(_layers:SceneLayers):void{this.bins.length=0;this.labels.length=0;this.strings.length=0;this.proof.length=0;this.axes.length=0;}
}
export function mcMillanCountingScene():Scene{return new McMillanCountingScene();}
