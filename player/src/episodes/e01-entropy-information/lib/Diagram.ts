import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three";
import type { SceneLayers } from "../../../core/SceneLayers";
import type { FormulaHandle } from "../../../layers/FormulaLayer";
import { Polyline } from "../../../primitives/Polyline";
import { Palette } from "../../../primitives/Palette";

export type PanelMesh = Mesh<BoxGeometry, MeshBasicMaterial>;

/** Pixel-coordinate construction helpers; scene classes own all animated state. */
export class Diagram {
  constructor(private readonly layers: SceneLayers) {
    layers.stage.setView2D(0, 0, 10.8);
  }

  text(content: string, x: number, y: number, size = 36, color: string = Palette.text): FormulaHandle {
    return this.layers.formulas.add({ text: content, x, y, size, color, opacity: 0 });
  }

  tex(content: string, x: number, y: number, size = 36, color: string = Palette.text): FormulaHandle {
    return this.layers.formulas.add({ tex: content, x, y, size, color, opacity: 0 });
  }

  rectangle(x: number, y: number, width: number, height: number, color: string = Palette.panel): PanelMesh {
    const mesh = new Mesh(new BoxGeometry(width / 100, height / 100, 0.02), new MeshBasicMaterial({ color, transparent: true, opacity: 0 }));
    mesh.position.set((x - 960) / 100, (540 - y) / 100, 0);
    this.layers.stage.root.add(mesh);
    return mesh;
  }

  line(points: ReadonlyArray<readonly [number, number]>, color: string = Palette.axis, width = 3): Polyline {
    return new Polyline(this.layers.stage, points.map(([x, y]): Vector3 => new Vector3((x - 960) / 100, (540 - y) / 100, 0)), { color, width, opacity: 0 });
  }

  static show(mesh: PanelMesh, opacity: number): void {
    mesh.material.opacity = Math.max(0, Math.min(1, opacity));
    mesh.visible = opacity > 0.001;
  }

  static bar(mesh: PanelMesh, x: number, baseline: number, height: number, opacity: number): void {
    mesh.scale.y = Math.max(0.001, height);
    mesh.position.set((x - 960) / 100, (540 - baseline + height / 2) / 100, 0);
    Diagram.show(mesh, opacity);
  }
}
