// Drawing kit: merges primitives into a few draw calls and draws the pencil outline.
import * as THREE from 'three';

export const C = {
  ink: 0x1B2430,
  paper: 0xFBFCFE,
  fill: 0xE2EAF4,
  fill2: 0xD3DEEE,
  steel: 0xB6C5D8,
  dark: 0x74859B,
  accent: 0x2E6FD0,
  teal: 0x0E7E88,
  alarm: 0xA31621,
  white: 0xFFFFFF,
  ghost: 0xC2D2E4,
  copper: 0xB4713C
};

const matCache = new Map();
export function mat(color) {
  if (!matCache.has(color)) {
    const m = new THREE.MeshLambertMaterial({ color });
    if (color === C.ghost) {
      m.transparent = true;
      m.opacity = 0.22;
      m.depthWrite = false;
    }
    matCache.set(color, m);
  }
  return matCache.get(color);
}

export const lineMat = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.72 });

export function pencilEdges(geo, amp = 0.012, seg = 3) {
  const eg = new THREE.EdgesGeometry(geo, 22);
  const src = eg.attributes.position.array;
  const out = [];
  for (let i = 0; i < src.length; i += 6) {
    const ax = src[i], ay = src[i + 1], az = src[i + 2];
    const bx = src[i + 3], by = src[i + 4], bz = src[i + 5];
    let px = ax, py = ay, pz = az;
    for (let s = 1; s <= seg; s++) {
      const t = s / seg;
      let x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t;
      if (s < seg) {
        x += Math.sin((x * 3.1 + y * 5.7 + z * 2.3) * 6.1) * amp;
        y += Math.cos((y * 4.2 + x * 1.9 + z * 3.3) * 5.4) * amp;
        z += Math.sin((z * 5.1 - y * 2.7 + x * 1.3) * 6.7) * amp;
      }
      out.push(px, py, pz, x, y, z);
      px = x; py = y; pz = z;
    }
  }
  eg.dispose();
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  return g;
}

function mergeSolid(geos) {
  const items = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0;
  for (const g of items) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of items) {
    pos.set(g.attributes.position.array, o * 3);
    if (g.attributes.normal) nor.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}

function mergeLines(geos) {
  let n = 0;
  for (const g of geos) n += g.attributes.position.array.length;
  const pos = new Float32Array(n);
  let o = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, o);
    o += g.attributes.position.array.length;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return out;
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _v = new THREE.Vector3();

export class Builder {
  constructor(seg = 3) {
    this.seg = seg;
    this.parts = new Map();
    this.lines = [];
  }

  addGeo(geo, color, o = {}) {
    const pos = o.pos || [0, 0, 0];
    const rot = o.rot || [0, 0, 0];
    _e.set(rot[0], rot[1], rot[2]);
    _q.setFromEuler(_e);
    _v.set(pos[0], pos[1], pos[2]);
    _m.compose(_v, _q, { x: 1, y: 1, z: 1 });
    const g = geo.clone().applyMatrix4(_m);
    if (o.edge !== false) this.lines.push(pencilEdges(g, o.amp ?? 0.01, o.seg ?? this.seg));
    if (!this.parts.has(color)) this.parts.set(color, []);
    this.parts.get(color).push(g);
    return this;
  }

  box(w, h, d, color, o = {}) {
    return this.addGeo(new THREE.BoxGeometry(w, h, d), color, o);
  }

  cyl(r, len, color, o = {}) {
    const g = new THREE.CylinderGeometry(o.r2 ?? r, r, len, o.sides ?? 12, 1, false);
    let rot = o.rot || [0, 0, 0];
    if (o.axis === 'x') rot = [0, 0, Math.PI / 2];
    if (o.axis === 'z') rot = [Math.PI / 2, 0, 0];
    return this.addGeo(g, color, { ...o, rot });
  }

  pipe(points, r, color, o = {}) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.1);
    const g = new THREE.TubeGeometry(curve, Math.max(8, points.length * 6), r, 8, false);
    return this.addGeo(g, color, { ...o, edge: o.edge ?? false });
  }

  finish() {
    const group = new THREE.Group();
    for (const [color, geos] of this.parts) {
      const mesh = new THREE.Mesh(mergeSolid(geos), mat(color));
      mesh.userData.baseColor = color;
      group.add(mesh);
    }
    if (this.lines.length) {
      group.add(new THREE.LineSegments(mergeLines(this.lines), lineMat));
    }
    return group;
  }
}
