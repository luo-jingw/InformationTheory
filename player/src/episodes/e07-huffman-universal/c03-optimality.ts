import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine {label:FormulaHandle;sentence:number;}
interface ExchangeLeaf {box:PanelMesh;label:FormulaHandle;depth:number;}

export class HuffmanOptimalityScene implements Scene {
  readonly id="c03-optimality";
  private title!:FormulaHandle;
  private readonly nodes:PanelMesh[]=[];
  private readonly edges:Polyline[]=[];
  private readonly leaves:ExchangeLeaf[]=[];
  private readonly proof:ProofLine[]=[];
  private cost!:FormulaHandle;
  private pseudo!:PanelMesh;
  private pseudoLabel!:FormulaHandle;
  private contraction!:FormulaHandle;
  private note!:FormulaHandle;

  setup(layers:SceneLayers):void{
    const d=new Diagram(layers);this.title=d.text("Exchange light symbols into deepest sibling leaves",960,100,46);
    const points:ReadonlyArray<readonly[number,number]>=[[390,230],[600,400],[720,570]],pairs:ReadonlyArray<readonly[ReadonlyArray<readonly[number,number]>,string]>=[[[[390,230],[210,400]],Palette.axis],[[[390,230],[600,400]],Palette.axis],[[[600,400],[470,570]],Palette.axis],[[[600,400],[720,570]],Palette.axis],[[[720,570],[625,740]],Palette.axis],[[[720,570],[815,740]],Palette.axis]];
    for(const [path,color] of pairs)this.edges.push(d.line(path,color,4));for(const [x,y] of points)this.nodes.push(d.rectangle(x,y,34,34,Palette.axis));
    const positions:ReadonlyArray<readonly[number,number,number]>=[[210,400,1],[470,570,2],[625,740,3],[815,740,3]];
    for(const [x,y,depth] of positions)this.leaves.push({box:d.rectangle(x,y,170,85,"#203952"),label:d.tex("",x,y,30,Palette.blue),depth});
    const proof:ReadonlyArray<readonly[string,number]>=[
      ["\\text{Contract unary nodes}\\Rightarrow\\text{strictly lower cost}",2],
      ["m\\text{ leaves}:\\quad m-1\\text{ internal nodes},\\quad l_{\\max}\\le m-1",6],
      ["\\text{Finite full tree shapes and labels}\\Rightarrow\\text{an optimum exists}",8],
      ["\\Delta L_a=(p_a-p_u)(l_{\\max}-l_a)\\le0",17],
      ["\\Delta L_b=(p_b-p_v)(l_{\\max}-l_b)\\le0\\quad[v\\ne a]",21],
      ["L_{\\rm expanded}=L_{\\rm reduced}+p_a+p_b",26],
    ];
    for(let i=0;i<proof.length;i++)this.proof.push({label:d.tex(proof[i][0],1350,245+i*95,i===0||i===1||i===2?29:34,i>=3?Palette.yellow:Palette.text),sentence:proof[i][1]});
    this.pseudo=d.rectangle(720,570,185,90,"#244132");this.pseudoLabel=d.tex("a+b:0.15",720,570,30,Palette.green);
    this.cost=d.tex("",470,825,33,Palette.green);this.contraction=d.tex("",1350,820,30,Palette.green);this.note=d.text("",960,875,22,Palette.muted);
  }

  draw(ctx:SceneContext):void{
    const c=new Cues(ctx,ctx.localTime),first=c.p(14),second=c.p(19),merge=c.p(23),dary=c.p(37);
    this.title.set({opacity:c.p(0)});this.title.setContent(dary>.5?"Pad D-ary leaves to satisfy the full-tree congruence":merge>.5?"A fixed merge cost reduces the optimization problem":"Exchange light symbols into deepest sibling leaves");
    const labels=second>.5?["u:0.50","v:0.35","a:0.05","b:0.10"]:first>.5?["u:0.50","b:0.10","a:0.05","v:0.35"]:["a:0.05","b:0.10","u:0.50","v:0.35"];
    this.nodes.forEach((mesh:PanelMesh,i:number):void=>Diagram.show(mesh,c.p(0)*(i===2?1-merge:1)*(1-dary)));
    this.edges.forEach((line:Polyline,i:number):void=>line.setOpacity(c.p(0)*(i>=4?1-merge:1)*(1-dary)));
    this.leaves.forEach((leaf:ExchangeLeaf,i:number):void=>{const opacity=c.p(0)*(i>=2?1-merge:1)*(1-dary);Diagram.show(leaf.box,opacity);leaf.label.setContent(labels[i]);leaf.label.set({opacity});});
    const cost=second>.5?1.65:first>.5?1.9:2.8;
    Diagram.show(this.pseudo,merge*(1-dary));this.pseudoLabel.set({opacity:merge*(1-dary)});
    this.cost.set({opacity:c.p(12)*(1-dary),y:800});this.cost.setContent(merge>.5?(ctx.localTime<c.s(26)?"p_{a+b}=0.05+0.10=0.15":"\\text{Example merge: }L'=1.50,\\quad L=L'+0.15=1.65"):`\\text{Exchange example: }\\mathbb E\\ell=${cost.toFixed(2)}`);
    this.contraction.set({opacity:c.p(27),y:800});this.contraction.setContent(dary>.5?"m+r-1\\equiv0\\pmod{D-1};\\quad r\\text{ minimal},\\ r\\ge0":"\\text{Better reduced tree}\\Rightarrow\\text{better expanded tree}");
    this.proof.forEach((line:ProofLine,i:number):void=>{line.label.set({opacity:c.p(line.sentence)});if(dary>.5)line.label.setContent(["\\text{Full D-ary tree}:\\quad m-1\\equiv0\\pmod{D-1}","\\text{Add }r\\text{ zero-probability leaves}","\\text{Merge the }D\\text{ smallest weights}","\\text{Zero padding contributes no expected length}","\\text{Binary base case: two leaves }0,1","\\text{Induction uses exchange and exact merge cost}"][i]);else line.label.setContent(["\\text{Contract unary nodes}\\Rightarrow\\text{strictly lower cost}","m\\text{ leaves}:\\quad m-1\\text{ internal nodes},\\quad l_{\\max}\\le m-1","\\text{Finite full shapes and labels}\\Rightarrow\\text{an optimum exists}","\\Delta L_a=(p_a-p_u)(l_{\\max}-l_a)\\le0","\\Delta L_b=(p_b-p_v)(l_{\\max}-l_b)\\le0\\quad[v\\ne a]","L_{\\rm expanded}=L_{\\rm reduced}+p_a+p_b"][i]);});
    this.note.set({opacity:c.p(12),y:845});this.note.setContent(dary>.5?"Dummy symbols complete the D-ary leaf count without changing positive-symbol cost":"Left: numerical exchanges from an arbitrary tree. The optimality proof applies the same nonincreasing exchanges to an optimal tree.");
  }

  teardown(_layers:SceneLayers):void{this.nodes.length=0;this.edges.length=0;this.leaves.length=0;this.proof.length=0;}
}
export function huffmanOptimalityScene():Scene{return new HuffmanOptimalityScene();}
