import type { SceneContext } from "../../../core/Scene";
import type { FormulaHandle } from "../../../layers/FormulaLayer";
import type { Polyline } from "../../../primitives/Polyline";
import { Cues } from "../../../primitives/Cues";
import { Palette } from "../../../primitives/Palette";
import { Diagram, type PanelMesh } from "./Diagram";

interface QuestionNode {
  readonly x: number;
  readonly y: number;
  readonly label: string;
  readonly outcome: boolean;
}

interface VisibleNode {
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
}

/** Two explicit question trees for the same weighted secret; no coding optimality claim. */
export class SecretQuestionExperiment {
  private readonly title: FormulaHandle;
  private readonly probabilities: FormulaHandle;
  private readonly headings: readonly FormulaHandle[];
  private readonly nodes: VisibleNode[] = [];
  private readonly branches: Polyline[] = [];
  private readonly answers: FormulaHandle[] = [];
  private readonly costs: readonly FormulaHandle[];
  private readonly rare: FormulaHandle;

  constructor(d: Diagram) {
    this.title=d.text("Find the hidden message: which questions cost less?",960,76,42);
    this.probabilities=d.tex("P(A)=1/2,\\quad P(B)=1/4,\\quad P(C)=P(D)=1/8",960,165,30,Palette.yellow);
    this.headings=[d.text("SPLIT THE FOUR LABELS EVENLY",500,255,25,Palette.blue),
      d.text("ASK ABOUT THE LIKELY LABEL FIRST",1410,255,25,Palette.green)];
    const balanced:readonly QuestionNode[]=[
      {x:500,y:315,label:"A or B?",outcome:false},
      {x:320,y:480,label:"Is it A?",outcome:false},{x:700,y:480,label:"Is it C?",outcome:false},
      {x:210,y:675,label:"A: 1/2",outcome:true},{x:420,y:675,label:"B: 1/4",outcome:true},
      {x:620,y:675,label:"C: 1/8",outcome:true},{x:830,y:675,label:"D: 1/8",outcome:true},
    ];
    const frequent:readonly QuestionNode[]=[
      {x:1360,y:315,label:"Is it A?",outcome:false},
      {x:1110,y:465,label:"A: 1/2",outcome:true},{x:1520,y:465,label:"Is it B?",outcome:false},
      {x:1340,y:605,label:"B: 1/4",outcome:true},{x:1660,y:605,label:"Is it C?",outcome:false},
      {x:1550,y:745,label:"C: 1/8",outcome:true},{x:1770,y:745,label:"D: 1/8",outcome:true},
    ];
    this.tree(d,balanced,[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]);
    this.tree(d,frequent,[[0,1],[0,2],[2,3],[2,4],[4,5],[4,6]]);
    this.costs=[d.tex("\\mathbb E[Q]=2",500,825,34,Palette.blue),
      d.tex("\\mathbb E[Q]=\\tfrac12+\\tfrac12+\\tfrac34=1.75",1420,825,31,Palette.green)];
    this.rare=d.text("Rare paths: 3 questions; the comparison is a model-weighted average",960,205,23,Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c=new Cues(ctx,ctx.localTime);
    const visible=c.p(0)*(1-c.p(8,.4,-.4));
    const trees=c.p(2)*visible;
    this.title.set({opacity:visible});
    this.probabilities.set({opacity:c.p(1)*visible});
    this.headings.forEach((label:FormulaHandle):void=>label.set({opacity:trees}));
    this.nodes.forEach((node:VisibleNode):void=>{
      Diagram.show(node.mesh,trees);node.label.set({opacity:trees});
    });
    this.branches.forEach((line:Polyline):void=>line.setOpacity(trees));
    this.answers.forEach((label:FormulaHandle):void=>label.set({opacity:trees}));
    this.costs[0].set({opacity:c.p(4)*visible});
    this.costs[1].set({opacity:c.p(5)*visible});
    this.rare.set({opacity:c.p(6)*visible,y:205});
  }

  private tree(d: Diagram, specs: readonly QuestionNode[], edges: ReadonlyArray<readonly [number,number]>): void {
    specs.forEach((node:QuestionNode):void=>{
      this.nodes.push({mesh:d.rectangle(node.x,node.y,170,62,node.outcome?"#24394d":Palette.panel),
        label:d.text(node.label,node.x,node.y,27,node.outcome?Palette.green:Palette.text)});
    });
    edges.forEach(([from,to]:readonly [number,number],index:number):void=>{
      const start=specs[from],end=specs[to];
      this.branches.push(d.line([[start.x,start.y+33],[end.x,end.y-33]],Palette.axis,3));
      const x=start.x+(end.x-start.x)*.53;
      const y=start.y+(end.y-start.y)*.53;
      this.answers.push(d.text(index%2===0?"yes":"no",x+(index%2===0?-25:25),y,20,Palette.muted));
    });
  }
}
