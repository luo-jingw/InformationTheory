import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";
import { BernoulliBlocks } from "./lib/BernoulliBlocks";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class EquipartitionScene implements Scene {
  readonly id = "c01-aep";
  private title!: FormulaHandle;
  private readonly symbols: PanelMesh[] = [];
  private readonly symbolLabels: FormulaHandle[] = [];
  private sequence!: FormulaHandle;
  private question!: FormulaHandle;
  private readonly proof: ProofLine[] = [];
  private readonly axes: Polyline[] = [];
  private readonly bars: PanelMesh[] = [];
  private band!: PanelMesh;
  private center!: Polyline;
  private graphLabel!: FormulaHandle;
  private probability!: FormulaHandle;
  private axisLabel!: FormulaHandle;
  private bound!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Products become averages of surprisal", 960, 100, 47);
    const sample = [0, 0, 1, 0, 0, 0, 1, 0];
    for (let i = 0; i < sample.length; i++) {
      const x = 240 + (i % 4) * 155, y = 330 + Math.floor(i / 4) * 150;
      this.symbols.push(d.rectangle(x, y, 110, 100, sample[i] ? "#3a2f4a" : "#203952"));
      this.symbolLabels.push(d.text(String(sample[i]), x, y, 45, sample[i] ? Palette.purple : Palette.blue));
    }
    this.question = d.text("Multiply tiny probabilities … or add information?", 480, 220, 28, Palette.yellow);
    this.sequence = d.tex("p(1)=0.2,\\quad p(0)=0.8", 480, 650, 38, Palette.blue);
    const lines: ReadonlyArray<readonly [string, number]> = [
      ["P(x^n)=\\prod_{i=1}^np(x_i)", 3],
      ["-\\log_2P(X^n)=\\sum_{i=1}^n[-\\log_2p(X_i)]", 6],
      ["Z_i=-\\log_2p(X_i),\\quad \\mathbb E[Z_i]=H(X)", 9],
      ["\\overline Z_n=-\\frac1n\\log_2P(X^n)", 14],
      ["\\overline Z_n\\xrightarrow{\\ P\\ }H(X)", 17],
    ];
    for (let i = 0; i < lines.length; i++) this.proof.push({ label: d.tex(lines[i][0], 1330, 260 + i * 115, i === 1 ? 32 : 37, i === 4 ? Palette.yellow : Palette.text), sentence: lines[i][1] });
    this.axes.push(d.line([[150, 290], [150, 720], [900, 720]], Palette.axis));
    this.band = d.rectangle(0, 490, 1, 440, "#244132");
    const h = BernoulliBlocks.entropy(0.2), x = 170 + (h - Math.log2(1 / 0.8)) * 350;
    this.center = d.line([[x, 275], [x, 720]], Palette.green, 3);
    for (let k = 0; k <= 128; k++) this.bars.push(d.rectangle(170, 720, 1, 1, Palette.blue));
    this.graphLabel = d.tex("", 530, 220, 34, Palette.blue);
    this.axisLabel = d.tex("\\overline Z_n=-n^{-1}\\log_2P(X^n)", 530, 760, 31);
    this.probability = d.tex("", 530, 800, 28, Palette.green);
    this.bound = d.tex("", 1320, 745, 34, Palette.yellow);
    this.note = d.text("", 960, 840, 24, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime), histogram = c.p(17), sequence = 1 - histogram;
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime >= c.s(29) ? "Variance controls the atypical probability" : ctx.localTime >= c.s(21) ? "A typical band has probability approaching one" : ctx.localTime < c.s(6) ? "Can we predict a message’s probability?" : "Products become averages of surprisal");
    this.question.set({opacity:c.p(5)*(1-c.p(6))});
    this.symbols.forEach((mesh: PanelMesh, i: number): void => { const reveal=c.p(0,.5,i*.28); mesh.scale.x=Math.max(.01,reveal); Diagram.show(mesh, reveal * sequence); this.symbolLabels[i].set({ opacity: reveal * sequence }); });
    this.sequence.set({ opacity: sequence * c.p(1) });
    const typical = c.p(21), chebyshev = c.p(29);
    this.proof.forEach((line: ProofLine, i: number): void => {
      line.label.set({ opacity: c.p(line.sentence), y: 250 + i * 110 });
      const original = ["P(x^n)=\\prod_{i=1}^np(x_i)", "-\\log_2P(X^n)=\\sum_{i=1}^n[-\\log_2p(X_i)]", "Z_i=-\\log_2p(X_i),\\quad\\mathbb E Z_i=H", "\\overline Z_n=-\\frac1n\\log_2P(X^n)", "\\overline Z_n\\xrightarrow{P}H"];
      const band = ["A_\\epsilon^{(n)}=\\{x^n:|-n^{-1}\\log_2P(x^n)-H|\\le\\epsilon\\}", "2^{-n(H+\\epsilon)}\\le P(x^n)\\le2^{-n(H-\\epsilon)}", "P(X^n\\in A_\\epsilon^{(n)})\\longrightarrow1", "\\epsilon>0\\text{ fixed first};\\quad n\\longrightarrow\\infty", "\\text{Source need not be uniform}"];
      const variance = ["\\operatorname{Var}(\\overline Z_n)=\\operatorname{Var}(Z)/n", "P(|\\overline Z_n-H|>\\epsilon)\\le\\frac{\\operatorname{Var}(Z)}{n\\epsilon^2}", "\\text{Finite positive support}\\Rightarrow\\operatorname{Var}(Z)<\\infty", "\\epsilon>0\\text{ fixed};\\quad n\\longrightarrow\\infty", "P(X^n\\in A_\\epsilon^{(n)})\\longrightarrow1"];
      line.label.setContent((chebyshev > 0.5 ? variance : typical > 0.5 ? band : original)[i]);
      line.label.set({ scale: typical > 0.5 && i === 0 && chebyshev < 0.5 ? 0.75 : 1, color: i === 4 ? Palette.yellow : Palette.text });
    });
    const n = ctx.localTime >= c.s(34) ? 128 : ctx.localTime >= c.s(18) ? 32 : 8;
    const p = 0.2, epsilon = 0.15, h = BernoulliBlocks.entropy(p), masses = BernoulliBlocks.masses(n, p);
    const bandX = 170 + (h - Math.log2(1 / 0.8)) * 350;
    this.band.scale.x = epsilon * 700;
    this.band.position.x = (bandX - 960) / 100;
    Diagram.show(this.band, histogram * typical * 0.45);
    this.axes.forEach((axis: Polyline): void => axis.setOpacity(histogram)); this.center.setOpacity(histogram);
    this.bars.forEach((bar: PanelMesh, k: number): void => {
      const surprise = BernoulliBlocks.surprisal(n, Math.min(k, n), p), x = 170 + (surprise - Math.log2(1 / 0.8)) * 350;
      bar.scale.x = Math.max(1, 560 / n); bar.material.color.set(Math.abs(surprise - h) <= epsilon ? Palette.green : Palette.blue);
      Diagram.bar(bar, x, 720, (masses[k] ?? 0) * 1100, k <= n ? histogram : 0);
    });
    this.graphLabel.setContent(`\\operatorname{Bernoulli}(0.2),\\quad n=${n},\\quad H=${h.toFixed(6)}`);
    this.graphLabel.set({ opacity: histogram }); this.axisLabel.set({ opacity: histogram });
    this.probability.setContent(`\\epsilon=0.15:\\quad P(A_\\epsilon^{(n)})=${(1 - BernoulliBlocks.atypical(n, p, epsilon)).toFixed(5)}`);
    this.probability.set({ opacity: histogram * typical });
    this.bound.setContent(`\\operatorname{Var}(Z)=0.64;\\quad\\frac{0.64}{${n}(0.15)^2}=${(0.64 / (n * epsilon ** 2)).toFixed(4)}`);
    this.bound.set({ opacity: chebyshev, y: 805 });
    this.note.set({ opacity: histogram }); this.note.setContent("Left: exact binomial PMF of average surprisal; each bar is one possible empirical count");
  }

  teardown(_layers: SceneLayers): void { this.symbols.length = 0; this.symbolLabels.length = 0; this.proof.length = 0; this.axes.length = 0; this.bars.length = 0; }
}
export function equipartitionScene(): Scene { return new EquipartitionScene(); }
