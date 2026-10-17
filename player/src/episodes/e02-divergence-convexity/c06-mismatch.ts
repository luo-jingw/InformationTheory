import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class CodingMismatchScene implements Scene {
  readonly id = "c06-mismatch";
  private title!: FormulaHandle;
  private readonly lengthBars: PanelMesh[] = [];
  private readonly lengthLabels: FormulaHandle[] = [];
  private readonly lengths: FormulaHandle[] = [];
  private readonly proof: ProofLine[] = [];
  private baseline!: FormulaHandle;
  private readonly costSegments: PanelMesh[] = [];
  private readonly costLabels: FormulaHandle[] = [];
  private readonly cells: PanelMesh[] = [];
  private readonly cellValues: FormulaHandle[] = [];
  private readonly tableLabels: FormulaHandle[] = [];
  private readonly conditionalProof: ProofLine[] = [];
  private result!: FormulaHandle;
  private note!: FormulaHandle;
  private readonly callback: FormulaHandle[] = [];

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A wrong probability model has a measurable cost", 960, 100, 47);
    for (let i = 0; i < 4; i++) { const x = 240 + i * 170; this.lengthBars.push(d.rectangle(x, 620, 105, 1, i % 2 === 0 ? Palette.blue : Palette.purple)); this.lengthLabels.push(d.tex(i % 2 === 0 ? `-\\log_2p_${Math.floor(i / 2)}` : `-\\log_2q_${Math.floor(i / 2)}`, x, 680, 29, i % 2 === 0 ? Palette.blue : Palette.purple)); this.lengths.push(d.text("", x, 350, 33)); }
    const proof: ReadonlyArray<readonly [string, number]> = [
      ["\\ell_Q(x)=-\\log_2q_x\\quad\\text{real-valued ideal length}", 2],
      ["\\mathbb E_P\\ell_Q=\\sum_xp_x[-\\log_2q_x]", 5],
      ["=\\sum_xp_x[-\\log_2p_x+\\log_2(p_x/q_x)]", 6],
      ["=H(P)+D(P\\Vert Q)", 9],
    ];
    for (let i = 0; i < proof.length; i++) this.proof.push({label: d.tex(proof[i][0], 1330, 265 + i * 145, i === 0 || i === 2 ? 30 : 37, i === 3 ? Palette.yellow : Palette.text), sentence: proof[i][1]});
    this.baseline = d.tex("P=(0.8,0.2),\\quad Q=(0.5,0.5)", 520, 260, 35, Palette.text);
    this.costSegments.push(d.rectangle(250 + 0.721928 * 650 / 2, 785, 0.721928 * 650, 35, Palette.blue), d.rectangle(250 + (0.721928 + 0.278072 / 2) * 650, 785, 0.278072 * 650, 35, Palette.orange));
    this.costLabels.push(d.tex("H(P)=0.721928", 490, 745, 31, Palette.blue), d.tex("D=0.278072", 830, 745, 31, Palette.orange));
    for (let group = 0; group < 2; group++) {
      const x0 = group === 0 ? 225 : 620;
      this.tableLabels.push(d.tex(group === 0 ? "P_{XY}" : "Q_{XY}", x0 + 65, 250, 36, group === 0 ? Palette.blue : Palette.purple));
      for (let i = 0; i < 4; i++) { const x = x0 + (i % 2) * 135; const y = 370 + Math.floor(i / 2) * 130; this.cells.push(d.rectangle(x, y, 120, 110, group === 0 ? "#203952" : "#3e304b")); this.cellValues.push(d.text((group === 0 ? [0.3, 0.2, 0.1, 0.4] : [0.3, 0.3, 0.1, 0.3])[i].toFixed(2), x, y, 34)); }
    }
    this.tableLabels.push(d.tex("P_X=(0.5,0.5)", 290, 590, 29, Palette.blue), d.tex("Q_X=(0.6,0.4)", 685, 590, 29, Palette.purple));
    this.tableLabels.push(d.tex("D(P_X\\Vert Q_X)=0.029447", 480, 660, 31, Palette.orange));
    this.tableLabels.push(d.tex("\\mathbb E_{P_X}D(P_{Y|X}\\Vert Q_{Y|X})=0.019576", 480, 735, 29, Palette.green));
    const conditional: ReadonlyArray<readonly [string, number]> = [
      ["p_{xy}=p_xp(y\\mid x),\\quad q_{xy}=q_xq(y\\mid x)", 26],
      ["\\log_2\\frac{p_{xy}}{q_{xy}}=\\log_2\\frac{p_x}{q_x}+\\log_2\\frac{p(y\\mid x)}{q(y\\mid x)}", 28],
      ["\\sum_{x,y}p_{xy}\\log_2(p_x/q_x)=D(P_X\\Vert Q_X)", 31],
      ["\\sum_{x:p_x>0}p_x\\sum_y p(y\\mid x)\\log_2\\frac{p(y\\mid x)}{q(y\\mid x)}", 35],
      ["=\\mathbb E_{P_X}D(P_{Y|X}\\Vert Q_{Y|X})", 37],
    ];
    for (let i = 0; i < conditional.length; i++) this.conditionalProof.push({label: d.tex(conditional[i][0], 1360, 245 + i * 110, i === 1 || i === 2 ? 29 : 32, i === 4 ? Palette.green : Palette.text), sentence: conditional[i][1]});
    this.result = d.tex("D(P_{XY}\\Vert Q_{XY})=D(P_X\\Vert Q_X)+\\mathbb E_{P_X}D(P_{Y|X}\\Vert Q_{Y|X})", 960, 810, 32, Palette.yellow);
    this.note = d.text("", 960, 820, 28, Palette.muted);
    this.callback.push(
      d.tex("P=(1/2,1/4,1/8,1/8),\\quad Q=(1/4,1/4,1/4,1/4)",960,310,34,Palette.text),
      d.tex("H(P)=L_P=1.75,\\quad L_Q=2,\\quad D(P\\Vert Q)=.25",960,470,36,Palette.yellow),
      d.tex("2000-1750=250\\ \\text{bits for the displayed inventory}",960,630,34,Palette.green),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const callback = c.p(47);
    const ideal = (1 - c.p(22)) * (1 - callback);
    const chain = c.p(22) * (1 - callback);
    this.title.set({opacity: c.p(0)});
    this.title.setContent(ctx.localTime >= c.s(47) ? "Return to the same messages and their two bit bills" : ctx.localTime >= c.s(22) ? "Joint model error separates into marginal and conditional penalties" : "A wrong probability model has a measurable cost");
    const lengths = [-Math.log2(0.8), 1, -Math.log2(0.2), 1];
    this.lengthBars.forEach((bar: PanelMesh, i: number): void => { const height = lengths[i] * 115; Diagram.bar(bar, 240 + i * 170, 620, height, c.p(14) * ideal); this.lengths[i].setContent(lengths[i].toFixed(3)); this.lengths[i].set({y: 585 - height, opacity: c.p(14) * ideal}); this.lengthLabels[i].set({opacity: c.p(14) * ideal}); });
    this.baseline.set({opacity: c.p(14) * ideal});
    this.proof.forEach((line: ProofLine): void => line.label.set({opacity: c.p(line.sentence) * ideal}));
    this.costSegments.forEach((bar: PanelMesh, i: number): void => { Diagram.show(bar, c.p(i === 0 ? 18 : 19) * ideal); this.costLabels[i].set({opacity: c.p(i === 0 ? 18 : 19) * ideal}); });
    this.cells.forEach((cell: PanelMesh, i: number): void => { Diagram.show(cell, c.p(23) * chain); this.cellValues[i].set({opacity: c.p(23) * chain}); });
    this.tableLabels.forEach((label: FormulaHandle, i: number): void => label.set({opacity: c.p(i < 2 ? 23 : i < 4 ? 26 : i === 4 ? 34 : 38) * chain}));
    this.conditionalProof.forEach((line: ProofLine): void => line.label.set({opacity: c.p(line.sentence) * chain}));
    this.result.set({opacity: c.p(38) * chain});
    this.callback.forEach((label: FormulaHandle, i: number): void => label.set({opacity: c.p(47+i) * callback}));
    this.note.set({opacity: c.p(12) * (1 - c.p(14)) * ideal});
    this.note.setContent(chain > 0.5 ? "Only x with pₓ>0 enter the conditional average; finite joint KL supplies support compatibility" : "A positive P event with Q=0 has infinite ideal coding cost");
  }

  teardown(_layers: SceneLayers): void { this.callback.length = 0; this.lengthBars.length = 0; this.lengthLabels.length = 0; this.lengths.length = 0; this.proof.length = 0; this.costSegments.length = 0; this.costLabels.length = 0; this.cells.length = 0; this.cellValues.length = 0; this.tableLabels.length = 0; this.conditionalProof.length = 0; }
}

export function codingMismatchScene(): Scene { return new CodingMismatchScene(); }
