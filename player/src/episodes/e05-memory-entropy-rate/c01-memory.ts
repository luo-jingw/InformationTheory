import { Vector3 } from "three";
import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Polyline } from "../../primitives/Polyline";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

type SourceId = "A" | "B" | "C";
type AnalysisLineKind = "text" | "tex";

interface BitTile {
  readonly card: PanelMesh;
  readonly value: FormulaHandle;
  readonly bit: number;
  readonly index: number;
}

interface SourceRow {
  readonly id: SourceId;
  readonly title: FormulaHandle;
  readonly bits: readonly number[];
  readonly tiles: readonly BitTile[];
}

interface AnalysisLine {
  readonly kind: AnalysisLineKind;
  readonly content: string;
}

interface AnalysisFrame {
  readonly heading: string;
  readonly lines: readonly AnalysisLine[];
}

interface AnalysisSlot {
  readonly kind: AnalysisLineKind;
  readonly handle: FormulaHandle;
}

const BLUE = "#67aef5";
const ORANGE = "#f5ad62";
const HIDDEN = "#586276";
const LEFT_CARD_X = 190;
const CARD_STEP = 96;
const ANALYSIS_X = 1455;
const LINE_Y = 272;
const LINE_STEP = 78;
const ANALYSIS_SLOT_KINDS: readonly AnalysisLineKind[] = ["text", "tex", "text", "tex", "text", "tex", "text"];

function textLine(content: string): AnalysisLine {
  return { kind: "text", content };
}

function formulaLine(content: string): AnalysisLine {
  return { kind: "tex", content };
}

