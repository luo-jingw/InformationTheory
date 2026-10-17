import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface HuffmanNode {
  readonly id: string;
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
  readonly codeLabel?: FormulaHandle;
  readonly revealSentence: number;
  readonly x: number;
  readonly y: number;
  readonly baseColor: string;
}

interface HuffmanEdge {
  readonly parentId: string;
  readonly childId: string;
  readonly bit: "0" | "1";
  readonly line: Polyline;
  readonly bitLabel: FormulaHandle;
  readonly revealSentence: number;
  readonly midpointX: number;
  readonly midpointY: number;
}

interface QueueItem {readonly id:string;readonly weight:number;}

interface ProbabilityCard {
  readonly symbol: string;
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
}

interface RuleNode {
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
  readonly shapeSentence: number;
  readonly labelSentence: number;
}

export class HuffmanMergeScene implements Scene {
  readonly id = "c02-huffman";
  private title!: FormulaHandle;
  private readonly nodes: HuffmanNode[] = [];
  private readonly edges: HuffmanEdge[] = [];
  private readonly cards: ProbabilityCard[] = [];
  private readonly equations: FormulaHandle[] = [];
  private readonly captions: FormulaHandle[] = [];
  private readonly ruleNodes: RuleNode[] = [];
  private readonly ruleEdges: Polyline[] = [];
  private readonly ruleBits: FormulaHandle[] = [];
  private ruleHint!: FormulaHandle;
  private readonly queues:ReadonlyArray<ReadonlyArray<QueueItem>>=[
    [{id:"A",weight:.4},{id:"B",weight:.2},{id:"C",weight:.2},{id:"D",weight:.1},{id:"E",weight:.05},{id:"F",weight:.05}],
    [{id:"A",weight:.4},{id:"B",weight:.2},{id:"C",weight:.2},{id:"D",weight:.1},{id:"EF",weight:.1}],
    [{id:"A",weight:.4},{id:"B",weight:.2},{id:"C",weight:.2},{id:"DEF",weight:.2}],
    [{id:"A",weight:.4},{id:"DEF",weight:.2},{id:"BC",weight:.4}],
    [{id:"BC",weight:.4},{id:"R",weight:.6}],
    [{id:"ROOT",weight:1}],
  ];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Repeatedly merge the two lightest weights", 960, 100, 44);
    const ruleData: ReadonlyArray<readonly [number, number, string, number, number]> = [
      [740, 560, "p", 0, 0], [1180, 560, "q", 0, 0], [960, 330, "p+q", 2, 3],
    ];
    for (const [x, y, label, shapeSentence, labelSentence] of ruleData) {
      this.ruleNodes.push({mesh: d.rectangle(x, y, 170, 85, "#203952"),
        label: d.tex(label, x, y, 38, Palette.blue), shapeSentence, labelSentence});
    }
    this.ruleEdges.push(d.line([[960, 372], [740, 518]], Palette.axis, 4),
      d.line([[960, 372], [1180, 518]], Palette.axis, 4));
    this.ruleBits.push(d.text("0", 830, 430, 32, Palette.yellow),
      d.text("1", 1090, 430, 32, Palette.yellow));
    this.ruleHint = d.text("Two smallest current weights become one new weight", 960, 755, 30, Palette.muted);

    const cardData: ReadonlyArray<readonly [string, string]> = [
      ["A", ".40"], ["B", ".20"], ["C", ".20"], ["D", ".10"], ["E", ".05"], ["F", ".05"],
    ];
    cardData.forEach((entry: readonly [string, string], i: number): void => {
      const [symbol, weight] = entry;
      const x = 430 + i * 112;
      this.cards.push({
        symbol,
        mesh: d.rectangle(x, 245, 100, 76, i < 3 ? Palette.blue : Palette.orange),
        label: d.tex(`${symbol}\\;${weight}`, x, 245, 27, Palette.text),
      });
    });

