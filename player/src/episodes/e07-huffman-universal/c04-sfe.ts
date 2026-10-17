import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface IntervalVisual {
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
  readonly start: number;
  readonly end: number;
}

interface MidpointMark {
  readonly line: Polyline;
  readonly label: FormulaHandle;
}

export class SfeIntervalScene implements Scene {
  readonly id = "c04-sfe";
  private title!: FormulaHandle;
  private genericSource!: PanelMesh;
  private genericCell!: PanelMesh;
  private genericSourceLabel!: FormulaHandle;
  private genericCellLabel!: FormulaHandle;
  private genericMidpoint!: Polyline;
  private genericMidpointLabel!: FormulaHandle;
  private genericHint!: FormulaHandle;
  private sourceAxis!: Polyline;
  private cellAxis!: Polyline;
  private readonly sourceIntervals: IntervalVisual[] = [];
  private readonly codeCells: IntervalVisual[] = [];
  private readonly midpoints: MidpointMark[] = [];
  private readonly codewords: FormulaHandle[] = [];
  private readonly rowHeadings: FormulaHandle[] = [];
  private proof!: FormulaHandle;
  private result!: FormulaHandle;
  private lengthsLabel!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A midpoint selects a dyadic cell inside each source interval", 960, 100, 42);
    const xAt = (u: number): number => 260 + 1400 * u;
    this.genericSource = d.rectangle(xAt(0.5), 385, 700, 74, Palette.blue);
    this.genericCell = d.rectangle(xAt(0.625), 610, 350, 58, Palette.green);
    this.genericSourceLabel = d.tex("S_i=[F_{i-1},F_i)", xAt(0.5), 385, 30, "#10141b");
    this.genericCellLabel = d.tex("C_i", xAt(0.625), 610, 30, "#10141b");
    this.genericMidpoint = d.line([[xAt(0.5), 325], [xAt(0.5), 700]], Palette.orange, 4);
    this.genericMidpointLabel = d.tex("m_i=F_{i-1}+p_i/2", xAt(0.5), 300, 29, Palette.orange);
    this.genericHint = d.text("In this valid placement, the midpoint is the cell's left edge", 960, 700, 26, Palette.muted);