/** Three stationary source laws contrasted through one next-symbol experiment. */
export class MemoryComparisonScene implements Scene {
  readonly id = "c01-memory";
  private title!: FormulaHandle;
  private readonly rows: SourceRow[] = [];
  private analysisHeading!: FormulaHandle;
  private readonly analysisLines: AnalysisSlot[] = [];
  private windowMarker!: FormulaHandle;
  private readonly windowFrame: Polyline[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Would you pay for the next bit?", 960, 82, 43);
    const definitions: ReadonlyArray<readonly [SourceId, string, readonly number[]]> = [
      ["A", "A · fresh fair coin each time", [0, 1, 1, 0, 1, 0, 0, 1]],
      ["B", "B · one fair bit, copied forever", [1, 1, 1, 1, 1, 1, 1, 1]],
      ["C", "C · fair first bit, then alternate", [1, 0, 1, 0, 1, 0, 1, 0]],
    ];
    for (const [id, name, bits] of definitions) {
      const title = d.text(name, 525, 200, 28, id === "A" ? BLUE : id === "B" ? Palette.purple : Palette.green);
      const tiles: BitTile[] = [];
      bits.forEach((bit: number, index: number): void => {
        const x = LEFT_CARD_X + CARD_STEP * index;
        const card = d.rectangle(x, 270, 74, 64, bit === 0 ? BLUE : ORANGE);
        const value = d.text(String(bit), x, 270, 34, Palette.text);
        tiles.push({ card, value, bit, index });
      });
      this.rows.push({ id, title, bits, tiles });
    }
    this.analysisHeading = d.text("THREE SOURCE RULES", ANALYSIS_X, 177, 26, Palette.green);
    ANALYSIS_SLOT_KINDS.forEach((kind: AnalysisLineKind, index: number): void => {
      const y = LINE_Y + index * LINE_STEP;
      const handle = kind === "text"
        ? d.text("", ANALYSIS_X, y, 26, Palette.text)
        : d.tex("", ANALYSIS_X, y, 26, Palette.text);
      this.analysisLines.push({ kind, handle });
    });
    this.windowMarker = d.text("SIX-BIT WINDOW", LEFT_CARD_X + CARD_STEP * 2.5, 744, 22, Palette.green);
    for (let index = 0; index < 4; index++) {
      this.windowFrame.push(d.line([[153, 636], [707, 636]], Palette.green, 4));
    }
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const cVisible = c.p(22, 1.1);
    const moveToThreeRows = cVisible;
    this.title.set({ opacity: c.p(0) });

    const rowStates: ReadonlyArray<Readonly<{ y: number; opacity: number; revealAt: number }>> = [
      { y: 350 + (255 - 350) * moveToThreeRows, opacity: c.p(1), revealAt: 3 },
      { y: 615 + (465 - 615) * moveToThreeRows, opacity: c.p(2), revealAt: 3 },
      { y: 675, opacity: cVisible, revealAt: 22 },
    ];
    this.rows.forEach((row: SourceRow, rowIndex: number): void => {
      const state = rowStates[rowIndex];
      const rowY = state.y;
      row.title.set({ x: 525, y: rowY - 66, opacity: state.opacity });
      row.tiles.forEach((tile: BitTile): void => {
        const x = LEFT_CARD_X + CARD_STEP * tile.index;
        const sampleVisible = c.p(state.revealAt, 0.8);
        const revealLastAt = row.id === "A" ? 11 : row.id === "B" ? 6 : 25;
        const lastBitVisible = tile.index === 7 ? c.p(revealLastAt, 0.7) : sampleVisible;
        const visible = state.opacity * sampleVisible;
        tile.card.position.set((x - 960) / 100, (540 - rowY) / 100, 0);
        tile.card.material.color.set(tile.index === 7 && lastBitVisible < 0.5
          ? HIDDEN
          : tile.bit === 0 ? BLUE : ORANGE);
        Diagram.show(tile.card, visible);
        tile.value.set({ x, y: rowY, opacity: visible, color: tile.index === 7 && lastBitVisible < 0.5 ? Palette.text : "#102237" });
        tile.value.setContent(tile.index === 7 && lastBitVisible < 0.5 ? "?" : String(tile.bit));
      });
    });

    const windowProgress = c.over(33, 0, 1);
    const windowShift = windowProgress;
    const windowLeft = LEFT_CARD_X + CARD_STEP * windowShift - 37;
    const windowRight = LEFT_CARD_X + CARD_STEP * (5 + windowShift) + 37;
    const windowTop = 675 - 39;
    const windowBottom = 675 + 39;
    const framePoints: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
      [[windowLeft, windowTop], [windowRight, windowTop]],
      [[windowLeft, windowBottom], [windowRight, windowBottom]],
      [[windowLeft, windowTop], [windowLeft, windowBottom]],
      [[windowRight, windowTop], [windowRight, windowBottom]],
    ];
    this.windowFrame.forEach((line: Polyline, index: number): void => {
      const points = framePoints[index].map(([x, y]): Vector3 => new Vector3((x - 960) / 100, (540 - y) / 100, 0));
      line.setPoints(points);
      line.setOpacity(c.p(33));
    });
    this.windowMarker.set({
      x: LEFT_CARD_X + CARD_STEP * (2.5 + windowProgress),
      y: 744,
      opacity: c.p(33),
    });

