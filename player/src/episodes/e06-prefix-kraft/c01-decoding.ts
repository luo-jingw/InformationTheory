import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Polyline } from "../../primitives/Polyline";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

type LineKind = "text" | "tex";
type CodeSet = "ambiguous" | "prefix";
type StripId = "ac-parse" | "ba-parse" | "forced-pairs" | "leftover-zero" | "prefix-parse";

interface CodewordCard {
  readonly set: CodeSet;
  readonly symbol: string;
  readonly word: string;
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
}

interface BitCell {
  readonly mesh: PanelMesh;
  readonly value: FormulaHandle;
  readonly bit: number;
  readonly index: number;
}

interface SegmentLabel {
  readonly startIndex: number;
  readonly endIndex: number;
  readonly handle: FormulaHandle;
}

interface BitStrip {
  readonly id: StripId;
  readonly bits: readonly number[];
  readonly y: number;
  readonly label: FormulaHandle;
  readonly cells: readonly BitCell[];
  readonly boundaries: readonly Polyline[];
  readonly boundaryAfter: readonly number[];
  readonly boundaryColor: string;
  readonly segmentLabels: readonly SegmentLabel[];
}

interface TreeNode {
  readonly path: string;
  readonly symbol: string | null;
  readonly x: number;
  readonly y: number;
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
}

interface AnalysisLine {
  readonly kind: LineKind;
  readonly content: string;
}

interface AnalysisFrame {
  readonly heading: string;
  readonly lines: readonly AnalysisLine[];
}

interface AnalysisSlot {
  readonly kind: LineKind;
  readonly handle: FormulaHandle;
}

const BLUE = "#67aef5";
const GREEN = "#72dfaa";
const ORANGE = "#f5ad62";
const RED = "#ff747c";
const RAW_X = 550;
const RAW_STEP = 110;
const ANALYSIS_X = 1455;
const ANALYSIS_Y = 282;
const ANALYSIS_STEP = 84;
const SLOT_KINDS: readonly LineKind[] = ["text", "tex", "text", "tex", "text", "tex"];

function textLine(content: string): AnalysisLine { return { kind: "text", content }; }
function texLine(content: string): AnalysisLine { return { kind: "tex", content }; }

