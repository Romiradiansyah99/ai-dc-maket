// Animated flow paths for the guided walkthroughs.
import * as THREE from 'three';

const pulseGeo = new THREE.SphereGeometry(0.18, 8, 6);

function route(a, b) {
  const lift = 4.4;
  const mid = a.clone().lerp(b, 0.5);
  const p0 = a.clone();
  const p1 = a.clone(); p1.y += lift;
  const p2 = b.clone(); p2.y += lift;
  const p3 = b.clone();
  const pts = [p0, p1, mid.clone().setY(p0.y + lift + 0.6), p2, p3];
  return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.15);
}

export class FlowLayer {
  constructor(scene) {
    this.group = new THREE.Group();
    this.group.name = 'flow';
    scene.add(this.group);
    this.curves = [];
    this.pulses = [];
    this.segments = [];
    this.halos = [];
    this.color = '#1F4E8C';
    this.step = -1;
    this.visible = false;
  }

  clear() {
    while (this.group.children.length) {
      const c = this.group.children.pop();
      if (c.geometry) c.geometry.dispose();
      if (c.material && c.material.dispose) c.material.dispose();
    }
    this.curves = [];
    this.pulses = [];
    this.segments = [];
    this.halos = [];
  }

  build(flow, anchors) {
    this.clear();
    this.color = flow.color;
    const col = new THREE.Color(flow.color);
    this.flow = flow;
    const pts = flow.nodes.map((n) => anchors[n.k]).filter(Boolean);

    for (let i = 0; i < pts.length - 1; i++) {
      const curve = route(pts[i], pts[i + 1]);
      this.curves.push(curve);
      // white halo first so the coloured tube stays readable over teal pipes
      const halo = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 44, 0.26, 8, false),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false })
      );
      halo.userData.seg = i;
      this.halos.push(halo);
      this.group.add(halo);

      const seg = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 44, 0.13, 6, false),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.14 })
      );
      seg.userData.seg = i;
      this.segments.push(seg);
      this.group.add(seg);
    }

    // travelling pulses along the whole chain
    const count = 14;
    for (let i = 0; i < count; i++) {
      const m = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 }));
      m.userData.offset = i / count;
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
      const on = i < 0 ? 0.16 : s.userData.seg <= i ? 0.92 : 0.1;
      s.material.opacity = on;
    });
    this.halos.forEach((h) => {
      h.material.opacity = i < 0 ? 0 : h.userData.seg <= i ? 0.62 : 0;
    });
  }

  setVisible(v) {
    this.visible = v;
    this.group.visible = v;
  }

  update(t) {
    if (!this.visible || !this.curves.length) return;
    const total = this.curves.length;
    const limit = this.step < 0 ? total : this.step + 1;
    this.pulses.forEach((p, idx) => {
      const u = (t * 0.28 + p.userData.offset) % 1;
      const f = u * limit;
      const seg = Math.min(limit - 1, Math.floor(f));
      const local = Math.min(0.999, f - seg);
      const c = this.curves[seg];
      if (c) {
        const pos = c.getPoint(local);
        p.position.copy(pos);
        p.visible = true;
        p.material.opacity = this.step < 0 ? 0.55 : (seg <= this.step ? 0.95 : 0.15);
      } else {
        p.visible = false;
      }
      void idx;
    });
  }
}
