import type { SceneContext } from "../../../core/Scene";
import type { FormulaHandle } from "../../../layers/FormulaLayer";
import { Cues } from "../../../primitives/Cues";
import { Palette } from "../../../primitives/Palette";
import { Diagram, type PanelMesh } from "../../e01-entropy-information/lib/Diagram";

interface InventoryLabel {
  readonly row: number;
  readonly label: FormulaHandle;
}

interface CodewordBit {
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
}

/** Exact bit count for a fixed inventory under two explicitly prefix-free codebooks. */
export class BitBillExperiment {
  private readonly title: FormulaHandle;
  private readonly headings: readonly FormulaHandle[];
  private readonly inventory: InventoryLabel[] = [];
  private readonly bits: CodewordBit[] = [];
  private readonly totals: readonly FormulaHandle[];
  private readonly difference: FormulaHandle;
  private readonly models: FormulaHandle;

  constructor(d: Diagram) {
    this.title=d.text("The same messages: which code gives the smaller bill?",960,80,42);
    this.headings=[d.text("CODE P: SHORT WORDS FOR FREQUENT MESSAGES",500,235,25,Palette.blue),
      d.text("CODE Q: TWO BITS FOR EVERY MESSAGE",1420,235,25,Palette.purple)];
    const counts=[500,250,125,125];
    const symbols=['A','B','C','D'];
    const codebooks:readonly (readonly string[])[]=[['0','10','110','111'],['00','01','10','11']];
    for(let column=0;column<2;column++){
      for(let row=0;row<4;row++){
        const y=345+row*112;
        const countX=column===0?220:1150;
        this.inventory.push({row,label:d.text(`${symbols[row]} × ${counts[row]}`,countX,y,29,Palette.text)});
        const word=codebooks[column][row];
        for(let index=0;index<word.length;index++){
          const x=(column===0?455:1390)+index*82;
          this.bits.push({mesh:d.rectangle(x,y,65,65,word[index]==='0'?Palette.blue:Palette.orange),
            label:d.text(word[index],x,y,34,'#102237')});
        }
      }
    }
    this.totals=[d.tex("500(1)+250(2)+250(3)=1750\\ \\text{bits}",500,790,31,Palette.blue),
      d.tex("1000(2)=2000\\ \\text{bits}",1420,790,34,Palette.purple)];
    this.difference=d.tex("2000-1750=250\\ \\text{bits}=.25\\ \\text{bit/message}",960,840,29,Palette.yellow);
    this.models=d.tex("P=(1/2,1/4,1/8,1/8),\\quad Q=(1/4,1/4,1/4,1/4)",960,165,29,Palette.green);
  }

  draw(ctx: SceneContext): void {
    const c=new Cues(ctx,ctx.localTime);
    const visible=c.p(0)*(1-c.p(8,.4,-.4));
    const words=c.p(2)*visible;
    this.title.set({opacity:visible});
    this.headings.forEach((label:FormulaHandle):void=>label.set({opacity:words}));
    this.inventory.forEach((item:InventoryLabel):void=>item.label.set({opacity:c.p(item.row===0?0:1)*visible}));
    this.bits.forEach((bit:CodewordBit):void=>{
      Diagram.show(bit.mesh,words);bit.label.set({opacity:words});
    });
    this.totals[0].set({opacity:c.p(4)*visible});
    this.totals[1].set({opacity:c.p(5)*visible});
    this.difference.set({opacity:c.p(5)*visible});
    this.models.set({opacity:c.p(6)*visible});
  }
}
