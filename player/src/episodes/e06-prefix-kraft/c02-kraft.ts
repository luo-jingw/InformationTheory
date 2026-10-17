import type { Scene, SceneContext } from "../../core/Scene";
import type { SceneLayers } from "../../core/SceneLayers";
import type { FormulaHandle } from "../../layers/FormulaLayer";
import type { Polyline } from "../../primitives/Polyline";
import { Cues } from "../../primitives/Cues";
import { Palette } from "../../primitives/Palette";
import { Diagram, type PanelMesh } from "../../episodes/e01-entropy-information/lib/Diagram";

interface KraftLeaf {
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
  readonly x: number;
  readonly y: number;
  readonly width: number;
}

interface IntervalCell {
  readonly mesh: PanelMesh;
  readonly label: FormulaHandle;
  readonly start: number;
  readonly end: number;
  readonly codeword: string;
  readonly codeLabel: FormulaHandle;
}

export class KraftConstructionScene implements Scene {
  readonly id = "c02-kraft";
  private title!: FormulaHandle;
  private readonly treeBranches: Polyline[] = [];
  private readonly leaves: KraftLeaf[] = [];
  private readonly descendantSlots: PanelMesh[] = [];
  private readonly intervals: IntervalCell[] = [];
  private readonly intervalTicks: Polyline[] = [];
  private readonly formulas: FormulaHandle[] = [];
  private readonly captions: FormulaHandle[] = [];
  private readonly darySlots: PanelMesh[] = [];
  private axis!: Polyline;

  setup(layers: SceneLayers): void {
    const d = new Diagram(layers);
    this.title = d.text("Codeword lengths consume finite capacity in a binary tree", 960, 100, 43);
    const branchPairs: ReadonlyArray<readonly [readonly [number, number], readonly [number, number]]> = [
      [[960, 220], [710, 340]], [[960, 220], [1210, 340]],
      [[710, 355], [585, 475]], [[710, 355], [835, 475]],
      [[1210, 355], [1085, 475]], [[1210, 355], [1335, 475]],
    ];
    for (const [start, end] of branchPairs) this.treeBranches.push(d.line([start, end], Palette.axis, 3));
    const leaves: ReadonlyArray<readonly [number, number, number, string, string]> = [
      [710, 340, 250, "0", Palette.blue],
      [1085, 475, 125, "10", Palette.green],
      [1335, 475, 125, "11", Palette.orange],
    ];
    for (const [x, y, width, label, color] of leaves) {
      this.leaves.push({ mesh: d.rectangle(x, y, width, 58, color), label: d.text(label, x, y, 29, Palette.text), x, y, width });
    }
    for (let i = 0; i < 4; i++) {
      this.descendantSlots.push(d.rectangle(585 + i * 250, 555, 230, 54, [Palette.blue, Palette.blue, Palette.green, Palette.orange][i]));
    }
    this.formulas.push(
      d.tex("\\sum_i2^{-l_i}=2^{-1}+2^{-2}+2^{-2}=1", 960, 650, 39, Palette.yellow),
      d.tex("\\sum_i2^{-l_i}\\le1", 960, 720, 44, Palette.yellow),
      d.tex("\\text{sorted lengths: }(1,2,2)", 960, 260, 34, Palette.text),
      d.tex("[0,1/2)\\quad[1/2,3/4)\\quad[3/4,1)", 960, 550, 36, Palette.green),
      d.tex("0\\qquad10\\qquad11", 960, 630, 34, Palette.yellow),
      d.tex("D\\text{ children at each branch}", 960, 760, 31, Palette.text),
      d.tex("\\text{Feasible lengths do not validate arbitrary labels}", 960, 785, 32, Palette.muted),
    );
    this.axis = d.line([[460, 510], [1460, 510]], Palette.axis, 3);
    this.intervalTicks.push(
      d.line([[460, 485], [460, 535]], Palette.axis, 3),
      d.line([[960, 485], [960, 535]], Palette.axis, 3),
      d.line([[1210, 485], [1210, 535]], Palette.axis, 3),
      d.line([[1460, 485], [1460, 535]], Palette.axis, 3),
    );
    const intervalData: ReadonlyArray<readonly [number, number, string, string]> = [
      [0, 0.5, "0", Palette.blue], [0.5, 0.75, "10", Palette.green], [0.75, 1, "11", Palette.orange],
    ];
    for (const [start, end, codeword, color] of intervalData) {
      const x = 460 + (start + end) * 500;
      const width = (end - start) * 1000;
      this.intervals.push({ mesh: d.rectangle(x, 510, width, 58, color), label: d.text(`[${start}, ${end})`, x, 510, 25, Palette.text), start, end, codeword, codeLabel:d.text(codeword,x,590,36,color) });
    }
    for (let i = 0; i < 3; i++) this.darySlots.push(d.rectangle(690 + i * 190, 500, 150, 56, i === 0 ? Palette.blue : Palette.purple));
    this.captions.push(
      d.text("Depth two has four available descendant slots", 960, 610, 27, Palette.muted),
      d.text("Each assigned interval is a half-open dyadic cell", 960, 600, 27, Palette.muted),
      d.text("For D children per node, replace binary widths by D-adic widths", 960, 635, 26, Palette.muted),
    );
  }

