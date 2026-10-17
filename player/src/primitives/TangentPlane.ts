import { Color, DoubleSide, EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, Vector3 } from "three";
import type { StageLayer } from "../layers/StageLayer";

/** Translucent square patch through `point` with unit normal `normal`, half-size `size`. */
export class TangentPlane {
  readonly mesh: Mesh;
  private readonly material: MeshBasicMaterial;
  private readonly edge: LineSegments;
  private readonly edgeMaterial: LineBasicMaterial;

  constructor(stage: StageLayer, color: string, size = 0.8) {
    const geometry = new PlaneGeometry(2 * size, 2 * size);
    this.material = new MeshBasicMaterial({ color: new Color(color), transparent: true, opacity: 0.28,
      side: DoubleSide, depthWrite: false });
    this.mesh = new Mesh(geometry, this.material);
    this.edgeMaterial = new LineBasicMaterial({ color: new Color(color), transparent: true, opacity: 0.8 });
    this.edge = new LineSegments(new EdgesGeometry(geometry), this.edgeMaterial);
    this.mesh.add(this.edge);
    stage.root.add(this.mesh);
  }

  place(point: Vector3, normal: Vector3): void {
    this.mesh.position.copy(point);
    this.mesh.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), normal.clone().normalize()));
  }

  setOpacity(o: number): void {
    this.material.opacity = 0.28 * o;
    this.edgeMaterial.opacity = 0.8 * o;
    this.mesh.visible = o > 0.001;
  }
}
