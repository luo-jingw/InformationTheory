import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";
import { BernoulliBlocks } from "./lib/BernoulliBlocks";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class CompressionBoundaryScene implements Scene {
  readonly id = "c06-boundaries";
  private title!: FormulaHandle;
  private fixedHeading!: FormulaHandle;
  private readonly sources: PanelMesh[] = [];
  private readonly messages: PanelMesh[] = [];
  private readonly sourceLabels: FormulaHandle[] = [];
  private readonly messageLabels: FormulaHandle[] = [];
  private readonly links: Polyline[] = [];
  private readonly proof: ProofLine[] = [];
  private readonly columnHeadings: FormulaHandle[] = [];
  private readonly prefixRows: FormulaHandle[] = [];
  private average!: FormulaHandle;
  private requirement!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Zero error protects every supported source block", 960, 100, 47);
    this.fixedHeading = d.text("Fixed-length requirement",1350,180,27,Palette.muted);
    const codewords = ["0", "1000", "1001", "10110", "1010", "10111", "11000", "1100100"];
    for (let i = 0; i < 8; i++) {
      const y = 250 + i * 70;
      this.sources.push(d.rectangle(240, y, 170, 48, "#203952")); this.messages.push(d.rectangle(650, y, 170, 48, "#3a2f4a"));
      this.sourceLabels.push(d.text(i.toString(2).padStart(3, "0"), 240, y, 32, Palette.blue)); this.messageLabels.push(d.text(i.toString(2).padStart(3, "0"), 650, y, 32, Palette.purple));
      this.links.push(d.line([[340, y], [550, y], [535, y - 10], [550, y], [535, y + 10]], Palette.axis));
      const ones = i.toString(2).split("1").length - 1, p = 0.2 ** ones * 0.8 ** (3 - ones);
      this.prefixRows.push(d.tex(`${i.toString(2).padStart(3, "0")}\\quad ${p.toFixed(3)}\\quad\\mapsto\\quad\\mathtt{${codewords[i]}}\\quad[\\ell=${codewords[i].length}]`, 490, y, 30, i === 0 ? Palette.green : Palette.text));
    }
    const proof: ReadonlyArray<readonly [string, number]> = [
      ["K_+=|\\{x:p(x)>0\\}|", 2],
      ["|\\operatorname{supp}(X^n)|=K_+^n\\quad[\\text{IID}]", 4],
      ["\\text{Zero error}\\Rightarrow\\text{injective on support}", 6],
      ["M\\ge K_+^n\\quad\\Rightarrow\\quad R_n\\ge\\log_2K_+", 7],
      ["H<\\log_2K_+\\quad[\\text{nonuniform positive support}]", 9],
    ];
    for (let i = 0; i < proof.length; i++) this.proof.push({ label: d.tex(proof[i][0], 1360, 245 + i * 110, i === 4 ? 30 : 34, i === 3 ? Palette.yellow : Palette.text), sentence: proof[i][1] });
    this.columnHeadings.push(d.tex("x^3\\qquad P(x^3)\\qquad\\text{prefix codeword}", 490, 185, 30, Palette.blue));
    this.average = d.tex("\\mathbb E[\\ell]/3=2.584/3=0.861333\\text{ bits/symbol}", 490, 805, 29, Palette.green);
    this.requirement = d.tex("", 1350, 780, 34, Palette.yellow);
    this.note = d.text("", 960, 845, 23, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime), variable = c.p(19), fixed = 1 - variable;
    this.fixedHeading.set({opacity:c.p(0)});
    this.title.set({ opacity: c.p(0) }); this.title.setContent(variable > 0.5 ? "Variable lengths preserve zero error while reducing average length" : "Zero error protects every supported source block");
    this.title.set({ scale: variable > 0.5 ? 0.88 : 1 });
    this.sources.forEach((mesh: PanelMesh, i: number): void => { Diagram.show(mesh, c.p(3) * fixed); Diagram.show(this.messages[i], c.p(5) * fixed); this.sourceLabels[i].set({ opacity: c.p(3) * fixed }); this.messageLabels[i].set({ opacity: c.p(5) * fixed }); this.links[i].setOpacity(c.p(6) * fixed); this.prefixRows[i].set({ opacity: variable }); });
    this.columnHeadings.forEach((label: FormulaHandle): void => label.set({ opacity: variable }));
    this.proof.forEach((line: ProofLine): void => line.label.set({ opacity: c.p(line.sentence) }));
    this.average.set({ opacity: variable });
    const h = BernoulliBlocks.entropy(0.2);
    this.requirement.set({ opacity: c.p(11) });
    this.requirement.setContent(variable > 0.5 ? `H=${h.toFixed(6)}<0.861333<1\\quad[n=3\\text{ example}]` : ctx.localTime < c.s(12) ? "p(1)=0.2:\\quad R_{\\text{zero-error}}=?" : ctx.localTime < c.s(13) ? "R_{\\text{zero-error}}\\ge1\\text{ bit/symbol}" : `p(1)=0.2:\\quad H=${h.toFixed(6)}<1\\text{ bit/symbol}`);
    this.note.set({ opacity: c.p(15), y: 845 });
    this.note.setContent(variable > 0.5 ? "The displayed eight words are prefix-free; common blocks receive shorter words. General construction follows in the coding episodes." : "Vanishing block error allows a rare error event; exact fixed-length zero error does not");
  }

  teardown(_layers: SceneLayers): void { this.sources.length = 0; this.messages.length = 0; this.sourceLabels.length = 0; this.messageLabels.length = 0; this.links.length = 0; this.proof.length = 0; this.columnHeadings.length = 0; this.prefixRows.length = 0; }
}
export function compressionBoundaryScene(): Scene { return new CompressionBoundaryScene(); }