    const nodeData: ReadonlyArray<readonly [string, string, number, number, number, string, string?]> = [
      ["ROOT", "1.00", 1280, 190, 19, Palette.yellow],
      ["BC", "BC · .40", 1000, 340, 16, Palette.green],
      ["R", ".60", 1570, 340, 18, Palette.green],
      ["B", "B · .20", 840, 480, 15, Palette.blue, "00"],
      ["C", "C · .20", 1160, 480, 15, Palette.blue, "01"],
      ["DEF", ".20", 1430, 480, 14, Palette.green],
      ["A", "A · .40", 1740, 480, 17, Palette.blue, "11"],
      ["D", "D · .10", 1310, 620, 13, Palette.blue, "100"],
      ["EF", ".10", 1550, 620, 12, Palette.green],
      ["E", "E · .05", 1480, 755, 11, Palette.blue, "1010"],
      ["F", "F · .05", 1655, 755, 11, Palette.blue, "1011"],
    ];
    for (const [id, label, x, y, revealSentence, color, code] of nodeData) {
      this.nodes.push({
        id,
        mesh: d.rectangle(x, y, id.length > 1 ? 132 : 112, 62, color),
        label: d.text(label, x, y, 26, Palette.text),
        ...(code === undefined ? {} : { codeLabel: d.tex(code, x, y + 48, 27, Palette.yellow) }),
        revealSentence,
        x,
        y,
        baseColor: color,
      });
    }

    const edgeData: ReadonlyArray<readonly [string, string, "0" | "1", number]> = [
      ["ROOT", "BC", "0", 19], ["ROOT", "R", "1", 19],
      ["BC", "B", "0", 16], ["BC", "C", "1", 16],
      ["R", "DEF", "0", 18], ["R", "A", "1", 18],
      ["DEF", "D", "0", 14], ["DEF", "EF", "1", 14],
      ["EF", "E", "0", 12], ["EF", "F", "1", 12],
    ];
    for (const [parentId, childId, bit, revealSentence] of edgeData) {
      const parent = this.nodeById(parentId);
      const child = this.nodeById(childId);
      const start: readonly [number, number] = [parent.x, parent.y + 31];
      const end: readonly [number, number] = [child.x, child.y - 31];
      const midpointX = (start[0] + end[0]) / 2;
      const midpointY = (start[1] + end[1]) / 2;
      this.edges.push({
        parentId,
        childId,
        bit,
        line: d.line([start, end], Palette.axis, 3),
        bitLabel: d.text(bit, midpointX + (bit === "0" ? -15 : 15), midpointY, 25, Palette.yellow),
        revealSentence,
        midpointX,
        midpointY,
      });
    }

