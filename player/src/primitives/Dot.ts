import { CircleGeometry, Color, Mesh, MeshBasicMaterial, RingGeometry, SphereGeometry, Vector3 } from "three";
import type { StageLayer } from "../layers/StageLayer";

/** A filled point. In 2D a disc of radius `radius` world units; in 3D a small sphere. */
export class Dot {
  readonly object: Mesh;
  private readonly material: MeshBasicMaterial;

  constructor(stage: StageLayer, position: Vector3, color: string, radius = 0.08, mode: "2d" | "3d" = "2d", hollow = false) {
    this.material = new MeshBasicMaterial({ color: new Color(color), transparent: true, opacity: 1 });
    const geometry = mode === "2d"
      ? (hollow ? new RingGeometry(radius * 0.6, radius, 40) : new CircleGeometry(radius, 40))
      : new SphereGeometry(radius, 24, 16);
    this.object = new Mesh(geometry, this.material);
    this.object.position.copy(position);
    this.object.renderOrder = 10;
    stage.root.add(this.object);
  }

  setPosition(p: Vector3): void {
    this.object.position.copy(p);
  }

  setOpacity(o: number): void {
    this.material.opacity = Math.max(0, Math.min(1, o));
    this.object.visible = this.material.opacity > 0.001;
  }

  setScale(s: number): void {
    this.object.scale.setScalar(s);
  }

  setColor(color: string): void {
    this.material.color.set(color);
  }
}