  draw(ctx: SceneContext): void {
    const c = new Cues(ctx, ctx.localTime);
    const tree = c.during(0, 13);
    const construction = c.during(13, 24);
    const dary = c.during(24, 29);
    const criterion = c.p(29);
    this.title.set({ opacity: c.p(0) });
    this.title.setContent(construction > 0.5 ? "Sorted lengths reserve adjacent dyadic intervals" : dary > 0.5 ? "The same capacity rule holds for a D-ary tree" : "Codeword lengths consume finite capacity in a binary tree");
    this.treeBranches.forEach((branch: Polyline): void => branch.setOpacity(tree));
    this.leaves.forEach((leaf: KraftLeaf): void => {
      const opacity = tree;
      Diagram.show(leaf.mesh, opacity);
      leaf.label.set({ opacity, color: "#102237" });
    });
    this.descendantSlots.forEach((slot: PanelMesh, i: number): void => {
      Diagram.show(slot, c.p(4) * (1 - c.p(13)) * (i < 2 ? 1 : 0.28));
    });
    this.formulas[0].set({ opacity: c.p(9) * tree, y: 650 });
    this.formulas[1].set({ opacity: Math.max(c.p(6)*tree, construction, dary, criterion), y: 720 });
    this.formulas[1].setContent(tree>.5&&ctx.localTime<c.s(8)?"2^{L-l}\\ \\text{reserved slots}":tree>.5&&ctx.localTime<c.s(9)?"\\sum_i2^{L-l_i}\\le2^L":dary > 0.5 ? "\\sum_iD^{-l_i}\\le1" : "\\sum_i2^{-l_i}\\le1");
    this.formulas[2].set({ opacity: construction, y: 260 });
    this.axis.setOpacity(construction);
    this.intervals.forEach((interval: IntervalCell,index:number): void => {
      const entered=construction*c.p([15,18,19][index]);
      Diagram.show(interval.mesh, entered);
      interval.label.set({ opacity: entered, color:"#102237" });
      interval.codeLabel.set({opacity:c.p(20)*construction});
    });
    this.intervalTicks.forEach((tick: Polyline): void => tick.setOpacity(construction));
    this.formulas[3].set({ opacity: 0 });
    this.formulas[4].setContent("s_i=\\sum_{j<i}2^{-l_j},\\quad s_i2^{l_i}\\in\\mathbb Z,\\quad[s_i,s_i+2^{-l_i})");
    this.formulas[4].set({ opacity: c.p(17) * construction, y: 650, scale:0.9 });
    this.formulas[5].set({ opacity: dary, y: 620 });
    this.formulas[6].set({ opacity: criterion, y: 795 });
    this.darySlots.forEach((slot: PanelMesh): void => Diagram.show(slot, dary));
    this.captions.forEach((caption: FormulaHandle, i: number): void => caption.set({ y:i===1?370:i===0?610:400, opacity: i === 0 ? c.p(4) * (1 - c.p(13)) : i === 1 ? construction : dary }));
  }

  teardown(_layers: SceneLayers): void {
    this.treeBranches.length = 0;
    this.leaves.length = 0;
    this.descendantSlots.length = 0;
    this.intervals.length = 0;
    this.intervalTicks.length = 0;
    this.formulas.length = 0;
    this.captions.length = 0;
    this.darySlots.length = 0;
  }
}

export function kraftConstructionScene(): Scene {
  return new KraftConstructionScene();
}
