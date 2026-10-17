import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";
import { BernoulliBlocks } from "./lib/BernoulliBlocks";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class CompressionAchievabilityScene implements Scene {
  readonly id = "c04-achievability";
  private title!: FormulaHandle;
  private readonly nodes: PanelMesh[] = [];
  private readonly nodeLabels: FormulaHandle[] = [];
  private readonly arrows: Polyline[] = [];
  private readonly candidates: PanelMesh[] = [];
  private readonly candidateLabels: FormulaHandle[] = [];
  private decoder!: FormulaHandle;
  private readonly proof: ProofLine[] = [];
  private readonly axes: Polyline[] = [];
  private readonly curves: Polyline[] = [];
  private readonly plotLabels: FormulaHandle[] = [];
  private existence!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A rate gap makes both error terms vanish", 960, 100, 47);
    for (let i = 0; i < 3; i++) { const x = 240 + i * 290; this.nodes.push(d.rectangle(x, 280, 200, 110, i === 1 ? "#3a2f4a" : "#203952")); this.nodeLabels.push(d.tex(["x^n", "b(x^n)", "\\widehat x^n"][i], x, 280, 38)); }
    for (const x of [350, 640]) this.arrows.push(d.line([[x, 280], [x + 70, 280], [x + 58, 268], [x + 70, 280], [x + 58, 292]], Palette.axis));
    for (let i = 0; i < 4; i++) { this.candidates.push(d.rectangle(300 + i % 2 * 310, 500 + Math.floor(i / 2) * 100, 245, 70, i === 0 ? "#28513a" : "#3b2c2f")); this.candidateLabels.push(d.tex(["x^n\\in A", "\\text{atypical}", "\\text{other bin}", "\\text{other bin}"][i], 300 + i % 2 * 310, 500 + Math.floor(i / 2) * 100, 29, i === 0 ? Palette.green : Palette.muted)); }
    this.decoder = d.tex("\\text{Exactly one typical candidate}\\Rightarrow\\text{decode it}", 510, 750, 29, Palette.green);
    const proof: ReadonlyArray<readonly [string, number]> = [
      ["R>H,\\quad0<\\epsilon<R-H", 0],
      ["N=2^{\\lceil nR\\rceil},\\quad R\\le\\lceil nR\\rceil/n<R+1/n", 5],
      ["\\mathbb E_{\\cal B}[P_e]\\le P(A^c)+|A|/N", 20],
      ["\\le P(A^c)+2^{n(H+\\epsilon)-\\lceil nR\\rceil}", 22],
      ["\\le P(A^c)+2^{-n(R-H-\\epsilon)}\\longrightarrow0", 23],
      ["\\exists\\,b:\\quad P_e(b)\\le\\mathbb E_{\\cal B}[P_e]", 29],
    ];
    for (let i = 0; i < proof.length; i++) this.proof.push({ label: d.tex(proof[i][0], 1360, 240 + i * 105, i === 1 ? 29 : 34, i === 4 || i === 5 ? Palette.yellow : Palette.text), sentence: proof[i][1] });
    this.axes.push(d.line([[150, 320], [150, 700], [850, 700]], Palette.axis));
    const atypical: Array<readonly [number, number]> = [], collision: Array<readonly [number, number]> = [];
    const h = BernoulliBlocks.entropy(0.2), r = 0.9, epsilon = 0.08;
    for (let j = 0; j <= 30; j++) {
      const n = 64 + 32 * j, x = 170 + (n - 64) * 0.68;
      atypical.push([x, 700 - 340 * BernoulliBlocks.atypical(n, 0.2, epsilon)]);
      collision.push([x, 700 - 340 * 2 ** (-n * (r - h - epsilon))]);
    }
    this.curves.push(d.line(atypical, Palette.orange, 5), d.line(collision, Palette.green, 5));
    this.plotLabels.push(d.tex("p(1)=0.2,\\ H=0.721928,\\ R=0.9,\\ \\epsilon=0.08", 520, 245, 28), d.tex("P(A^c)\\quad\\text{exact binomial sum}", 510, 760, 29, Palette.orange), d.tex("2^{-n(R-H-\\epsilon)}\\quad\\text{collision upper bound}", 510, 810, 28, Palette.green), d.text("n = 64 … 1024", 520, 300, 28));
    this.plotLabels.push(d.text("block length n",510,725,23,Palette.muted),d.text("0",130,700,18,Palette.muted),d.text("1",130,360,18,Palette.muted),d.text("64",170,715,18,Palette.muted),d.text("1024",823,715,18,Palette.muted));
    this.existence = d.tex("P_{\\cal B}(P_e>\\sqrt\\alpha)\\le\\sqrt\\alpha\\quad[\\alpha>0,\\ \\mathbb E P_e\\le\\alpha]", 960, 810, 31, Palette.green);
    this.note = d.text("", 960, 845, 25, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime), plot = c.p(21) * (1 - c.p(28)), map = 1 - plot;
    this.title.set({ opacity: c.p(0) });
    this.nodes.forEach((mesh: PanelMesh, i: number): void => { Diagram.show(mesh, map * c.p(8)); this.nodeLabels[i].set({ opacity: map * c.p(8) }); });
    this.arrows.forEach((arrow: Polyline): void => arrow.setOpacity(map * c.p(9)));
    this.candidates.forEach((mesh: PanelMesh, i: number): void => { Diagram.show(mesh, map * c.p(10)); this.candidateLabels[i].set({ opacity: map * c.p(10) });
      if (i === 1) this.candidateLabels[i].setContent(ctx.localTime >= c.s(12) && ctx.localTime < c.s(13) ? "x^{\\prime n}\\in A" : "\\text{atypical}"); });
    this.decoder.set({ opacity: map * c.p(11) }); this.decoder.setContent(ctx.localTime >= c.s(12) && ctx.localTime < c.s(13) ? "\\text{Zero/multiple typical candidates}\\Rightarrow\\text{fixed default}" : "\\text{Exactly one typical candidate}\\Rightarrow\\text{decode it}");
    this.proof.forEach((line: ProofLine): void => line.label.set({ opacity: c.p(line.sentence) }));
    this.axes.forEach((axis: Polyline): void => axis.setOpacity(plot)); this.curves.forEach((curve: Polyline): void => curve.setOpacity(plot)); this.plotLabels.forEach((label: FormulaHandle): void => label.set({ opacity: plot }));
    this.existence.set({ opacity: c.p(34) });
    this.note.set({ opacity: c.p(19) });
    this.note.setContent(plot > 0.5 ? "Finite binomial illustration supports the proved bound; it does not replace the existence argument" : "One complete assignment fixes both encoder and decoder; the ensemble average guarantees at least one good code");
  }

  teardown(_layers: SceneLayers): void { this.nodes.length = 0; this.nodeLabels.length = 0; this.arrows.length = 0; this.candidates.length = 0; this.candidateLabels.length = 0; this.proof.length = 0; this.axes.length = 0; this.curves.length = 0; this.plotLabels.length = 0; }
}
export function compressionAchievabilityScene(): Scene { return new CompressionAchievabilityScene(); }
