import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
import type { StageLayer } from "../layers/StageLayer";

/** Parametric surface (u, v) in [0,1]^2 -> R^3, shaded, optionally with a wireframe overlay. */
export class Surface {
  readonly mesh: Mesh;
  private readonly material: MeshStandardMaterial;
  private readonly wire: LineSegments | null;
  private readonly wireMaterial: LineBasicMaterial | null;

  constructor(stage: StageLayer, fn: (u: number, v: number, target: Vector3) => void, color: string,
              opts: { segments?: number; opacity?: number; wireframe?: boolean; wireColor?: string; isoU?: number; isoV?: number } = {}) {
    const seg = opts.segments ?? 96;
    const geometry = new ParametricGeometry(fn, seg, seg);
    this.material = new MeshStandardMaterial({ color: new Color(color), roughness: 0.55, metalness: 0.05,
      side: DoubleSide, transparent: true, opacity: opts.opacity ?? 0.85, depthWrite: (opts.opacity ?? 0.85) > 0.95 });
    this.mesh = new Mesh(geometry, this.material);
    stage.root.add(this.mesh);
    if (opts.wireframe) {
      const wireGeom = isoLineGeometry(fn, opts.isoU ?? 24, opts.isoV ?? 12);
      this.wireMaterial = new LineBasicMaterial({ color: new Color(opts.wireColor ?? "#ffffff"), transparent: true, opacity: 0.15 });
      this.wire = new LineSegments(wireGeom, this.wireMaterial);
      stage.root.add(this.wire);
    } else {
      this.wire = null;
      this.wireMaterial = null;
    }
  }

  setOpacity(o: number): void {
    this.material.opacity = o * 0.85;
    this.mesh.visible = o > 0.001;
    if (this.wire && this.wireMaterial) {
      this.wireMaterial.opacity = 0.15 * o;
      this.wire.visible = o > 0.001;
    }
  }
}

/** Iso-parameter lines: `nu` lines of constant u and `nv` lines of constant v (no triangulation diagonals). */
function isoLineGeometry(fn: (u: number, v: number, target: Vector3) => void, nu: number, nv: number): BufferGeometry {
  const pts: number[] = [];
  const a = new Vector3();
  const b = new Vector3();
  const steps = 64;
  for (let i = 0; i <= nu; i++) {
    const u = i / nu;
    for (let k = 0; k < steps; k++) {
      fn(u, k / steps, a);
      fn(u, (k + 1) / steps, b);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  for (let j = 1; j < nv; j++) {
    const v = j / nv;
    for (let k = 0; k < steps; k++) {
      fn(k / steps, v, a);
      fn((k + 1) / steps, v, b);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return geometry;
}

/** Unit sphere surface centered at the origin. */
export function sphereFn(radius = 1): (u: number, v: number, target: Vector3) => void {
  return (u, v, target) => {
    const theta = u * 2 * Math.PI;
    const phi = v * Math.PI;
    target.set(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi));
  };
}
