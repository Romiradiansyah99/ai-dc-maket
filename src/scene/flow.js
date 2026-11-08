// Animated flow along the real connection geometry.
//
// The walkthrough does not invent a path: each stage is handed the actual polyline
// of the cable or pipe it represents, taken from the cable and pipe layers. The
// glowing line therefore sits inside the cable it is describing, and the travelling
// pulse follows the tray, the riser and the drop exactly as they are installed.
import * as THREE from 'three';

const PULSE_R = 0.17;
const pulseGeo = new THREE.SphereGeometry(PULSE_R, 8, 6);

// Replace each corner with a short fillet and resample, so a spline through the
// result stays on the cable instead of cutting across the bend.
function fillet(points, radius = 0.45) {
  const pts = points.map((p) => (p.isVector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2])));
  if (pts.length < 3) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1], corner = pts[i], next = pts[i + 1];
    const inDir = corner.clone().sub(prev);
    const outDir = next.clone().sub(corner);
    const inLen = inDir.length(), outLen = outDir.length();
    if (inLen < 0.01 || outLen < 0.01) { out.push(corner); continue; }
    const r = Math.min(radius, inLen * 0.45, outLen * 0.45);
    const a = corner.clone().addScaledVector(inDir.normalize(), -r);
    const b = corner.clone().addScaledVector(outDir.normalize(), r);
    out.push(a);
    // quadratic through the original corner keeps the bend tight to the geometry
    const m = a.clone().lerp(corner, 0.5).lerp(b.clone().lerp(corner, 0.5), 0.5);
    out.push(m);
    out.push(b);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function resample(pts, step = 0.6) {
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = out[out.length - 1], b = pts[i];
    const len = a.distanceTo(b);
    const n = Math.max(1, Math.ceil(len / step));
    for (let k = 1; k <= n; k++) out.push(a.clone().lerp(b, k / n));
  }
  return out;
}

function curveFrom(points) {
  const pts = points.map((p) => (p.isVector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2])));
  if (pts.length < 2) return null;
  const dense = resample(fillet(pts));
  if (dense.length < 2) return null;
  // tension 0 keeps the spline on the polyline; anything looser bulges off the cable
  return new THREE.CatmullRomCurve3(dense, false, 'catmullrom', 0.02);
}

export class FlowLayer {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.name = 'flow';
    scene.add(this.group);
    this.curves = [];
    this.segments = [];
    this.halos = [];
    this.pulses = [];
    this.color = '#1F4E8C';
    this.step = -1;
    this.visible = false;
    this.flow = null;
  }

  clear() {
    while (this.group.children.length) {
      const c = this.group.children.pop();
      if (c.geometry) c.geometry.dispose();
      if (c.material && c.material.dispose) c.material.dispose();
    }
    this.curves = [];
    this.segments = [];
    this.halos = [];
    this.pulses = [];
  }

  // segments: [{ points: [[x,y,z]...], connected: bool }]
  build(flow, segments) {
    this.clear();
    this.flow = flow;
    this.color = flow.color;
    const col = new THREE.Color(flow.color);
    this.curves = [];

    for (let i = 0; i < segments.length; i++) {
      const s = segments[i] || {};
      const curve = curveFrom(s.points || []);
      this.curves.push(curve);
      if (!curve) continue;

      const len = curve.getLength();

      const halo = new THREE.Mesh(
        new THREE.TubeGeometry(curve, Math.min(300, 24 + Math.round(len * 2)), 0.3, 8, false),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
      );
      halo.userData.seg = i;
      halo.renderOrder = 2;
      this.halos.push(halo);
      this.group.add(halo);

      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, Math.min(300, 24 + Math.round(len * 2)), 0.17, 6, false),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.16, depthWrite: false })
      );
      tube.userData.seg = i;
      tube.userData.mid = curve.getPoint(0.5).clone();
      tube.userData.length = len;
      tube.renderOrder = 3;
      this.segments.push(tube);
      this.group.add(tube);
    }

    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }));
      m.userData.phase = i / 3;
      m.renderOrder = 4;
      this.pulses.push(m);
      this.group.add(m);
    }

    this.setStep(-1);
    this.visible = true;
    this.group.visible = true;
  }

  setStep(i) {
    this.step = i;
    this.segments.forEach((s) => {
      const seg = s.userData.seg;
      s.material.opacity = i < 0 ? 0.2 : seg <= i ? (seg === i ? 1 : 0.62) : 0.06;
    });
    this.halos.forEach((h) => {
      const seg = h.userData.seg;
      h.material.opacity = i < 0 ? 0 : seg <= i ? (seg === i ? 0.75 : 0.28) : 0;
    });
  }

  // where the camera and the label should aim for stage i
  anchorAt(i) {
    const s = this.segments.find((x) => x.userData.seg === i);
    if (!s) return null;
    return { mid: s.userData.mid.clone(), length: s.userData.length };
  }

  segmentCount() {
    return this.segments.length;
  }

  setVisible(v) {
    this.visible = v;
    this.group.visible = v;
  }

  update(t) {
    if (!this.visible) return;
    const active = this.step;
    const curve = active >= 0 ? this.curves[active] : null;
    this.pulses.forEach((p, idx) => {
      if (!curve) { p.visible = false; return; }
      const u = (t * 0.42 + p.userData.phase) % 1;
      const pos = curve.getPoint(u);
      p.position.copy(pos);
      // white core with the flow colour pulsing behind it
      p.scale.setScalar(0.85 + 0.25 * Math.sin((t * 6 + idx) % (Math.PI * 2)));
      p.material.color.copy(new THREE.Color(this.color)).lerp(new THREE.Color(0xffffff), 0.55);
      p.visible = true;
    });
  }
}