    const frame = this.selectAnalysisFrame(c);
    this.analysisHeading.set({ opacity: frame === null ? 0 : 1 });
    this.analysisHeading.setContent(frame?.heading ?? "");
    this.analysisLines.forEach((slot: AnalysisSlot, index: number): void => {
      const line = frame?.lines[index] ?? { kind: slot.kind, content: "" };
      const matchesKind = line.kind === slot.kind;
      slot.handle.set({ opacity: matchesKind && line.content.length > 0 ? 1 : 0 });
      slot.handle.setContent(matchesKind ? line.content : "");
    });
  }

  teardown(_layers: SceneLayers): void {
    this.rows.length = 0;
    this.analysisLines.length = 0;
    this.windowFrame.length = 0;
  }

  private selectAnalysisFrame(c: Cues): AnalysisFrame | null {
    if (c.t < c.s(3)) {
      return {
        heading: "TWO MACHINE RULES",
        lines: [textLine(c.t >= c.s(1) ? "A: a fresh fair bit each step." : ""), formulaLine(""), textLine(c.t >= c.s(2) ? "B: draw once, then copy forever." : ""), formulaLine(""), textLine("Each row is one possible run."), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(5)) {
      return {
        heading: "PREDICT THE HIDDEN EIGHTH BIT",
        lines: [textLine("A: next bit ?"), formulaLine(""), textLine("B: next bit ?"), formulaLine(""), textLine("Use the seven visible past bits."), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(6)) {
      return {
        heading: "A STILL HAS TWO POSSIBLE NEXT BITS",
        lines: [textLine("A has not revealed a fixed outcome."), formulaLine("P_A(X_8=0\\mid X^7=x^7)=\\frac12"), textLine("or"), formulaLine("P_A(X_8=1\\mid X^7=x^7)=\\frac12"), textLine("Both remain possible."), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(7)) {
      return {
        heading: "B'S DISPLAYED PATH IS FORCED",
        lines: [textLine("For this shown run:"), formulaLine("x_1=1\\;\\Longrightarrow\\;x_8=x_1=1"), textLine("This is one possible B run."), formulaLine(""), textLine("The initial bit was still fair."), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(11)) {
      return {
        heading: "SAME MARGINAL, DIFFERENT MEMORY",
        lines: [textLine("A: at every fixed time,"), formulaLine("P_A(X_t=0)=P_A(X_t=1)=\\frac12"), textLine("B: also at every fixed time,"), formulaLine("P_B(X_t=0)=P_B(X_t=1)=\\frac12"), textLine("Both marginal entropies are one bit."), formulaLine("H_A(X_t)=H_B(X_t)=1\\text{ bit}"), textLine("B's all-1 row is one run, not its marginal law.")],
      };
    }
    if (c.t < c.s(12)) {
      return {
        heading: "A ADDS ONE BIT AFTER THE PAST",
        lines: [textLine("A draws a fresh fair bit each time."), formulaLine("H_A(X_i\\mid X^{i-1})=1\\text{ bit}"), textLine("B repeats the observed first bit."), formulaLine(""), textLine(""), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(13)) {
      return {
        heading: "B ADDS NO BIT AFTER ITS FIRST",
        lines: [textLine("A adds one bit at every step."), formulaLine("H_A(X_i\\mid X^{i-1})=1\\text{ bit}"), textLine("B is determined after its first bit."), formulaLine("H_B(X_i\\mid X^{i-1})=0,\\quad i>1"), textLine("The first B bit contributes one bit."), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(14)) {
      return {
        heading: "ADD CONDITIONAL ENTROPIES",
        lines: [textLine("The chain rule sums stepwise uncertainty."), formulaLine("H(X^n)=\\sum_{i=1}^{n}H(X_i\\mid X^{i-1})"), textLine("A adds one bit at every step."), formulaLine(""), textLine("B adds uncertainty only at its first bit."), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(16)) {
      return {
        heading: "BLOCK ENTROPY",
        lines: [textLine("A: n independent fair bits."), formulaLine("H_A(X^n)=n\\text{ bits}"), textLine(c.t >= c.s(15) ? "B: one fair initial bit is copied." : ""), formulaLine(c.t >= c.s(15) ? "H_B(X^n)=1\\text{ bit},\\quad n\\ge1" : ""), textLine(""), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(18)) {
      return {
        heading: "POSSIBLE BLOCKS AND PROBABILITIES",
        lines: [textLine("B has only the all-zero or all-one block."), formulaLine("P_B(0^n)=P_B(1^n)=\\frac12"), textLine(c.t >= c.s(17) ? "Every A block has the same probability." : ""), formulaLine(c.t >= c.s(17) ? "P_A(x^n)=2^{-n}" : ""), textLine(""), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(19)) {
      return {
        heading: "BLOCK SURPRISAL",
        lines: [textLine("Negative log probability gives the block cost."), formulaLine("-\\log_2 P_A(X^n)=n\\text{ bits}"), textLine(""), formulaLine("-\\log_2 P_B(X^n)=1\\text{ bit}"), textLine(""), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(22)) {
      return {
        heading: "FROM BLOCK COST TO ENTROPY RATE",
        lines: [textLine("Divide block entropy by its length."), formulaLine("H_A(X^n)/n=1\\text{ bit per symbol}"), textLine(""), formulaLine("H_B(X^n)/n=1/n\\to0"), textLine(c.t >= c.s(20) ? "The limit defines entropy rate." : ""), formulaLine(c.t >= c.s(20) ? "\\bar H=\\lim_{n\\to\\infty}H(X^n)/n" : ""), textLine("New information per symbol over a long run.")],
      };
    }
    if (c.t < c.s(25)) {
      return {
        heading: "PREDICT C'S HIDDEN NEXT BIT",
        lines: [textLine("C starts fair, then flips the prior bit."), formulaLine("X_i=1-X_{i-1}"), textLine("Its visible output alternates."), formulaLine(""), textLine(c.t < c.s(24) ? "Does change guarantee fresh information?" : "What follows after the seven visible bits?"), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(26)) {
      return {
        heading: "THE ALTERNATING NEXT BIT IS FORCED",
        lines: [textLine("Given the displayed history,"), formulaLine("x_8=1-x_7=0"), textLine("Only two phases occur."), formulaLine("P_C(101010\\ldots)=\\frac12"), textLine("and"), formulaLine("P_C(010101\\ldots)=\\frac12"), textLine("")],
      };
    }
    if (c.t < c.s(28)) {
      return {
        heading: "C CHANGES, BUT ADDS NO RATE",
        lines: [textLine("There are only two length-n blocks."), formulaLine("H_C(X^n)=1\\text{ bit},\\quad n\\ge1"), textLine("So its entropy rate is zero."), formulaLine("\\bar H_C=0"), textLine(c.t >= c.s(27) ? "A changing signal can be predictable." : ""), formulaLine(""), textLine("")],
      };
    }
    if (c.t < c.s(31)) {
      return {
        heading: "ALL THREE HAVE FAIR MARGINALS",
        lines: [textLine("At each fixed time, for A, B and C:"), formulaLine("P(X_t=0)=P(X_t=1)=\\frac12"), textLine("Only A adds a bit of uncertainty per step."), formulaLine("H_A(X_t\\mid X^{t-1})=1"), textLine("B's all-1 row is one run, not a frequency law."), formulaLine(""), textLine("B copies; C alternates: distinct dependence.")],
      };
    }
    if (c.t < c.s(33)) {
      return {
        heading: "STATIONARITY FROM FAIR INITIAL PHASES",
        lines: [textLine("A is IID; its block laws are shift-invariant."), formulaLine(""), textLine("B's two constant paths each have probability 1/2."), formulaLine(""), textLine("C's two alternating phases each have probability 1/2."), formulaLine(""), textLine("Stationarity need not mean dependence vanishes.")],
      };
    }
    if (c.t < c.s(34)) {
      return {
        heading: "SHIFT THE SIX-BIT WINDOW ONE PLACE",
        lines: [textLine("The window shows the two possible phases:"), formulaLine("P_C(X_1^6=101010)=\\frac12"), textLine("and"), formulaLine("P_C(X_1^6=010101)=\\frac12"), textLine("A one-step shift exchanges the phases."), formulaLine(""), textLine("The finite-block law stays unchanged.")],
      };
    }
    return {
      heading: "ENTROPY RATE UNDER STATIONARITY",
      lines: [textLine("Finite-alphabet stationarity guarantees a rate limit."), formulaLine(""), textLine("It does not assert mixing or independence."), formulaLine(""), textLine("Next: prove the limit exists."), formulaLine(""), textLine("")],
    };
  }
}

export function memoryComparisonScene(): Scene {
  return new MemoryComparisonScene();
}