/** Physical bit-boundary experiment for the opening prefix-code distinctions. */
export class DecodingDistinctionsScene implements Scene {
  readonly id = "c01-decoding";
  private title!: FormulaHandle;
  private readonly codewords: CodewordCard[] = [];
  private readonly strips: BitStrip[] = [];
  private analysisHeading!: FormulaHandle;
  private readonly analysisLines: AnalysisSlot[] = [];
  private readonly treeNodes: TreeNode[] = [];
  private readonly treeBranches: Polyline[] = [];
  private readonly parseBranches: Polyline[] = [];
  private readonly proofBranches: Polyline[] = [];
  private decodedWords!: FormulaHandle;
  private decodeMarker!: PanelMesh;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Can a bit string recover its message boundaries?", 960, 76, 41);
    this.createCodebook(d, "ambiguous", [["A", "0"], ["B", "01"], ["C", "10"]]);
    this.createCodebook(d, "prefix", [["A", "0"], ["B", "10"], ["C", "11"]]);
    this.strips.push(
      this.createStrip(d, "ac-parse", "RECEIVED BITS", [0, 1, 0], 430, [0], GREEN, ["A", "C"]),
      this.createStrip(d, "ba-parse", "SAME BITS", [0, 1, 0], 620, [1], RED, ["B", "A"]),
      this.createStrip(d, "forced-pairs", "0101", [0, 1, 0, 1], 420, [1], BLUE, ["01", "01"]),
      this.createStrip(d, "leftover-zero", "001", [0, 0, 1], 625, [0], ORANGE, ["0", "01"]),
      this.createStrip(d, "prefix-parse", "RECEIVED BITS", [0, 1, 0, 1, 1], 430, [0, 2], GREEN, ["A", "B", "C"]),
    );
    this.createTree(d);
    this.analysisHeading = d.text("THE BOUNDARY QUESTION", ANALYSIS_X, 188, 26, Palette.green);
    SLOT_KINDS.forEach((kind: LineKind, index: number): void => {
      const y = ANALYSIS_Y + index * ANALYSIS_STEP;
      const handle = kind === "text"
        ? d.text("", ANALYSIS_X, y, 26, Palette.text)
        : d.tex("", ANALYSIS_X, y, 26, Palette.text);
      this.analysisLines.push({ kind, handle });
    });
    this.decodedWords = d.text("", 565, 824, 30, Palette.green);
    this.decodeMarker=d.rectangle(510,468,18,18,Palette.yellow);
    this.decodeMarker.position.z=.05;
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    this.title.set({ opacity: c.p(0) });
    this.drawCodebook(c);
    this.drawStrips(c);
    this.drawTree(c);
    const frame = this.selectAnalysisFrame(c);
    this.analysisHeading.set({ opacity: c.p(0) });
    this.analysisHeading.setContent(frame.heading);
    this.analysisLines.forEach((slot: AnalysisSlot, index: number): void => {
      const line = frame.lines[index];
      slot.handle.set({ opacity: line.kind === slot.kind && line.content.length > 0 ? c.p(0) : 0 });
      slot.handle.setContent(line.kind === slot.kind ? line.content : "");
    });
  }

  teardown(_layers: SceneLayers): void {
    this.codewords.length = 0;
    this.strips.length = 0;
    this.analysisLines.length = 0;
    this.treeNodes.length = 0;
    this.treeBranches.length = 0;
    this.parseBranches.length = 0;
    this.proofBranches.length = 0;
  }

  private createCodebook(
    d: Diagram,
    set: CodeSet,
    entries: ReadonlyArray<readonly [string, string]>,
  ): void {
    const colors = [GREEN, BLUE, ORANGE];
    entries.forEach(([symbol, word], index): void => {
      const x = 265 + index * 245;
      this.codewords.push({
        set,
        symbol,
        word,
        mesh: d.rectangle(x, 252, 208, 72, colors[index]),
        label: d.text(`${symbol} = ${word}`, x, 252, 32, "#102237"),
      });
    });
  }

  private createStrip(
    d: Diagram,
    id: StripId,
    labelText: string,
    bits: readonly number[],
    y: number,
    boundaryAfter: readonly number[],
    boundaryColor: string,
    groups: readonly string[],
  ): BitStrip {
    const label = d.text(labelText, 185, y - 96, 23, Palette.muted);
    const cells: BitCell[] = [];
    const xAt = (index: number): number => RAW_X - ((bits.length - 1) * RAW_STEP) / 2 + index * RAW_STEP;
    bits.forEach((bit: number, index: number): void => {
      const x = xAt(index);
      cells.push({
        mesh: d.rectangle(x, y, 86, 76, bit === 0 ? BLUE : ORANGE),
        value: d.text(String(bit), x, y, 43, "#102237"),
        bit,
        index,
      });
    });
    const boundaries = boundaryAfter.map((after: number): Polyline => {
      const x = (xAt(after) + xAt(after + 1)) / 2;
      return d.line([[x, y - 53], [x, y + 53]], boundaryColor, 6);
    });
    const segmentLabels: SegmentLabel[] = [];
    let start = 0;
    const ends = [...boundaryAfter, bits.length - 1];
    ends.forEach((end: number, index: number): void => {
      const centerX = (xAt(start) + xAt(end)) / 2;
      segmentLabels.push({ startIndex: start, endIndex: end, handle: d.text(groups[index] ?? "", centerX, y + 91, 26, boundaryColor) });
      start = end + 1;
    });
    return { id, bits, y, label, cells, boundaries, boundaryAfter, boundaryColor, segmentLabels };
  }

  private createTree(d: Diagram): void {
    const specs: ReadonlyArray<Readonly<{ path: string; symbol: string | null; x: number; y: number }>> = [
      { path: "", symbol: null, x: 510, y: 510 },
      { path: "0", symbol: "A", x: 350, y: 620 },
      { path: "1", symbol: null, x: 690, y: 620 },
      { path: "00", symbol: null, x: 245, y: 752 },
      { path: "01", symbol: null, x: 425, y: 752 },
      { path: "10", symbol: "B", x: 610, y: 752 },
      { path: "11", symbol: "C", x: 790, y: 752 },
    ];
    specs.forEach((spec): void => {
      const color = spec.symbol === "A" ? GREEN : spec.symbol === "B" ? BLUE : spec.symbol === "C" ? ORANGE : Palette.panel;
      this.treeNodes.push({
        ...spec,
        mesh: d.rectangle(spec.x, spec.y, 100, 56, color),
        label: d.text(spec.symbol === null ? (spec.path || "ε") : `${spec.path} / ${spec.symbol}`, spec.x, spec.y, 23, Palette.text),
      });
    });
    const edges: ReadonlyArray<readonly [readonly [number, number], readonly [number, number]]> = [
      [[510, 538], [350, 592]], [[510, 538], [690, 592]],
      [[350, 648], [245, 724]], [[350, 648], [425, 724]],
      [[690, 648], [610, 724]], [[690, 648], [790, 724]],
    ];
    edges.forEach(([start, end]): void => {
      this.treeBranches.push(d.line([start, end], Palette.axis, 4));
    });
    const activeEdges: ReadonlyArray<readonly [readonly [number, number], readonly [number, number]]> = [
      [[510, 538], [350, 592]], [[510, 538], [690, 592]],
      [[690, 648], [610, 724]], [[690, 648], [790, 724]],
    ];
    activeEdges.forEach(([start, end], index): void => {
      this.parseBranches.push(d.line([start, end], [GREEN, GREEN, BLUE, ORANGE][index], 7));
    });
    this.proofBranches.push(
      d.line([[510, 538], [350, 592]], RED, 8),
      d.line([[350, 648], [425, 724]], RED, 8),
    );
  }

  private drawCodebook(c: Cues): void {
    this.codewords.forEach((card: CodewordCard): void => {
      let opacity = 0;
      if (card.set === "ambiguous") {
        const ab = Math.max(c.during(1, 20), c.during(31, 33));
        opacity = card.symbol === "C" ? Math.max(c.during(1, 13), c.during(32, 33)) : ab;
      } else {
        opacity = c.during(20, 31);
      }
      Diagram.show(card.mesh, opacity);
      card.label.set({ opacity });
    });
  }

  private drawStrips(c: Cues): void {
    const visibility: Readonly<Record<StripId, number>> = {
      "ac-parse": Math.max(c.during(0, 6), c.during(32, 33)),
      "ba-parse": Math.max(c.during(4, 6), c.during(32, 33)),
      "forced-pairs": Math.max(c.during(14, 19),c.during(31,32)),
      "leftover-zero": Math.max(c.during(16, 19),c.during(31,32)),
      "prefix-parse": c.during(21, 23),
    };
    this.strips.forEach((strip: BitStrip): void => {
      const visible = visibility[strip.id];
      const parseVisible = strip.id === "ac-parse" ? c.p(3)
        : strip.id === "ba-parse" ? c.p(4)
        : strip.id === "forced-pairs" ? c.p(15)
        : strip.id === "leftover-zero" ? c.p(16)
        : strip.id === "prefix-parse" ? c.p(22) : 0;
      strip.label.set({ opacity: visible });
      strip.cells.forEach((cell: BitCell): void => {
        Diagram.show(cell.mesh, visible);
        cell.value.set({ opacity: visible });
      });
      strip.boundaries.forEach((line: Polyline): void => line.setOpacity(visible * parseVisible));
      strip.segmentLabels.forEach((segment: SegmentLabel): void => segment.handle.set({ opacity: visible * parseVisible }));
    });
  }

  private drawTree(c: Cues): void {
    const treeVisible = Math.max(c.during(23, 31), c.during(33, 37));
    const proof = c.during(26, 28);
    const subtreeBlocked = c.during(34, 35);
    const restored = c.during(34, 37);
    const capacity = c.during(35, 37);
    this.treeBranches.forEach((line: Polyline, index: number): void => {
      const belowA = index === 2 || index === 3;
      const opacity = capacity > 0.5 && index >= 2
        ? 0
        : subtreeBlocked > 0.5 && belowA
          ? 0.85
          : proof > 0.5 && belowA
            ? 0.35
            : belowA && proof < 0.5
              ? 0
              : 1;
      line.setColor(subtreeBlocked > 0.5 && belowA ? RED : Palette.axis);
      line.setOpacity(treeVisible * opacity);
    });
    this.treeNodes.forEach((node: TreeNode): void => {
      let opacity = treeVisible;
      if (capacity > 0.5 && node.path.length === 2) opacity = 0;
      if ((node.path === "00" || node.path === "01") && proof < 0.5) opacity = 0;
      if (subtreeBlocked > 0.5 && (node.path === "00" || node.path === "01")) opacity = 0.9;
      const proofNode = node.path === "0" || node.path === "01";
      if (proof > 0.5 && proofNode) opacity = 1;
      if (proof > 0.5 && node.path === "0") {
        node.mesh.material.color.set(RED);
        node.label.setContent("u");
      } else if (proof > 0.5 && node.path === "01") {
        node.mesh.material.color.set(RED);
        node.label.setContent("uv");
      } else if (capacity > 0.5 && (node.path === "0" || node.path === "1")) {
        node.mesh.material.color.set(node.path === "0" ? GREEN : BLUE);
        node.label.setContent(`${node.path} / leaf`);
      } else if (subtreeBlocked > 0.5 && (node.path === "00" || node.path === "01")) {
        node.mesh.material.color.set(RED);
        node.label.setContent("blocked");
      } else {
        const color = node.symbol === "A" ? GREEN : node.symbol === "B" ? BLUE : node.symbol === "C" ? ORANGE : Palette.panel;
        node.mesh.material.color.set(color);
        node.label.setContent(node.symbol === null ? (node.path || "ε") : `${node.path} / ${node.symbol}`);
      }
      Diagram.show(node.mesh, opacity);
      node.label.set({ opacity, color: node.symbol!==null || (proof>0.5&&proofNode) || (subtreeBlocked>0.5&&(node.path==="00"||node.path==="01")) || (capacity>0.5&&node.path.length===1) ? "#102237" : Palette.text });
    });
    const walkProgress=Math.max(0,Math.min(1,(c.t-c.s(23))/Math.max(.1,c.e(24)-c.s(23))));
    const walkStep=Math.min(8,Math.floor(walkProgress*9));
    const activeNode=this.treeNodes[[0,1,0,2,5,0,2,6,0][walkStep]];
    this.decodeMarker.position.set((activeNode.x-960)/100,(540-activeNode.y+42)/100,.05);
    Diagram.show(this.decodeMarker,c.during(23,25));
    const activeEdge=[-1,0,-1,1,2,-1,1,3,-1][walkStep];
    this.parseBranches.forEach((line: Polyline, index: number): void => {
      const walking=c.during(23,25)*(activeEdge===index?1:0);
      const treeRestored=restored*(capacity>.5&&index>=2?0:index===0||index===1?.45:.3);
      line.setOpacity(Math.max(walking,treeRestored));
    });
    this.decodedWords.set({opacity:c.during(23,25)});
    this.decodedWords.setContent(["","A","A","A","A → B","A → B","A → B","A → B → C","A → B → C"][walkStep]);
    this.proofBranches.forEach((line: Polyline, index: number): void => line.setOpacity(proof * (index === 0 ? 0.8 : 1)));
  }

  private selectAnalysisFrame(c: Cues): AnalysisFrame {
    if (c.t < c.s(3)) return { heading: "WHAT MESSAGE DID YOU RECEIVE?", lines: [textLine("The three bits arrive without separators."), texLine("010"), textLine("Which codewords produced this string?"), texLine(""), textLine(""), texLine("")] };
    if (c.t < c.s(4)) return { heading: "ONE POSSIBLE PARSING", lines: [textLine("Read the first bit as A."), texLine("010=0\\mid10"), textLine("Then read the last two bits as C."), texLine("A\\mid C"), textLine(""), texLine("")] };
    if (c.t < c.s(5)) return { heading: "A SECOND PARSING", lines: [textLine("Or take the first two bits as B."), texLine("010=01\\mid0"), textLine("The last bit is A."), texLine("B\\mid A"), textLine(""), texLine("")] };
    if (c.t < c.s(6)) return { heading: "SAME BITS, DIFFERENT MESSAGES", lines: [textLine("Both parses use valid codewords."), texLine("A,C\\ne B,A"), textLine("The missing boundaries caused ambiguity."), texLine(""), textLine(""), texLine("")] };
    if (c.t < c.s(8)) return { heading: "A FINITE NONEMPTY CODE", lines: [textLine("A code assigns a finite word per symbol."), texLine("w(a)\\ne\\epsilon"), textLine("Different symbols can still share labels."), texLine(""), textLine(""), texLine("")] };
    if (c.t < c.s(10)) return { heading: "ONE-SYMBOL VERSUS SEQUENCE", lines: [textLine("Nonsingular: different symbols, different words."), texLine("a\\ne b\\Rightarrow w(a)\\ne w(b)"), textLine("Concatenation erases word boundaries."), texLine("w(a_1\\ldots a_k)=w(a_1)\\cdots w(a_k)"), textLine(""), texLine("")] };
    if (c.t < c.s(13)) return { heading: "UNIQUE DECODABILITY", lines: [textLine("Every valid encoded string has one parsing."), texLine("w(a_1\\ldots a_k)=w(b_1\\ldots b_m)"), textLine("must imply identical source sequences."), texLine(""), textLine("This code is nonsingular but fails that test."), texLine("")] };
    if (c.t < c.s(15)) return { heading: "REMOVE C; TRY 0101", lines: [textLine("Now the codewords are 0 and 01."), texLine("0\\text{ is a prefix of }01"), textLine("Is this smaller code still ambiguous?"), texLine(""), textLine("The four bits remain unseparated for now."), texLine("")] };
    if (c.t < c.s(17)) return { heading: "PAIR EACH ONE WITH ITS PRECEDING ZERO", lines: [textLine("Every 1 must pair with the zero before it."), texLine("0101=01\\mid01"), textLine("Pairs cannot overlap."), texLine("001=0\\mid01"), textLine("A leftover zero is its own word."), texLine("")] };
    if (c.t < c.s(19)) return { heading: "FORCED BOUNDARIES; NO PREFIX PROPERTY", lines: [textLine("The pairing rule recovers every boundary."), texLine("\\{0,01\\}\\text{ is uniquely decodable}"), textLine("Yet 0 is a prefix of 01."), texLine(""), textLine("So unique decoding need not be prefix-free."), texLine("")] };
    if (c.t < c.s(20)) return { heading: "WHAT DOES PREFIX-FREE REQUIRE?", lines: [textLine("No word begins a different codeword."),texLine("u\\ne v\\quad\\Rightarrow\\quad u\\not\\prec v"),textLine("The shorter word must not end inside another."),texLine(""),textLine("We can choose a new set of labels."),texLine("")] };
    if (c.t < c.s(21)) return { heading: "REPAIR THE CODEBOOK", lines: [textLine("Choose A=0, B=10 and C=11."), texLine("\\mathcal C=\\{0,10,11\\}"), textLine("Now each word ends at a leaf."), texLine(""), textLine("Read the next five bits."), texLine("")] };
    if (c.t < c.s(22)) return { heading: "WHERE CAN THE DECODER STOP?", lines: [textLine("Read 01011 from left to right."), texLine("01011"), textLine("No boundary is marked yet."), texLine(""), textLine("The codebook is prefix-free."), texLine("")] };
    if (c.t < c.s(23)) return { heading: "THE BOUNDARIES ARE FORCED", lines: [textLine("A is followed by B, then C."), texLine("01011=0\\mid10\\mid11"), textLine("Each segment is a codeword."), texLine("A\\mid B\\mid C"), textLine(""), texLine("")] };
    if (c.t < c.s(25)) return { heading: "WALK THE DECODING TREE", lines: [textLine("Each bit selects its matching branch."), texLine("0\\to A,\\quad10\\to B,\\quad11\\to C"), textLine("At a leaf, output its symbol."), texLine(""), textLine("Then restart from the root."), texLine("")] };
    if (c.t < c.s(26)) return { heading: "WHY CAN'T TWO PARSES OCCUR?", lines: [textLine("Compare the first words of two parses."), texLine(""), textLine("Could their boundaries differ?"), texLine(""), textLine(""), texLine("")] };
    if (c.t < c.s(28)) return { heading: "THE FIRST WORD IS FORCED", lines: [textLine("If one ends first, it prefixes the other."), texLine("u\\prec uv"), textLine("Prefix-free forbids that branch below a leaf."), texLine(""), textLine("Remove the forced first word; repeat."), texLine("")] };
    if (c.t < c.s(30)) return { heading: "THE FORWARD IMPLICATIONS", lines: [textLine("A prefix code has one parsing."), texLine("\\text{prefix-free}\\Rightarrow\\text{uniquely decodable}"), textLine("Unique decoding separates one-symbol words."), texLine("\\text{uniquely decodable}\\Rightarrow\\text{nonsingular}"), textLine(""), texLine("")] };
    if (c.t < c.s(31)) return { heading: "THE REVERSE IMPLICATIONS FAIL", lines: [textLine("The examples show both failed converses."), texLine(""), textLine("Unique decoding need not be prefix-free."), texLine(""), textLine("Nonsingularity need not give unique decoding."), texLine("")] };
    if (c.t < c.s(32)) return { heading: "UNIQUE BUT NOT PREFIX-FREE", lines: [textLine("Use the two words 0 and 01."), texLine("0101=01\\mid01"), textLine("Forced pairs give the only parsing."), texLine("0\\prec01"), textLine(""), texLine("")] };
    if (c.t < c.s(33)) return { heading: "NONSINGULAR BUT AMBIGUOUS", lines: [textLine("Add the distinct word 10."), texLine("\\{0,01,10\\}"), textLine("The string 010 has two parses."), texLine("0\\mid10=01\\mid0"), textLine(""), texLine("")] };
    if (c.t < c.s(34)) return { heading: "ONE PROPERTY IS BROADER", lines: [textLine("Prefix codewords give immediate boundaries."), texLine("\\text{prefix-free}\\Rightarrow\\text{uniquely decodable}"), textLine("Unique decodability allows non-prefix words."), texLine(""), textLine(""), texLine("")] };
    if (c.t < c.s(35)) return { heading: "A SHORT WORD BLOCKS ITS SUBTREE", lines: [textLine("A leaf leaves no descendant codeword below it."), texLine("0\\text{ blocks }00,01"), textLine("Return to the prefix tree."), texLine(""), textLine(""), texLine("")] };
    if (c.t < c.s(36)) return { heading: "ONLY TWO ONE-BIT WORDS FIT", lines: [textLine("The root has only two first-level branches."), texLine("\\text{At most two codewords have length }1"), textLine("Three one-bit words cannot all be distinct."), texLine(""), textLine(""), texLine("")] };
    return { heading: "KRAFT'S TREE-SPACE BUDGET", lines: [textLine("Short leaves consume more of the tree."), texLine("\\sum_i 2^{-\\ell_i}\\le1"), textLine("The full length budget follows next."), texLine(""), textLine(""), texLine("")] };
  }
}

export function decodingDistinctionsScene(): Scene {
  return new DecodingDistinctionsScene();
}
