import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface ProofLine { label: FormulaHandle; sentence: number; }

export class InformationShapeScene implements Scene {
  readonly id = "c05-mi-shape";
  private title!: FormulaHandle;
  private readonly axes: Polyline[] = [];
  private inputCurve!: Polyline;
  private channelCurve!: Polyline;
  private marker!: PanelMesh;
  private coordinate!: FormulaHandle;
  private plotLabel!: FormulaHandle;
  private readonly inputProof: ProofLine[] = [];
  private readonly logProof: ProofLine[] = [];
  private readonly affineProof: ProofLine[] = [];
  private readonly pairBars: PanelMesh[] = [];
  private readonly pairLabels: FormulaHandle[] = [];
  private readonly cells: PanelMesh[] = [];
  private readonly cellValues: FormulaHandle[] = [];
  private tableLabel!: FormulaHandle;
  private tableAxes!: FormulaHandle;
  private readonly conditional: ProofLine[] = [];
  private readonly rowLabels: FormulaHandle[] = [];
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("What stays fixed determines the curvature", 960, 100, 47);
    this.axes.push(d.line([[190, 280], [190, 710], [840, 710]], Palette.axis));
    this.axes.push(d.line([[190, 350], [840, 350]], Palette.grid, 2));
    this.inputCurve = d.line(Array.from({length: 101}, (_: unknown, i: number): readonly [number, number] => [190 + 650 * i / 100, 710 - this.inputInformation(i / 100) * 360]), Palette.blue, 5);
    this.channelCurve = d.line(Array.from({length: 101}, (_: unknown, i: number): readonly [number, number] => [190 + 650 * i / 100, 710 - (1 - this.binaryEntropy(i / 100)) * 360]), Palette.purple, 5);
    this.marker = d.rectangle(190, 710, 18, 18, Palette.yellow);
    this.coordinate = d.tex("", 510, 780, 35, Palette.yellow);
    this.plotLabel = d.tex("W=\\operatorname{BSC}(0.1)\\quad\\text{fixed}", 515, 240, 33, Palette.blue);
    const inputProof: ReadonlyArray<readonly [string, number]> = [
      ["P_Y=\\sum_xp_xW(\\cdot\\mid x)\\quad\\text{affine in }P_X", 3],
      ["H(Y)\\quad\\text{concave in }P_X", 6],
      ["H(Y\\mid X)=\\sum_xp_xH(W_x)\\quad\\text{linear in }P_X", 8],
      ["I(P_X,W)=H(Y)-H(Y\\mid X)\\quad\\text{concave in }P_X", 11],
      ["I(a)=h_2(0.1+0.8a)-h_2(0.1)", 17],
    ];
    for (let i = 0; i < inputProof.length; i++) this.inputProof.push({label: d.tex(inputProof[i][0], 1350, 280 + 115 * i, i === 3 ? 30 : 33, i === 3 ? Palette.yellow : Palette.text), sentence: inputProof[i][1]});
    const logProof: ReadonlyArray<readonly [string, number]> = [
      ["a_i,b_i>0,\\quad A=\\sum_i a_i,\\quad B=\\sum_i b_i", 25],
      ["w_i=a_i/A,\\quad t_i=b_i/a_i", 27],
      ["-\\ln\\Big(\\sum_iw_it_i\\Big)\\le\\sum_iw_i(-\\ln t_i)", 28],
      ["\\sum_i a_i\\ln(a_i/b_i)\\ge A\\ln(A/B)", 30],
      ["a_i,b_i\\mapsto a_i+\\epsilon,b_i+\\epsilon;\\quad\\epsilon\\downarrow0", 32],
      ["0\\ln(0/b)=0;\\quad a>0,b=0\\Rightarrow+\\infty", 33],
    ];
    for (let i = 0; i < logProof.length; i++) this.logProof.push({label: d.tex(logProof[i][0], 960, 245 + i * 100, 35, i === 3 ? Palette.yellow : Palette.text), sentence: logProof[i][1]});
    const affine: ReadonlyArray<readonly [string, number]> = [
      ["a=(\\lambda p_{1i},(1-\\lambda)p_{2i})", 38],
      ["b=(\\lambda q_{1i},(1-\\lambda)q_{2i})", 39],
      ["\\lambda p_{1i}\\ln\\frac{p_{1i}}{q_{1i}}+(1-\\lambda)p_{2i}\\ln\\frac{p_{2i}}{q_{2i}}", 40],
      ["\\ge p_{\\lambda i}\\ln(p_{\\lambda i}/q_{\\lambda i})", 41],
      ["D(P_\\lambda\\Vert Q_\\lambda)\\le\\lambda D(P_1\\Vert Q_1)+(1-\\lambda)D(P_2\\Vert Q_2)", 43],
      ["I(P_X,W)=D(P_{XY}(W)\\Vert P_XP_Y(W))", 45],
      ["P_{XY}(W),\\ P_XP_Y(W)\\quad\\text{both affine in }W", 46],
      ["I(P_X,W)\\quad\\text{convex in }W\\quad[P_X\\text{ fixed}]", 52],
    ];
    for (let i = 0; i < affine.length; i++) this.affineProof.push({label: d.tex(affine[i][0], i < 5 ? 1190 : 1330, 250 + (i < 5 ? i * 110 : (i - 5) * 180), i === 2 || i === 4 ? 29 : 33, i === 4 || i === 7 ? Palette.yellow : Palette.text), sentence: affine[i][1]});
    for (let i = 0; i < 4; i++) {
      const symbol = i < 2 ? "p" : "q";
      const text = i % 2 === 0 ? `\\lambda ${symbol}_{1i}` : `(1-\\lambda)${symbol}_{2i}`;
      this.pairBars.push(d.rectangle(i < 2 ? 270 : 580, 650, 270, 1, i % 2 === 0 ? "#203952" : "#3a2f4a"));
      this.pairLabels.push(d.tex(text, i < 2 ? 270 : 580, i % 2 === 0 ? 435 : 605, 34, i % 2 === 0 ? Palette.blue : Palette.purple));
    }
    for (let i = 0; i < 4; i++) { const x = 440 + (i % 2) * 230; const y = 390 + Math.floor(i / 2) * 160; this.cells.push(d.rectangle(x, y, 210, 140, "#203952")); this.cellValues.push(d.text("", x, y, 43)); }
    this.tableLabel = d.tex("P_{XY}", 555, 245, 40, Palette.blue);
    this.tableAxes = d.tex("x\\backslash y\\qquad0\\qquad1", 525, 300, 30, Palette.muted);
    this.rowLabels.push(d.tex("0", 290, 390, 32), d.tex("1", 290, 550, 32));
    const conditional: ReadonlyArray<readonly [string, number]> = [
      ["X,Y\\text{ independent fair bits}:\\quad I(X;Y)=0", 64],
      ["Z=X\\oplus Y,\\quad H(X\\mid Z)=1", 66],
      ["H(X\\mid Y,Z)=0", 69],
      ["I(X;Y\\mid Z)=1>0=I(X;Y)", 71],
    ];
    for (let i = 0; i < conditional.length; i++) this.conditional.push({label: d.tex(conditional[i][0], 1340, 290 + 140 * i, i === 0 ? 30 : 37, i === 3 ? Palette.yellow : Palette.text), sentence: conditional[i][1]});
    this.note = d.text("", 960, 815, 30, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const input = 1 - c.p(21);
    const log = c.p(24) * (1 - c.p(36));
    const joint = c.p(36) * (1 - c.p(45));
    const affine = c.p(45) * (1 - c.p(53));
    const channel = c.p(53) * (1 - c.p(62));
    const conditioning = c.p(62);
    this.title.set({opacity: c.p(0)});
    this.title.setContent(ctx.localTime >= c.s(62) ? "Conditioning has no universal effect on mutual information" : ctx.localTime >= c.s(45) ? "Fixed input: mutual information is convex in the channel" : ctx.localTime >= c.s(36) ? "Log-sum proves joint convexity of divergence" : ctx.localTime >= c.s(24) ? "Jensen proves the log-sum inequality" : ctx.localTime >= c.s(21) ? "Now hold the input fixed and vary the channel" : "Fixed channel: mutual information is concave in the input");
    this.axes.forEach((axis: Polyline): void => axis.setOpacity(c.p(13) * input + channel));
    this.inputCurve.setOpacity(c.p(17) * input); this.channelCurve.setOpacity(channel);
    const a = Math.min(0.5, 0.5 * c.p(19));
    const t = c.p(58, 0.5, (c.e(58) - c.s(58)) * 0.35) * (1 - 0.5 * c.p(59));
    const x = input > 0.5 ? a : t;
    const info = input > 0.5 ? this.inputInformation(a) : 1 - this.binaryEntropy(t);
    this.marker.position.set((190 + 650 * x - 960) / 100, (540 - 710 + info * 360) / 100, 0.1);
    Diagram.show(this.marker, c.p(18) * input + channel);
    this.coordinate.set({opacity: c.p(18) * input + channel});
    this.coordinate.setContent(input > 0.5 ? `a=${a.toFixed(2)},\\quad I=${info.toFixed(5)}\\text{ bits}` : `t=${t.toFixed(2)},\\quad I=${info.toFixed(5)}\\text{ bits}`);
    this.plotLabel.set({opacity: c.p(13) * input + channel});
    this.plotLabel.setContent(input > 0.5 ? "W=\\operatorname{BSC}(0.1)\\quad\\text{fixed}" : "P_X=(0.5,0.5)\\quad\\text{fixed}");
    this.inputProof.forEach((line: ProofLine): void => line.label.set({opacity: c.p(line.sentence) * input}));
    this.logProof.forEach((line: ProofLine): void => line.label.set({opacity: c.p(line.sentence) * log}));
    this.affineProof.forEach((line: ProofLine, i: number): void => line.label.set({opacity: c.p(line.sentence) * (i < 5 ? joint : affine)}));
    this.pairBars.forEach((bar: PanelMesh, i: number): void => { Diagram.bar(bar, i < 2 ? 270 : 580, i % 2 === 0 ? 480 : 650, 90, joint); this.pairLabels[i].set({opacity: joint}); });
    const table = affine + conditioning;
    const parity = c.p(69) * (1 - c.p(73));
    const decrease = c.p(73);
    const givenX = c.p(75);
    const equal = c.p(77);
    const tau = 0.5 * c.p(49);
    const values = affine > 0.5 ? [0.5 * (1 - tau), 0.5 * tau, 0.5 * tau, 0.5 * (1 - tau)] : equal > 0.5 ? [0.5, 0, 0, 0.5] : decrease > 0.5 ? [0.5 + 0.5 * givenX, 0, 0, 0.5 * (1 - givenX)] : [0.25 + 0.25 * parity, 0.25 * (1 - parity), 0.25 * (1 - parity), 0.25 + 0.25 * parity];
    this.cells.forEach((cell: PanelMesh, i: number): void => { Diagram.show(cell, table * (values[i] > 0.001 ? 1 : 0.25)); this.cellValues[i].setContent(values[i].toFixed(2)); this.cellValues[i].set({opacity: table}); });
    this.tableLabel.set({opacity: table}); this.tableAxes.set({opacity: table});
    this.rowLabels.forEach((label: FormulaHandle): void => label.set({opacity: table}));
    this.tableLabel.setContent(affine > 0.5 ? "P_{XY}=P_X[(1-t)W_{\\rm id}+tW_{\\rm flip}]" : equal > 0.5 ? "Z\\perp(X,Y):\\quad P_{XY|z}=P_{XY}" : decrease > 0.5 ? givenX > 0.5 ? "Y=X,\\ Z=X;\\quad P_{XY|Z=0}" : "Y=X:\\quad P_{XY}" : parity > 0.5 ? "P_{XY|Z=0},\\quad Z=X\\oplus Y" : "P_{XY},\\quad X\\perp Y");
    this.tableLabel.set({scale: 0.8});
    this.conditional.forEach((line: ProofLine, i: number): void => {
      line.label.set({opacity: (c.p(line.sentence) * (1 - decrease) + decrease) * conditioning});
      if (decrease > 0.5) line.label.setContent(equal > 0.5 ? ["Z\\perp(X,Y)", "P_{XY|z}=P_{XY}\\quad[p_Z(z)>0]", "H(X\\mid Z)=H(X)", "I(X;Y\\mid Z)=I(X;Y)"][i] : ["Y=X,\\quad H(X)>0", "Z=X,\\quad H(X\\mid Z)=0", "H(X\\mid Y,Z)=0", "I(X;Y\\mid Z)=0<I(X;Y)"][i]);
      else line.label.setContent(["X,Y\\text{ independent fair bits}:\\quad I(X;Y)=0", "Z=X\\oplus Y,\\quad H(X\\mid Z)=1", "H(X\\mid Y,Z)=0", "I(X;Y\\mid Z)=1>0=I(X;Y)"][i]);
    });
    this.note.set({opacity: channel + conditioning + affine});
    this.note.setContent(affine > 0.5 ? "Fixed fair input: every product-reference probability pₓpᵧ stays 0.25" : channel > 0.5 ? "I(t)=1-h₂(t): endpoints reveal the bit; the equal mixture erases it" : "Conditional tables normalize within each revealed event");
  }

  teardown(_layers: SceneLayers): void { this.axes.length = 0; this.inputProof.length = 0; this.logProof.length = 0; this.affineProof.length = 0; this.pairBars.length = 0; this.pairLabels.length = 0; this.cells.length = 0; this.cellValues.length = 0; this.conditional.length = 0; this.rowLabels.length = 0; }

  private binaryEntropy(p: number): number { return p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p); }
  private inputInformation(a: number): number { return this.binaryEntropy(0.1 + 0.8 * a) - this.binaryEntropy(0.1); }
}

export function informationShapeScene(): Scene { return new InformationShapeScene(); }