    this.equations.push(
      d.tex("EF=.05+.05=.10", 430, 390, 31, Palette.yellow),
      d.tex("DEF=.10+.10=.20", 430, 450, 31, Palette.yellow),
      d.tex("BC=.20+.20=.40", 430, 510, 31, Palette.yellow),
      d.tex("R=.20+.40=.60", 430, 570, 31, Palette.yellow),
      d.tex("1=.40+.60", 430, 630, 31, Palette.yellow),
      d.tex("L=\\sum_i p_i l_i", 500, 675, 29, Palette.yellow),
      d.tex("H(P)\\approx2.221928\\text{ bits/symbol}", 500, 745, 31, Palette.green),
    );
    this.captions.push(
      d.text("Merge the smallest pair; keep the parent weight in the queue", 480, 330, 26, Palette.muted),
      d.text("Every leaf is reached by its root-to-leaf bit string", 1250, 830, 25, Palette.muted),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const inputs = c.during(8, 20);
    const codes = c.p(20);
    const lengths = c.during(25, 31);
    const entropy = c.p(30);
    const examplesEnd = c.p(32);
    const calculationFocus = 1 - 0.5 * c.p(25);
    const mergePair = this.currentMerge(ctx, c);
    const rule = 1 - c.p(8);
    this.ruleNodes.forEach((node: RuleNode): void => {
      Diagram.show(node.mesh, c.p(node.shapeSentence) * rule);
      node.label.set({opacity: c.p(node.labelSentence) * rule});
    });
    this.ruleEdges.forEach((edge: Polyline): void => edge.setOpacity(c.p(2) * rule));
    this.ruleBits.forEach((bit: FormulaHandle): void => bit.set({opacity: c.p(5) * rule}));
    this.ruleHint.set({opacity: c.p(1) * rule});

    this.title.set({ opacity: c.p(0) });
    this.title.setContent(examplesEnd > 0.5 ? "The merge rule needs an optimality proof" : codes > 0.5 ? "Branch labels turn the merge tree into codewords" : c.p(11) > 0.5 ? "Merge order determines a reproducible prefix tree" : "Repeatedly merge the two lightest weights");
    const queueIndex=[11,13,15,17,19].filter((sentence:number):boolean=>ctx.localTime>=c.s(sentence)).length;
    const queue=this.queues[queueIndex];
    this.cards.forEach((card: ProbabilityCard, i: number): void => {
      const item=queue[i],opacity=item===undefined?0:inputs;
      const highlighted=item!==undefined&&mergePair.includes(item.id);
      Diagram.show(card.mesh,opacity);
      card.label.set({opacity,color:highlighted?Palette.yellow:Palette.text});
      if(item!==undefined)card.label.setContent(`\\begin{gathered}\\mathrm{${item.id}}\\\\${item.weight.toFixed(2)}\\end{gathered}`);
      card.mesh.material.color.set(highlighted?"#53472c":item!==undefined&&item.id.length>1?"#244132":"#203952");
    });
    this.nodes.forEach((node: HuffmanNode): void => {
      const shown = c.p(node.revealSentence) * calculationFocus * (1 - examplesEnd * 0.1);
      Diagram.show(node.mesh, shown);
      node.mesh.material.color.set(mergePair.includes(node.id) ? "#53472c" : node.baseColor === Palette.blue ? "#203952" : node.baseColor === Palette.green ? "#244132" : "#4b4424");
      node.label.set({ opacity: shown, color: mergePair.includes(node.id) ? Palette.yellow : Palette.text });
      if (node.codeLabel !== undefined) {
        const codeCue = node.id === "A" || node.id === "B" || node.id === "C" ? c.p(21)
          : node.id === "D" ? c.p(22) : node.id === "E" ? c.p(23) : c.p(24);
        node.codeLabel.set({ opacity: codeCue * shown });
      }
    });
    this.edges.forEach((edge: HuffmanEdge): void => {
      const opacity = c.p(edge.revealSentence) * calculationFocus * (1 - examplesEnd * 0.1);
      edge.line.setOpacity(opacity);
      edge.bitLabel.set({ opacity: codes * opacity });
    });

    const mergeSentences = [11, 13, 15, 17, 19];
    this.equations.slice(0, 5).forEach((equation: FormulaHandle, i: number): void => {
      equation.set({ opacity: c.p(mergeSentences[i]) * (1 - c.p(25)), x: 430, y: 390 + i * 60 });
    });
    this.equations[5].set({ opacity: lengths, x: 500, y: 675, scale: 0.9 });
    this.equations[5].setContent(ctx.localTime >= c.s(29)
      ? "L=2.3\\;\\text{bits/symbol}"
      : ctx.localTime >= c.s(28)
        ? "L=1.6+.1(3)+.05(4)+.05(4)=2.3"
        : ctx.localTime >= c.s(27)
          ? "L=.4(2)+.2(2)+.2(2)=1.6"
          : "L=\\sum_i p_i l_i");
    this.equations[6].set({ opacity: entropy * (1 - examplesEnd * 0.45), x: 500, y: 745, scale: 0.9 });
    this.captions[0].set({ opacity: inputs });
    this.captions[1].set({ opacity: codes * (1 - examplesEnd * 0.55) });
  }

  teardown(_layers: SceneLayers): void {
    this.nodes.length = 0;
    this.edges.length = 0;
    this.cards.length = 0;
    this.equations.length = 0;
    this.captions.length = 0;
    this.ruleNodes.length = 0;
    this.ruleEdges.length = 0;
    this.ruleBits.length = 0;
  }

  private nodeById(id: string): HuffmanNode {
    const node = this.nodes.find((candidate: HuffmanNode): boolean => candidate.id === id);
    if (node === undefined) throw new Error(`Missing Huffman node ${id}`);
    return node;
  }

  private currentMerge(ctx: SceneContext, cues: Cues): readonly string[] {
    if (ctx.localTime < cues.s(11)) return [];
    if (ctx.localTime < cues.s(13)) return ["E", "F", "EF"];
    if (ctx.localTime < cues.s(15)) return ["D", "EF", "DEF"];
    if (ctx.localTime < cues.s(17)) return ["B", "C", "BC"];
    if (ctx.localTime < cues.s(19)) return ["DEF", "A", "R"];
    if (ctx.localTime < cues.s(20)) return ["BC", "R", "ROOT"];
    return [];
  }
}

export function huffmanMergeScene(): Scene {
  return new HuffmanMergeScene();
}
