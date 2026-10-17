import { BoxGeometry, Color, Group, InstancedMesh, Matrix4, MeshBasicMaterial } from "three";
import type { SceneLayers } from "../../../core/SceneLayers";

/** One reproducible possible assignment, used to isolate local and global events. */
export class BinningExperiment {
  private readonly root = new Group();
  private readonly bins: InstancedMesh<BoxGeometry, MeshBasicMaterial>;
  private readonly cards: InstancedMesh<BoxGeometry, MeshBasicMaterial>;
  private readonly assignment: readonly number[];
  private readonly counts: readonly number[];
  private readonly matrix = new Matrix4();

  constructor(layers: SceneLayers) {
    const assignment: number[] = [512, 184, 184];
    let seed = 20261016;
    for (let i = 3; i < 100; i++) {
      seed = (1664525 * seed + 1013904223) >>> 0;
      const candidate = seed % 1000;
      assignment.push(candidate === 512 ? 513 : candidate);
    }
    const counts = Array<number>(1000).fill(0);
    assignment.forEach((bin: number): void => { counts[bin]++; });
    this.assignment = assignment;
    this.counts = counts;
    this.bins = new InstancedMesh(new BoxGeometry(.235, .145, .015), new MeshBasicMaterial({ transparent: true }), 1000);
    this.cards = new InstancedMesh(new BoxGeometry(.12, .10, .025), new MeshBasicMaterial({ transparent: true }), 100);
    for (let i = 0; i < 1000; i++) {
      this.matrix.makeTranslation((750 + i % 40 * 26 - 960) / 100, (540 - 245 - Math.floor(i / 40) * 19) / 100, 0);
      this.bins.setMatrixAt(i, this.matrix);
      this.bins.setColorAt(i, new Color(i === 512 ? "#345a46" : counts[i] > 1 ? "#705037" : "#243449"));
    }
    this.root.add(this.bins, this.cards);
    layers.stage.root.add(this.root);
  }

  draw(progress: number, opacity: number, compact = 0): void {
    const scale = 1 - .35 * compact;
    this.root.scale.set(scale, scale, 1);
    this.root.position.set(-6.485 * compact, -.036 * compact, 0);
    this.root.visible = opacity > .001;
    this.bins.material.opacity = opacity * (.25 + .55 * progress);
    this.cards.material.opacity = opacity;
    const orange = new Color("#f5ac61"), green = new Color("#6ee2ad"), blue = new Color("#83b8ef");
    for (let i = 0; i < 100; i++) {
      const bin = this.assignment[i];
      const p = Math.max(0, Math.min(1, progress * 1.5 - i * .005));
      const smooth = p * p * (3 - 2 * p);
      const x0 = 155 + i % 10 * 44, y0 = 285 + Math.floor(i / 10) * 43;
      const sameBinBefore = this.assignment.slice(0, i).filter((other: number): boolean => other === bin).length;
      const x1 = 750 + bin % 40 * 26 + sameBinBefore * 4;
      const y1 = 245 + Math.floor(bin / 40) * 19 - sameBinBefore * 4;
      const x = x0 + (x1 - x0) * smooth, y = y0 + (y1 - y0) * smooth - Math.sin(Math.PI * smooth) * (55 + i % 5 * 12);
      const scale = (i === 0 ? 2.0 : 1.5) * (1 - smooth) + smooth;
      this.matrix.makeScale(scale, scale, 1);
      this.matrix.setPosition((x - 960) / 100, (540 - y) / 100, .04 + i * .0001);
      this.cards.setMatrixAt(i, this.matrix);
      this.cards.setColorAt(i, i === 0 ? green : this.counts[bin] > 1 && progress > .95 ? orange : blue);
    }
    this.cards.instanceMatrix.needsUpdate = true;
    if (this.cards.instanceColor) this.cards.instanceColor.needsUpdate = true;
  }
}
