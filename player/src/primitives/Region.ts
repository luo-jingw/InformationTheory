import { Color, DoubleSide, Mesh, MeshBasicMaterial, Shape, ShapeGeometry, Vector2, Vector3 } from "three";
import type { StageLayer } from "../layers/StageLayer";

/** Filled polygon in the z=0 plane (open sets, balls, chart domains). */
export class Region {
  readonly object: Mesh;
  private readonly material: MeshBasicMaterial;

  constructor(stage: StageLayer, points: Vector3[], color: string, opacity = 0.25, z = -0.01) {
    this.material = new MeshBasicMaterial({ color: new Color(color), transparent: true, opacity,
      depthWrite: false, side: DoubleSide });
    this.object = new Mesh(this.makeGeometry(points), this.material);
    this.object.position.z = z;
    stage.root.add(this.object);
  }

  private makeGeometry(points: Vector3[]): ShapeGeometry {
    return new ShapeGeometry(new Shape(points.map((p) => new Vector2(p.x, p.y))));
  }

  setPoints(points: Vector3[]): void {
    this.object.geometry.dispose();
    this.object.geometry = this.makeGeometry(points);
  }

  setOpacity(o: number): void {
    this.material.opacity = Math.max(0, o);
    this.object.visible = o > 0.001;
  }

  setColor(color: string): void {
    this.material.color.set(color);
  }
}
