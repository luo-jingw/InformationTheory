import type { SceneContext } from "../../../core/Scene";
import type { FormulaHandle } from "../../../layers/FormulaLayer";
import type { Polyline } from "../../../primitives/Polyline";
import { Cues } from "../../../primitives/Cues";
import { Palette } from "../../../primitives/Palette";
import { Diagram, type PanelMesh } from "../../e01-entropy-information/lib/Diagram";

interface BitCell {
  readonly column: number;
  readonly row: number;
  readonly position: number;
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
}

interface RowArrow {
  readonly column: number;
  readonly line: Polyline;
}

/** A complete finite four-symbol observation/processing/side-information experiment. */
export class LostBitExperiment {
  private readonly title: FormulaHandle;
  private readonly model: FormulaHandle;
  private readonly headings: readonly FormulaHandle[];
  private readonly cells: BitCell[]=[];
  private readonly arrows: RowArrow[]=[];
  private readonly verdicts: FormulaHandle[]=[];
  private readonly sideBits: FormulaHandle[]=[];
  private readonly result: FormulaHandle;

  constructor(d: Diagram) {
    this.title=d.text("Can a sharpen button restore a missing bit?",960,80,43);
    this.model=d.text("Four equally likely secrets; the second-bit value is unavailable",960,165,27,Palette.muted);
    this.headings=[d.text("ORIGINAL X",350,240,28,Palette.blue),
      d.text("KEEP FIRST BIT Y",850,240,28,Palette.orange),
      d.text("SHARPEN: APPEND 0",1360,240,27,Palette.purple),
      d.text("NEW TRUE BIT S",1710,240,25,Palette.green)];
    for(let row=0;row<4;row++){
      const y=335+row*122;
      for(let column=0;column<3;column++){
        const center=[350,850,1360][column];
        for(let position=0;position<2;position++){
          const value=position===0?row>>1:column===1?null:column===2?0:row&1;
          this.cells.push({column,row,position,
            mesh:d.rectangle(center+(position===0?-45:45),y,74,74,value===null?Palette.panel:value===0?Palette.blue:Palette.orange),
            label:d.text(value===null?'?':String(value),center+(position===0?-45:45),y,39,value===null?Palette.muted:'#102237')});
        }
      }
      for(let column=0;column<2;column++){
        const first=column===0?485:990, last=column===0?715:1220;
        this.arrows.push({column,line:d.line([[first,y],[last,y],[last-18,y-12],[last,y],[last-18,y+12]],Palette.axis,3)});
      }
      this.verdicts.push(d.text('',1360,y+52,21,Palette.green));
      this.sideBits.push(d.tex(`S=${row&1}`,1710,y,30,Palette.green));
    }
    this.result=d.tex('',960,825,32,Palette.yellow);
  }

  draw(ctx: SceneContext): void {
    const c=new Cues(ctx,ctx.localTime);
    const visible=c.p(0)*(1-c.p(8,.4,-.4));
    const side=c.p(6);
    this.title.set({opacity:visible});
    this.model.set({opacity:visible});
    this.headings.forEach((heading:FormulaHandle,index:number):void=>heading.set({opacity:c.p(index<3?index:6)*visible}));
    this.headings[2].setContent(side>.5?'USE Y AND TRUE S':'SHARPEN: APPEND 0');
    this.cells.forEach((cell:BitCell):void=>{
      const opacity=c.p(cell.column)*visible;
      const restored=cell.column===2&&cell.position===1&&side>.5;
      const value=cell.position===0?cell.row>>1:cell.column===1?null:cell.column===2&&!restored?0:cell.row&1;
      cell.mesh.material.color.set(value===null?Palette.panel:value===0?Palette.blue:Palette.orange);
      Diagram.show(cell.mesh,opacity);
      cell.label.setContent(value===null?'?':String(value));
      cell.label.set({opacity,color:value===null?Palette.muted:'#102237'});
    });
    this.arrows.forEach((arrow:RowArrow):void=>arrow.line.setOpacity(c.p(arrow.column+1)*visible));
    this.verdicts.forEach((label:FormulaHandle,row:number):void=>{
      const correct=side>.5||(row&1)===0;
      label.setContent(correct?'matches X':'a different original');
      label.set({opacity:c.p(4)*visible,color:correct?Palette.green:Palette.red});
    });
    this.sideBits.forEach((label:FormulaHandle):void=>label.set({opacity:side*visible}));
    this.result.set({opacity:c.p(5)*visible});
    this.result.setContent(side>.5?'X=2Y+S:\\quad\\text{every original recovered with new data}':'\\text{Two equally likely originals per }Y:\\quad P_{\\rm success}\\le1/2');
  }
}
