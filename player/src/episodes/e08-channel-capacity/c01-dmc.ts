import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../e01-entropy-information/lib/Diagram";

interface LinkPanel {readonly mesh:PanelMesh;readonly title:FormulaHandle;readonly description:FormulaHandle;readonly reveal:number;}

interface ProbabilityCell {
  readonly mesh: PanelMesh;
  readonly value: FormulaHandle;
  readonly x: number;
  readonly y: number;
}

export class DmcDefinitionScene implements Scene {
  readonly id = "c01-dmc";
  private title!: FormulaHandle;
  private readonly openingLinks:LinkPanel[]=[];
  private openingNote!:FormulaHandle;
  private readonly matrix: ProbabilityCell[] = [];
  private readonly joint: ProbabilityCell[] = [];
  private readonly matrixLabels: FormulaHandle[] = [];
  private readonly jointLabels: FormulaHandle[] = [];
  private readonly outputBars: PanelMesh[] = [];
  private readonly outputValues: FormulaHandle[] = [];
  private readonly outputNames: FormulaHandle[] = [];
  private readonly equations: FormulaHandle[] = [];
  private readonly links: Polyline[] = [];
  private note!: FormulaHandle;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("A DMC separates the sender's input law from channel randomness", 960, 100, 42);
    this.openingLinks.push(
      {mesh:d.rectangle(510,440,740,310,"#203952"),title:d.text("A · 10% hidden flips",510,365,40,Palette.blue),description:d.text("The receiver sees a bit, without a flip flag",510,490,29,Palette.text),reveal:1},
      {mesh:d.rectangle(1410,440,740,310,"#332a49"),title:d.text("B · 40% marked erasures",1410,365,40,Palette.purple),description:d.text("The receiver sees the erased positions",1410,490,29,Palette.text),reveal:2},
    );
    this.openingNote=d.text("One binary input per use · capacity still to be derived",960,745,30,Palette.yellow);
    this.matrixLabels.push(
      d.text("W(y|x)", 430, 220, 31, Palette.blue),
      d.text("y=0", 560, 270, 25, Palette.muted),
      d.text("y=1", 700, 270, 25, Palette.muted),
      d.text("x=0", 325, 340, 25, Palette.muted),
      d.text("x=1", 325, 450, 25, Palette.muted),
    );
    const w = [0.9, 0.1, 0.2, 0.8];
    for (let i = 0; i < 4; i++) {
      const x = 560 + (i % 2) * 140;
      const y = 340 + Math.floor(i / 2) * 110;
      this.matrix.push({ mesh: d.rectangle(x, y, 112, 76, Palette.panel), value: d.text(w[i].toFixed(1), x, y, 33, Palette.text), x, y });
    }
    this.jointLabels.push(
      d.text("P_X(x)W(y|x)", 990, 220, 29, Palette.green),
      d.text("y=0", 1095, 270, 24, Palette.muted),
      d.text("y=1", 1235, 270, 24, Palette.muted),
      d.text("x=0", 860, 340, 24, Palette.muted),
      d.text("x=1", 860, 450, 24, Palette.muted),
    );
    const jointValues = [".225", ".025", ".150", ".600"];
    for (let i = 0; i < 4; i++) {
      const x = 1095 + (i % 2) * 140;
      const y = 340 + Math.floor(i / 2) * 110;
      this.joint.push({ mesh: d.rectangle(x, y, 112, 76, Palette.panel), value: d.text(jointValues[i], x, y, 32, Palette.text), x, y });
    }
    this.links.push(d.line([[775, 395], [900, 395], [880, 378], [900, 395], [880, 412]], Palette.axis, 3));
    this.equations.push(
      d.tex("P_X=(.25,.75)", 450, 545, 30, Palette.orange),
      d.tex("P_{X,Y}(x,y)=P_X(x)W(y|x)", 960, 565, 32, Palette.yellow),
      d.tex("P_Y(0)=.375,\\qquad P_Y(1)=.625", 1530, 300, 26, Palette.yellow),
      d.tex("W^n(y^n|x^n)=\\prod_{i=1}^{n}W(y_i|x_i)", 960, 660, 35, Palette.yellow),
      d.tex("C_{info}=\\max_{P_X}I(X;Y)", 960, 735, 39, Palette.green),
    );
    for (let i = 0; i < 2; i++) {
      const x = 1490 + i * 170;
      this.outputBars.push(d.rectangle(x, 615, 92, 1, i === 0 ? Palette.blue : Palette.orange));
      this.outputValues.push(d.text("0", x, 580, 29, Palette.text));
      this.outputNames.push(d.text(`Y=${i}`, x, 650, 25, Palette.muted));
    }
    this.note = d.text("The capacity here is a single-use information quantity, not yet a coding theorem", 960, 810, 25, Palette.muted);
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const matrixPhase = c.during(5, 18);
    const factorPhase = c.during(18, 26);
    const capacityPhase = c.p(26);
    const opening=1-c.p(5);
    this.openingLinks.forEach((panel:LinkPanel):void=>{const opacity=c.p(panel.reveal)*opening;Diagram.show(panel.mesh,opacity);panel.title.set({opacity});panel.description.set({opacity});});
    this.openingNote.set({opacity:c.p(3)*opening});
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(ctx.localTime<c.s(5)?"Which link would you choose?":capacityPhase > 0.5 ? "Capacity maximizes mutual information over input laws" : factorPhase > 0.5 ? "Memorylessness factors repeated channel uses" : "A DMC separates the sender's input law from channel randomness");
    this.matrixLabels.forEach((label: FormulaHandle): void => label.set({ opacity: matrixPhase + factorPhase * 0.35 }));
    this.matrix.forEach((cell: ProbabilityCell): void => {
      Diagram.show(cell.mesh, matrixPhase + factorPhase * 0.3);
      cell.value.set({ opacity: matrixPhase + factorPhase * 0.3 });
    });
    this.jointLabels.forEach((label: FormulaHandle): void => label.set({ opacity: c.p(13) * (1 - c.p(18)) + factorPhase * 0.25 }));
    this.joint.forEach((cell: ProbabilityCell, i: number): void => {
      const visible = c.p(13 + i) * (1 - c.p(18)) + factorPhase * 0.2;
      Diagram.show(cell.mesh, visible);
      cell.value.set({ opacity: visible });
    });
    this.links.forEach((line: Polyline): void => line.setOpacity(c.p(9) * matrixPhase));
    this.equations[0].set({ opacity: c.p(12) * (1 - c.p(18)), x: 450, y: 545 });
    this.equations[1].set({ opacity: c.p(9) * (1 - c.p(18)) + factorPhase * 0.3 });
    this.equations[2].set({ opacity: c.p(17) * (1 - c.p(21)) });
    const outputPhase = c.p(17) * (1 - c.p(21));
    const outputValues = [0.375, 0.625];
    this.outputBars.forEach((bar: PanelMesh, i: number): void => Diagram.bar(bar, 1490 + i * 170, 615, outputValues[i] * 180, outputPhase));
    this.outputValues.forEach((value: FormulaHandle, i: number): void => { value.setContent(outputValues[i].toFixed(3)); value.set({ opacity: outputPhase, y: 580 - outputValues[i] * 150 }); });
    this.outputNames.forEach((label: FormulaHandle): void => label.set({ opacity: outputPhase }));
    this.equations[3].set({ opacity: c.p(21) * factorPhase, x: 960, y: 660 });
    this.equations[4].set({ opacity: capacityPhase, x: 960, y: 735 });
    this.note.set({ opacity: capacityPhase, y: 810 });
    this.note.setContent(ctx.localTime >= c.s(30)
      ? "No operational coding theorem has been proved yet"
      : "A hidden channel state may violate the single-use product factorization");
  }

  teardown(_layers: SceneLayers): void {
    this.openingLinks.length=0;
    this.matrix.length = 0;
    this.joint.length = 0;
    this.matrixLabels.length = 0;
    this.jointLabels.length = 0;
    this.outputBars.length = 0;
    this.outputValues.length = 0;
    this.outputNames.length = 0;
    this.equations.length = 0;
    this.links.length = 0;
  }
}

export function dmcDefinitionScene(): Scene {
  return new DmcDefinitionScene();
}
