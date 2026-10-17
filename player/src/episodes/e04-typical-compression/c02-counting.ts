import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class TypicalCountingScene implements Scene {
  readonly id = "c02-counting";
  private title!: FormulaHandle;
  private readonly proof: ProofLine[] = [];
  private readonly strings: PanelMesh[] = [];
  private readonly stringLabels: FormulaHandle[] = [];
  private gridLabel!: FormulaHandle;
  private prediction!: FormulaHandle;
  private readonly comparisonBars: PanelMesh[] = [];
  private readonly comparisons: FormulaHandle[] = [];
  private readonly sourceBars: PanelMesh[] = [];
  private readonly frequencyBars: PanelMesh[] = [];
  private readonly vectorLabels: FormulaHandle[] = [];
  private readonly weakStrong: ProofLine[] = [];
  private example!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A probability band gives two counting bounds", 960, 100, 47);
    const proof: ReadonlyArray<readonly [string, number]> = [
      ["P(x^n)\\ge2^{-n(H+\\epsilon)}\\quad(x^n\\in A)", 6],
      ["1\\ge\\sum_{x^n\\in A}P(x^n)\\ge |A|2^{-n(H+\\epsilon)}", 7],
      ["|A|\\le2^{n(H+\\epsilon)}", 8],
      ["1-\\delta\\le P(A)\\le |A|2^{-n(H-\\epsilon)}", 11],
      ["(1-\\delta)2^{n(H-\\epsilon)}\\le |A|\\le2^{n(H+\\epsilon)}", 13],
    ];
    for (let i = 0; i < proof.length; i++) this.proof.push({ label: d.tex(proof[i][0], 960, 235 + i * 120, i === 1 || i === 4 ? 36 : 40, i === 2 || i === 4 ? Palette.yellow : Palette.text), sentence: proof[i][1] });
    for (let i = 0; i < 64; i++) {
      const x = 160 + i % 8 * 85, y = 280 + Math.floor(i / 8) * 62;
      this.strings.push(d.rectangle(x, y, 73, 49, "#203952"));
      this.stringLabels.push(d.text(i.toString(2).padStart(6, "0"), x, y, 18));
    }
    this.prediction = d.text("Uniform source: does every string become typical?", 960, 165, 31, Palette.yellow);
    this.gridLabel = d.tex("n=6,\\quad K^n=64", 460, 210, 37, Palette.blue);
    this.comparisonBars.push(d.rectangle(1120, 420, 1, 65, Palette.green), d.rectangle(1120, 630, 1, 65, Palette.orange));
    this.comparisons.push(d.tex("", 1420, 330, 35, Palette.green), d.tex("", 1420, 540, 35, Palette.orange));
    const source = [0.5, 0.25, 0.25], frequencies = [0.5, 0.5, 0];
    for (let i = 0; i < 3; i++) {
      const x = 260 + i * 230;
      this.sourceBars.push(d.rectangle(x - 45, 630, 70, 1, Palette.blue)); this.frequencyBars.push(d.rectangle(x + 45, 630, 70, 1, Palette.purple));
      this.vectorLabels.push(d.tex(`x=${i}`, x, 690, 32));
      this.vectorLabels.push(d.tex(`${source[i]}`, x - 45, 590 - source[i] * 380, 27, Palette.blue), d.tex(`${frequencies[i]}`, x + 45, 590 - frequencies[i] * 380, 27, Palette.purple));
    }
    const strong: ReadonlyArray<readonly [string, number]> = [
      ["\\text{Weak: }|\\sum_x\\widehat p_x(-\\log_2p_x)-H|\\le\\epsilon", 32],
      ["\\text{Strong: }|\\widehat p_x-p_x|\\le\\eta\\quad(p_x>0)", 34],
      ["p_x=0\\quad\\Rightarrow\\quad N_x=0", 35],
      ["|\\overline Z-H|\\le\\eta\\sum_{x:p_x>0}|\\log_2p_x|", 38],
      ["p=(1/2,1/4,1/4),\\quad\\widehat p=(1/2,1/2,0)", 41],
      ["\\overline Z=\\tfrac12(1)+\\tfrac12(2)=1.5=H(p)", 44],
    ];
    for (let i = 0; i < strong.length; i++) this.weakStrong.push({ label: d.tex(strong[i][0], 1330, 230 + i * 105, i === 0 || i === 4 ? 30 : 34, i === 5 ? Palette.yellow : Palette.text), sentence: strong[i][1] });
    this.example = d.tex("", 480, 775, 33, Palette.yellow);
    this.note = d.text("", 960, 835, 27, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime), counting = c.p(6) * (1 - c.p(18)), mass = c.p(0) * (1 - c.p(6)) + c.p(18) * (1 - c.p(31)), strong = c.p(31), example = c.p(41);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(strong > 0.5 ? "Weak typicality controls one average; strong typicality controls every frequency" : mass > 0.5 ? "Probability mass and counting fraction differ" : "A probability band gives two counting bounds");
    this.title.set({ scale: strong > 0.5 ? 0.88 : 1 });
    this.proof.forEach((line: ProofLine): void => line.label.set({ opacity: c.p(line.sentence) * counting }));
    this.prediction.set({opacity:c.p(23)*(1-c.p(24))});
    const uniform = c.p(24), prob = (1 - uniform) * 0.01 + uniform * 0.5;
    this.strings.forEach((mesh: PanelMesh, i: number): void => {
      const typical = uniform > 0.5 || i === 0;
      mesh.material.color.set(typical ? "#2f6743" : "#203952"); Diagram.show(mesh, mass * (typical ? 1 : 0.45));
      this.stringLabels[i].set({ opacity: mass * (typical ? 1 : 0.45) });
    });
    this.gridLabel.set({ opacity: mass });
    const values = [uniform > 0.5 ? 1 : 0.99 ** 6, uniform > 0.5 ? 1 : 1 / 64];
    this.comparisonBars.forEach((bar: PanelMesh, i: number): void => {
      const width = 500 * values[i]; bar.scale.x = width; bar.position.x = (1100 + width / 2 - 960) / 100; Diagram.show(bar, mass);
      this.comparisons[i].setContent(i === 0 ? `P(A)=${values[i].toFixed(6)}` : `|A|/2^6=${values[i].toFixed(6)}`); this.comparisons[i].set({ opacity: mass });
    });
    this.sourceBars.forEach((bar: PanelMesh, i: number): void => { Diagram.bar(bar, 215 + i * 230, 630, [0.5, 0.25, 0.25][i] * 380, strong * example); Diagram.bar(this.frequencyBars[i], 305 + i * 230, 630, [0.5, 0.5, 0][i] * 380, strong * example); });
    this.vectorLabels.forEach((label: FormulaHandle): void => label.set({ opacity: strong * example }));
    this.weakStrong.forEach((line: ProofLine): void => line.label.set({ opacity: c.p(line.sentence) * strong }));
    this.example.set({ opacity: mass + strong * example });
    this.example.setContent(strong > 0.5 ? ctx.localTime>=c.s(51) ? "\\eta<1/4:\\quad\\text{weak typical, not strong typical}" : ctx.localTime>=c.s(44) ? "\\text{Same average; compare all three frequencies.}" : "\\text{Does this sequence satisfy either notion?}" : uniform > 0.5 ? "p(1)=1/2:\\quad A_\\epsilon^{(6)}=\\{0,1\\}^6" : `p(1)=${prob.toFixed(2)},\\quad\\epsilon=0.3,\\quad A=\\{000000\\}`);
    this.note.set({ opacity: c.p(0) });
    this.note.setContent(strong > 0.5 ? "Blue: source probabilities; purple: empirical frequencies of the explicit even-length example" : mass > 0.5 ? uniform > .5 ? "Uniform source: all 64 strings belong to the typical set" : "One string carries 94.15% of the probability and occupies 1/64 of the space" : "Fix ε first; the entropy exponent follows when ε is subsequently made arbitrarily small");
  }

  teardown(_layers: SceneLayers): void { this.proof.length = 0; this.strings.length = 0; this.stringLabels.length = 0; this.comparisonBars.length = 0; this.comparisons.length = 0; this.sourceBars.length = 0; this.frequencyBars.length = 0; this.vectorLabels.length = 0; this.weakStrong.length = 0; }
}
export function typicalCountingScene(): Scene { return new TypicalCountingScene(); }
