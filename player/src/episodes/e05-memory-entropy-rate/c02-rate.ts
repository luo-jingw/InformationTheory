import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class EntropyRateLimitScene implements Scene {
  readonly id = "c02-rate";
  private title!: FormulaHandle;
  private readonly proof: ProofLine[] = [];
  private readonly bars: PanelMesh[] = [];
  private readonly axes: Polyline[] = [];
  private limitLine!: Polyline;
  private averageLine!: Polyline;
  private values!: FormulaHandle;
  private limitLabel!: FormulaHandle;
  private averageLabel!: FormulaHandle;
  private partition!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Stationarity makes conditional uncertainty decrease", 960, 100, 46);
    const proof: ReadonlyArray<readonly [string, number]> = [
      ["a_n=H(X_n\\mid X_1,\\ldots,X_{n-1})", 1],
      ["H(X^n)=\\sum_{i=1}^n a_i", 3],
      ["a_{n+1}=H(X_{n+1}\\mid X_1,\\ldots,X_n)", 7],
      ["\\le H(X_{n+1}\\mid X_2,\\ldots,X_n)=a_n", 10],
      ["0\\le a_{n+1}\\le a_n\\le\\log_2 K\\quad\\Rightarrow\\quad a_n\\to h", 13],
    ];
    for (let i = 0; i < proof.length; i++) this.proof.push({ label: d.tex(proof[i][0], 1340, 245 + i * 112, i === 4 ? 30 : 35, i === 4 ? Palette.yellow : Palette.text), sentence: proof[i][1] });
    this.axes.push(d.line([[160, 260], [160, 730], [860, 730]], Palette.axis));
    for (let i = 0; i < 128; i++) this.bars.push(d.rectangle(0, 730, 1, 1, Palette.blue));
    this.limitLine = d.line([[160, 550], [860, 550]], Palette.green, 4);
    this.averageLine = d.line([[160, 450], [860, 450]], Palette.orange, 4);
    this.values = d.tex("a_i^{\\rm example}=0.4+0.5/\\sqrt i", 510, 225, 32, Palette.blue);
    this.limitLabel = d.tex("h=0.4", 800, 580, 29, Palette.green);
    this.averageLabel = d.tex("", 515, 800, 31, Palette.orange);
    this.partition = d.tex("", 960, 810, 32, Palette.yellow);
    this.note = d.text("", 960, 850, 24, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime), cesaro = c.p(15), n = ctx.localTime >= c.s(18) ? 128 : 24;
    this.title.set({ opacity: c.p(0) }); this.title.setContent(cesaro > 0.5 ? "A finite beginning has vanishing weight in a long average" : ctx.localTime < c.s(10) ? "Can more history increase the next-symbol uncertainty?" : "Stationarity makes conditional uncertainty decrease");
    this.proof.forEach((line: ProofLine, i: number): void => {
      const reveal = cesaro > 0.5 ? [17, 15, 18, 19, 20][i] : line.sentence;
      line.label.set({ opacity: c.p(reveal) });
      const early = ["a_n=H(X_n\\mid X_1,\\ldots,X_{n-1})", "H(X^n)=\\sum_{i=1}^na_i", "a_{n+1}=H(X_{n+1}\\mid X_1,\\ldots,X_n)", "\\le H(X_{n+1}\\mid X_2,\\ldots,X_n)=a_n", "0\\le a_{n+1}\\le a_n\\le\\log_2K\\Rightarrow a_n\\to h"];
      const late = ["a_i\\to h:\\quad\\forall\\epsilon>0,\\ \\exists N,\\ i\\ge N\\Rightarrow |a_i-h|\\le\\epsilon", "\\frac1nH(X^n)-h=\\frac1n\\sum_{i=1}^n(a_i-h)", "\\frac1n\\sum_{i<N}(a_i-h)\\longrightarrow0", "0\\le\\frac1n\\sum_{i=N}^n(a_i-h)\\le\\epsilon", "\\frac1nH(X^n)\\longrightarrow h\\le H(X_1)"];
      line.label.setContent((cesaro > 0.5 ? late : early)[i]); line.label.set({ scale: cesaro > 0.5 && i === 0 ? 0.77 : 1 });
    });
    let sum = 0;
    this.bars.forEach((bar: PanelMesh, i: number): void => {
      const value = 0.4 + 0.5 / Math.sqrt(i + 1); if (i < n) sum += value;
      bar.scale.x = 590 / n; bar.material.color.set(cesaro > 0.5 && i < 11 ? Palette.orange : Palette.blue);
      Diagram.bar(bar, 175 + (i + 0.5) * 660 / n, 730, value * 450, i < n ? c.p(12) : 0);
    });
    this.axes.forEach((axis: Polyline): void => axis.setOpacity(c.p(12))); this.limitLine.setOpacity(c.p(14)); this.limitLabel.set({ opacity: c.p(14) }); this.values.set({ opacity: c.p(12) });
    this.averageLine.object.position.y = ((sum / n) * 450 - 280) / 100;
    this.averageLine.setOpacity(cesaro); this.averageLabel.set({ opacity: cesaro, y: 775 }); this.averageLabel.setContent(`n=${n},\\quad\\overline a_n=${(sum / n).toFixed(5)}`);
    this.partition.set({ opacity: c.p(17), x: 1340, y: 790 }); this.partition.setContent("\\text{First }N-1\\text{ terms}\\quad+\\quad\\text{tail within }\\epsilon");
    this.note.set({ opacity: c.p(1), y: 840 }); this.note.setContent("K is the alphabet size. Left: an illustrative decreasing sequence; right: the stationary-source proof");
  }

  teardown(_layers: SceneLayers): void { this.proof.length = 0; this.bars.length = 0; this.axes.length = 0; }
}
export function entropyRateLimitScene(): Scene { return new EntropyRateLimitScene(); }