    this.sourceAxis = d.line([[260, 430], [1660, 430]], Palette.axis, 2);
    this.cellAxis = d.line([[260, 650], [1660, 650]], Palette.axis, 2);
    this.rowHeadings.push(
      d.text("SOURCE INTERVALS", 155, 385, 23, Palette.blue),
      d.text("DYADIC CELLS", 155, 610, 23, Palette.green),
    );
    const colors = [Palette.blue, Palette.orange, Palette.purple];
    const sourceData: ReadonlyArray<readonly [number, number, string]> = [
      [0, 0.5, "A  [0, 1/2)"],
      [0.5, 0.75, "B  [1/2, 3/4)"],
      [0.75, 1, "C  [3/4, 1)"],
    ];
    const cellData: ReadonlyArray<readonly [number, number, string]> = [
      [0.25, 0.5, "A  [1/4, 1/2)"],
      [0.625, 0.75, "B  [5/8, 3/4)"],
      [0.875, 1, "C  [7/8, 1)"],
    ];
    for (let i = 0; i < 3; i++) {
      const [sourceStart, sourceEnd, sourceText] = sourceData[i];
      const [cellStart, cellEnd, cellText] = cellData[i];
      const sourceX = xAt((sourceStart + sourceEnd) / 2);
      const cellX = xAt((cellStart + cellEnd) / 2);
      this.sourceIntervals.push({
        mesh: d.rectangle(sourceX, 430, (sourceEnd - sourceStart) * 1400, 74, colors[i]),
        label: d.text(sourceText, sourceX, 430, 26, "#10141b"),
        start: sourceStart,
        end: sourceEnd,
      });
      this.codeCells.push({
        mesh: d.rectangle(cellX, 650, (cellEnd - cellStart) * 1400, 58, colors[i]),
        label: d.text(cellText, cellX, 650, 24, "#10141b"),
        start: cellStart,
        end: cellEnd,
      });
      const midpoint = [0.25, 0.625, 0.875][i];
      const x = xAt(midpoint);
      this.midpoints.push({
        line: d.line([[x, 330], [x, 700]], Palette.yellow, 3),
        label: d.text(["m₁=.25", "m₂=.625", "m₃=.875"][i], x, 335, 23, Palette.yellow),
      });
      this.codewords.push(d.tex(["01", "101", "111"][i], cellX, 710, 27, Palette.yellow));
    }
    this.proof = d.tex("S_i=[F_{i-1},F_i),\\quad m_i=F_{i-1}+p_i/2", 960, 735, 33, Palette.yellow);
    this.result = d.tex("H\\le L<H+2", 960, 785, 37, Palette.green);
    this.lengthsLabel = d.tex("\\ell=(2,3,3)", 960, 755, 28, Palette.yellow);
    this.note = d.text("Positive-probability symbols only; interval endpoints are half-open", 960, 825, 23, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const general = c.during(0, 30);
    const example = c.p(30);
    const conclusion = c.p(35);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(example > 0.5 ? "The midpoint code fits each dyadic cell inside its source interval" : c.p(15) > 0.5 ? "Disjoint cells rule out the prefix relation" : ctx.localTime<c.s(11)?"Can one extra bit keep the entire cell inside?":"A midpoint selects a dyadic cell inside each source interval");

    Diagram.show(this.genericSource, general);
    Diagram.show(this.genericCell, c.p(6) * general);
    this.genericSourceLabel.set({ opacity: general });
    this.genericCellLabel.set({ opacity: c.p(6) * general });
    this.genericMidpoint.setOpacity(c.p(3) * general);
    this.genericMidpointLabel.set({ opacity: c.p(3) * general });
    this.genericHint.set({ opacity: c.p(8) * general });
    this.sourceAxis.setOpacity(example);
    this.cellAxis.setOpacity(example);
    this.rowHeadings.forEach((heading: FormulaHandle): void => heading.set({ opacity: example }));
    this.sourceIntervals.forEach((interval: IntervalVisual): void => {
      Diagram.show(interval.mesh, example);
      interval.label.set({ opacity: example });
    });
    this.codeCells.forEach((interval: IntervalVisual): void => {
      Diagram.show(interval.mesh, c.p(32));
      interval.label.set({ opacity: c.p(34) });
    });
    this.midpoints.forEach((mark: MidpointMark, i: number): void => {
      mark.line.setOpacity(c.p(30));
      mark.label.set({ opacity: c.p(30) });
      mark.label.setContent(ctx.localTime >= c.s(31) ? ["m₁=.25=0.01…", "m₂=.625=0.101…", "m₃=.875=0.111…"][i] : ["m₁=.25", "m₂=.625", "m₃=.875"][i]);
    });
    this.codewords.forEach((word: FormulaHandle): void => word.set({ opacity: c.p(33) }));

    this.proof.set({ opacity: general, x: 960, y: 735, scale: 1 });
    this.proof.setContent(this.proofAt(c, ctx.localTime));
    this.result.set({ opacity: Math.max(c.p(19) * general, conclusion), x: 960, y: 785, scale: 1 });
    this.result.setContent(ctx.localTime >= c.s(35) ? "L=2.5\\quad H=1.5\\quad\\text{bits/symbol}" : ctx.localTime >= c.s(21) ? "H\\le L<H+2" : ctx.localTime >= c.s(20) ? "H\\le L" : "L<H+2");
    this.lengthsLabel.set({ opacity: c.p(32) * (1 - conclusion), y: 755 });
    this.note.set({ opacity: Math.max(c.p(24) * general, example), y: 825 });
    this.note.setContent(example > 0.5
      ? ctx.localTime >= c.s(33) ? "codewords = (01, 101, 111)" : "midpoints = (.25, .625, .875)"
      : "The terminating expansion is used at dyadic midpoints");
    if (conclusion > 0.5) this.title.setContent("SFE is prefix-free with average length below H plus two bits");
  }

  teardown(_layers: SceneLayers): void {
    this.sourceIntervals.length = 0;
    this.codeCells.length = 0;
    this.midpoints.length = 0;
    this.codewords.length = 0;
    this.rowHeadings.length = 0;
  }

  private proofAt(cues: Cues, time: number): string {
    if (time >= cues.s(17)) return "-\\log_2p_i+1\\le\\ell_i<-\\log_2p_i+2";
    if (time >= cues.s(15)) return "C_i\\cap C_j=\\varnothing\\;\\Rightarrow\\;\\text{no codeword prefixes another}";
    if (time >= cues.s(13)) return "S_i\\cap S_j=\\varnothing\\;\\Rightarrow\\;C_i\\cap C_j=\\varnothing";
    if (time >= cues.s(11)) return "2^{-\\ell_i}\\le p_i/2\\;\\quad C_i\\subseteq S_i";
    if (time >= cues.s(9)) return "|endpoint-m_i|\\le2^{-\\ell_i}\\le p_i/2";
    if (time >= cues.s(7)) return "2^{-\\ell_i}\\le p_i/2";
    if (time >= cues.s(6)) return "|C_i|=2^{-\\ell_i}";
    if (time >= cues.s(4)) return "\\ell_i=\\lceil-\\log_2p_i\\rceil+1";
    if (time >= cues.s(3)) return "m_i=F_{i-1}+p_i/2";
    return "S_i=[F_{i-1},F_i),\\quad |S_i|=p_i";
  }
}

export function sfeIntervalScene(): Scene {
  return new SfeIntervalScene();
}
