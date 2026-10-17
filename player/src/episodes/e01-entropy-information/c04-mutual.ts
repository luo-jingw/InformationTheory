import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "./lib/Diagram";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class MutualInformationScene implements Scene {
  readonly id = "c04-mutual";
  private title!: FormulaHandle;
  private readonly strips: PanelMesh[] = [];
  private readonly stripLabels: FormulaHandle[] = [];
  private definition!: FormulaHandle;
  private readonly proof: ProofLine[] = [];
  private conditionalDefinition!: FormulaHandle;
  private readonly terms: FormulaHandle[] = [];
  private readonly termBoxes: PanelMesh[] = [];
  private conditionalStep!: FormulaHandle;
  private conditionalResult!: FormulaHandle;
  private chainResult!: FormulaHandle;
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Information shared on average", 960, 100, 47);
    const scale = 3400;
    const total = 0.2863969571 * scale;
    const residual = 0.1 * scale;
    const shared = total - residual;
    this.strips.push(d.rectangle(350 + total / 2, 330, total, 95, Palette.blue));
    this.strips.push(d.rectangle(350 + residual / 2, 510, residual, 95, Palette.green));
    this.strips.push(d.rectangle(350 + residual + shared / 2, 510, shared, 95, Palette.orange));
    this.stripLabels.push(d.tex("H(Y)\\approx0.286397", 350 + total / 2, 250, 36, Palette.blue));
    this.stripLabels.push(d.tex("H(Y\\mid X)=0.1", 350 + residual / 2, 605, 32, Palette.green));
    this.stripLabels.push(d.tex("I(X;Y)\\approx0.186397", 350 + residual + shared / 2, 605, 32, Palette.orange));
    this.definition = d.tex("I(X;Y)=H(Y)-H(Y\\mid X)", 960, 745, 46, Palette.yellow);
    const lines: ReadonlyArray<readonly [string, number, number]> = [
      ["p(x,y)=p_X(x)p(y\\mid x)\\qquad[p(x,y)>0]", 7, 235],
      ["H(X,Y)=-\\sum_{x,y}p(x,y)\\big[\\log_2p_X(x)+\\log_2p(y\\mid x)\\big]", 9, 340],
      ["=-\\sum_x\\underbrace{\\Big(\\sum_yp(x,y)\\Big)}_{p_X(x)}\\log_2p_X(x)-\\sum_xp_X(x)\\sum_yp(y\\mid x)\\log_2p(y\\mid x)", 10, 460],
      ["H(X,Y)=H(X)+H(Y\\mid X)", 13, 580],
      ["H(X,Y)=H(Y)+H(X\\mid Y)", 15, 670],
      ["I(X;Y)=H(X)+H(Y)-H(X,Y)=I(Y;X)", 17, 775],
    ];
    for (const [tex, sentence, y] of lines) this.proof.push({ label: d.tex(tex, 960, y, y === 460 ? 31 : y === 340 ? 34 : 39, sentence === 17 ? Palette.yellow : Palette.text), sentence });
    this.conditionalDefinition = d.tex("I(X;Z\\mid Y)=H(Z\\mid Y)-H(Z\\mid X,Y)", 960, 230, 40, Palette.yellow);
    const termTex = ["H(Y)", "H(Z\\mid Y)", "-H(Y\\mid X)", "-H(Z\\mid X,Y)"];
    for (let i = 0; i < 4; i++) {
      const x = i % 2 === 0 ? 550 : 1370;
      const y = i < 2 ? 365 : 520;
      this.termBoxes.push(d.rectangle(x, y, 680, 95, i % 2 === 0 ? "#203952" : "#204338"));
      this.terms.push(d.tex(termTex[i], x, y, 43, i % 2 === 0 ? Palette.blue : Palette.green));
    }
    this.conditionalStep = d.tex("H(Y,Z\\mid X=x)=H(Y\\mid X=x)+H(Z\\mid Y,X=x)", 960, 660, 35, Palette.muted);
    this.conditionalResult = d.tex("\\sum_xp_X(x)[\\cdots]\\quad\\Longrightarrow\\quad H(Y,Z\\mid X)=H(Y\\mid X)+H(Z\\mid X,Y)", 960, 770, 33, Palette.text);
    this.chainResult = d.tex("I(X;Y,Z)=\\underbrace{I(X;Y)}_{\\text{first}}+\\underbrace{I(X;Z\\mid Y)}_{\\text{additional}}", 960, 725, 43, Palette.yellow);
    this.note = d.text("All conditional quantities are probability-weighted averages", 960, 815, 27, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const algebra = c.p(5) * (1 - c.p(25));
    const conditional = c.p(25) * (1 - c.p(47));
    const numeric = c.p(47);
    const strips = (1 - c.p(5)) + numeric;
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime >= c.s(47) ? "Mutual information: a numerical check" : ctx.localTime >= c.s(25) ? "New information after an observation" : ctx.localTime >= c.s(5) ? "Why the chain rule makes information symmetric" : "Information shared on average");
    this.strips.forEach((strip: PanelMesh, i: number): void => Diagram.show(strip, c.p(i === 0 ? 1 : i === 1 ? 2 : 3) * strips));
    this.stripLabels.forEach((label: FormulaHandle, i: number): void => label.set({ opacity: c.p(i === 0 ? 1 : i === 1 ? 2 : 3) * strips }));
    this.definition.set({ opacity: c.p(3) * strips });
    this.definition.setContent(ctx.localTime >= c.s(49) ? "I(X;Y)\\approx0.286397-0.1=0.186397\\ \\text{bits}" : "I(X;Y)=H(Y)-H(Y\\mid X)");
    this.proof.forEach((line: ProofLine): void => line.label.set({ opacity: c.p(line.sentence) * algebra }));
    this.conditionalDefinition.set({ opacity: c.p(26) * conditional });
    this.conditionalDefinition.setContent(ctx.localTime >= c.s(30) ? "I(X;Y,Z)=H(Y,Z)-H(Y,Z\\mid X)" : "I(X;Z\\mid Y)=H(Z\\mid Y)-H(Z\\mid X,Y)");
    for (let i = 0; i < 4; i++) {
      const opacity = c.p(i < 2 ? 32 : 37) * conditional;
      const regroup = c.p(i % 2 === 0 ? 38 : 39);
      Diagram.show(this.termBoxes[i], opacity * (0.65 + 0.35 * regroup));
      this.terms[i].set({ opacity });
    }
    this.conditionalStep.set({ opacity: c.p(33) * (1 - c.p(38)) * conditional });
    this.conditionalResult.set({ opacity: c.p(35) * (1 - c.p(38)) * conditional });
    this.chainResult.set({ opacity: c.p(40) * conditional });
    this.note.set({ opacity: c.p(27) * (1 - c.p(33)) * conditional + c.p(40) * conditional });
    this.note.setContent(ctx.localTime >= c.s(45) ? "Nonnegativity follows from divergence in the next episode" : "All conditional quantities are probability-weighted averages");
  }

  teardown(_layers: SceneLayers): void {
    this.strips.length = 0; this.stripLabels.length = 0; this.proof.length = 0;
    this.terms.length = 0; this.termBoxes.length = 0;
  }
}

export function mutualInformationScene(): Scene { return new MutualInformationScene(); }
