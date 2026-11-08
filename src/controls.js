// SketchUp style navigation for an orthographic camera:
// drag to orbit, right drag or shift drag to pan, wheel zooms toward the cursor.
import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export class Nav {
  constructor(camera, dom) {
    this.camera = camera;
    this.dom = dom;
    this.target = new THREE.Vector3(0, 4, 0);
    this.theta = Math.PI * 0.25;
    this.phi = Math.PI * 0.32;
    this.zoom = 0.62;
    this.dist = 220;
    this.minZoom = 0.08;
    this.maxZoom = 8;

    this._pointers = new Map();
    this._mode = null;
    this._last = { x: 0, y: 0 };
    this._pinch = 0;
    this._moved = 0;
    this._raycaster = new THREE.Raycaster();
    this._plane = new THREE.Plane();
    this._ndc = new THREE.Vector2();
    this._tmp = new THREE.Vector3();

    this.onPick = null;
    this.onHover = null;
    this.onChange = null;

    this._bind();
    this.apply();
  }

  /* ---------------- geometry helpers ---------------- */

  apply() {
    const d = this.dist;
    this.camera.position.set(
      this.target.x + d * Math.sin(this.phi) * Math.cos(this.theta),
      this.target.y + d * Math.cos(this.phi),
      this.target.z + d * Math.sin(this.phi) * Math.sin(this.theta)
    );
    this.camera.zoom = this.zoom;
    this.camera.lookAt(this.target);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    if (this.onChange) this.onChange();
  }

  worldPerPixel() {
    const c = this.camera;
    return (c.top - c.bottom) / c.zoom / this.dom.clientHeight;
  }

  ndcFromEvent(e) {
    const r = this.dom.getBoundingClientRect();
    this._ndc.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
    return this._ndc;
  }

  worldAt(ndc) {
    const c = this.camera;
    this._raycaster.setFromCamera(ndc, c);
    const n = new THREE.Vector3();
    c.getWorldDirection(n);
    this._plane.setFromNormalAndCoplanarPoint(n, this.target);
    const hit = this._raycaster.ray.intersectPlane(this._plane, new THREE.Vector3());
    return hit || null;
  }

  /* ---------------- public moves ---------------- */

  setTarget(v) {
    this.target.copy(v);
    this.apply();
  }

  focus(v, zoom) {
    this.target.copy(v);
    if (zoom) this.zoom = clamp(zoom, this.minZoom, this.maxZoom);
    this.apply();
  }

  fit(radius = 46, center = new THREE.Vector3(0, 6, 0)) {
    this.target.copy(center);
    const span = this.camera.top - this.camera.bottom;
    this.zoom = clamp(span / (radius * 2.2), this.minZoom, this.maxZoom);
    this.theta = Math.PI * 0.25;
    this.phi = Math.PI * 0.32;
    this.apply();
  }

  view(name) {
    const p = { iso: [0.25, 0.32], top: [0, 0.02], front: [0, 0.5], right: [Math.PI / 2, 0.5] }[name];
    if (!p) return;
    this.theta = Math.PI * p[0] * 2;
    this.phi = Math.PI * p[1];
    this.apply();
  }

  pan(dx, dy) {
    const s = this.worldPerPixel();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    this.camera.matrixWorld.extractBasis(right, up, new THREE.Vector3());
    right.normalize().multiplyScalar(-dx * s);
    up.normalize().multiplyScalar(dy * s);
    this.target.add(right).add(up);
    this.apply();
  }

  zoomTo(ndc, factor) {
    const before = this.worldAt(ndc.clone());
    const z = clamp(this.zoom * factor, this.minZoom, this.maxZoom);
    if (z === this.zoom) return;
    this.zoom = z;
    this.apply();
    const after = this.worldAt(ndc.clone());
    if (before && after) {
      this.target.add(before.sub(after));
      this.apply();
    }
  }

  /* ---------------- events ---------------- */

  _bind() {
    const el = this.dom;
    el.style.touchAction = 'none';

    el.addEventListener('contextmenu', (e) => e.preventDefault());

    el.addEventListener('pointerdown', (e) => {
      el.setPointerCapture(e.pointerId);
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this._moved = 0;
      if (this._pointers.size === 2) {
        const [a, b] = [...this._pointers.values()];
        this._pinch = Math.hypot(a.x - b.x, a.y - b.y);
        this._mode = 'pinch';
      } else if (e.button === 2 || e.shiftKey || e.ctrlKey) {
        this._mode = 'pan';
      } else if (e.button === 1) {
        this._mode = 'orbit';
      } else {
        this._mode = e.pointerType === 'touch' ? 'orbit' : 'orbit';
      }
      this._last = { x: e.clientX, y: e.clientY };
    });

    el.addEventListener('pointermove', (e) => {
      if (this._pointers.has(e.pointerId)) {
        this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      const dx = e.clientX - this._last.x;
      const dy = e.clientY - this._last.y;

      if (!this._mode) {
        if (this.onHover) this.onHover(e);
        return;
      }
      this._moved += Math.abs(dx) + Math.abs(dy);
      this._last = { x: e.clientX, y: e.clientY };

      if (this._mode === 'pinch' && this._pointers.size === 2) {
        const [a, b] = [...this._pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (this._pinch > 0) this.zoomTo(this.ndcFromEvent(e), d / this._pinch);
        this._pinch = d;
        const mx = (a.x + b.x) / 2 - (this._last.x || 0);
        return;
      }

      if (this._mode === 'pan') {
        this.pan(dx, dy);
      } else {
        this.theta -= dx * 0.006;
        this.phi = clamp(this.phi - dy * 0.006, 0.06, Math.PI * 0.49);
        this.apply();
      }
    });

    const end = (e) => {
      this._pointers.delete(e.pointerId);
      if (this._mode === 'orbit' && this._moved < 6 && this.onPick) this.onPick(e);
      if (this._pointers.size === 0) {
        this._mode = null;
        this._pinch = 0;
      }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const f = Math.pow(0.9994, e.deltaY * (e.deltaMode === 1 ? 16 : 1));
      this.zoomTo(this.ndcFromEvent(e), f);
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      const step = 40 * this.worldPerPixel();
      if (e.key === 'f' || e.key === 'F') this.fit();
      if (e.key === 'ArrowLeft') this.pan(-step * 10, 0);
      if (e.key === 'ArrowRight') this.pan(step * 10, 0);
      if (e.key === 'ArrowUp') this.pan(0, -step * 10);
      if (e.key === 'ArrowDown') this.pan(0, step * 10);
    });
  }
}
