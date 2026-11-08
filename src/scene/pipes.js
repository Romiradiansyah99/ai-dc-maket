// Builds the piping layer: process and fire pipe runs with insulation, flanges,
// valves, supports and floor penetrations, routed between the real equipment.
//
// A pipe leaves the equipment, rises or drops to its run elevation, turns on the
// two axes, and lands on the far connection. Risers are vertical runs that pass
// through a floor, so every one of them gets a sleeve at the slab.
import * as THREE from 'three';
import { Builder, C } from './kit.js';
import { LEVELS } from '../data/layout.js';
import { PIPES, SERVICE } from '../data/pipes.js';

const floorY = (id) => (LEVELS.find((l) => l.id === id) || LEVELS[0]).y;
const BASE_COLOR = 0xB6C5D8;

function terminationOf(site, key, index) {
  const list = site.byKey[key];
  if (!list || !list.length) return null;
  const it = list[Math.min(index || 0, list.length - 1)];
  if (!it || !it.group) return null;
  const box = new THREE.Box3().setFromObject(it.group);
  const c = box.getCenter(new THREE.Vector3());
  return new THREE.Vector3(c.x, box.max.y + 0.02, c.z);
}

function orthoPath(points) {
  const out = [points[0].clone()];
  for (let i = 1; i < points.length; i++) {
    const a = out[out.length - 1];
    const b = points[i];
    const dx = Math.abs(b.x - a.x), dz = Math.abs(b.z - a.z), dy = Math.abs(b.y - a.y);
    if (dx > 0.25 && dz > 0.25 && dy < 0.25) {
      if (dx >= dz) out.push(new THREE.Vector3(b.x, a.y, a.z));
      else out.push(new THREE.Vector3(a.x, a.y, b.z));
    }
    out.push(b.clone());
  }
  return out;
}

function routeFor(site, def) {
  const a = terminationOf(site, def.from, def.fromIndex);
  const b = terminationOf(site, def.to, def.toIndex);
  if (!a || !b) return null;

  const buried = def.elev === 'buried';
  const fy = floorY((site.byKey[def.from][0] || {}).floor || 'L0');
  const elev = buried ? 0.7 : fy + (def.elev || 1.6);
  const start = buried ? new THREE.Vector3(a.x, 0.7, a.z) : a.clone();
  const end = buried ? new THREE.Vector3(b.x, 0.7, b.z) : b.clone();

  let raw;
  if (def.via && def.via.length) {
    raw = [start, ...def.via.map((p) => new THREE.Vector3(p[0], p[1], p[2])), end];
  } else {
    raw = [
      start,
      new THREE.Vector3(start.x, elev, start.z),
      new THREE.Vector3(end.x, elev, start.z),
      new THREE.Vector3(end.x, elev, end.z),
      new THREE.Vector3(end.x, end.y, end.z)
    ];
    if (Math.abs(start.x - end.x) < 0.3) raw[2].x = start.x;
  }

  const pts = orthoPath(raw);
  const clean = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].distanceTo(clean[clean.length - 1]) > 0.08) clean.push(pts[i]);
  }
  let length = 0;
  for (let i = 1; i < clean.length; i++) length += clean[i].distanceTo(clean[i - 1]);
  return { points: clean, length };
}

// Insulated pipe: a core tube, a sleeve, and a flange pair every few metres.
function addRun(b, points, r, color, insulated) {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], c = points[i];
    if (a.distanceTo(c) < 0.05) continue;
    // rounded corner: a short cubic through the bend
    b.pipe([[a.x, a.y, a.z], [c.x, c.y, c.z]], r, color);
    if (insulated) b.pipe([[a.x, a.y, a.z], [c.x, c.y, c.z]], r * 1.35, C.ghost);
  }
}

function addFlanges(b, points, r, step = 6) {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], c = points[i];
    const len = a.distanceTo(c);
    if (len < 2) continue;
    const dir = new THREE.Vector3().subVectors(c, a).normalize();
    const horizontal = Math.abs(dir.y) < 0.4;
    for (let d = step / 2; d < len; d += step) {
      const p = a.clone().addScaledVector(dir, d);
      const axis = Math.abs(dir.x) > Math.abs(dir.z) ? 'x' : (horizontal ? 'z' : 'y');
      b.cyl(r * 1.45, 0.05, C.dark, { pos: [p.x, p.y, p.z], axis, edge: false });
    }
  }
}

function addValve(b, p, r, dir) {
  const axis = Math.abs(dir.x) > Math.abs(dir.z) ? 'x' : 'z';
  b.cyl(r * 1.9, r * 1.1, C.dark, { pos: [p.x, p.y, p.z], axis, edge: true, amp: 0.002 });
  // stem and handwheel, the detail that says valve rather than lump
  b.cyl(0.03, 0.32, C.dark, { pos: [p.x, p.y + 0.16 + r, p.z], edge: false });
  b.cyl(0.14, 0.03, C.alarm, { pos: [p.x, p.y + 0.33 + r, p.z], edge: false });
}

function addHanger(b, p, ceilY, r) {
  if (!ceilY || ceilY <= p.y + 0.3) return;
  const len = ceilY - p.y;
  for (const s of [-1, 1]) {
    b.cyl(0.022, len, C.dark, { pos: [p.x + s * r * 1.8, p.y + len / 2, p.z], edge: false, sides: 6 });
  }
  b.box(r * 4.4, 0.05, 0.05, C.dark, { pos: [p.x, p.y + 0.02, p.z], edge: false });
}

// Where a pipe passes a slab, show the sleeve. This is what makes a riser read.
function addSleeves(b, points) {
  for (const lv of LEVELS) {
    if (lv.y <= 0) continue;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], c = points[i];
      const lo = Math.min(a.y, c.y), hi = Math.max(a.y, c.y);
      if (lv.y < lo - 0.05 || lv.y > hi + 0.05) continue;
      const t = (lv.y - a.y) / (c.y - a.y || 1);
      const x = a.x + (c.x - a.x) * t, z = a.z + (c.z - a.z) * t;
      b.box(0.62, 0.09, 0.62, C.dark, { pos: [x, lv.y + 0.02, z], edge: true, amp: 0.002 });
    }
  }
}

function buildOne(site, def) {
  const route = routeFor(site, def);
  if (!route) return null;
  const { points, length } = route;
  const b = new Builder(2);
  const svc = SERVICE[def.service] || SERVICE.chws;
  const r = Math.max(0.06, (def.dn || 150) / 1400);
  const insulated = !/none/i.test(def.insulation || '');
  const ceilY = floorY((site.byKey[def.from][0] || {}).floor || 'L0') + 5.85;

  addRun(b, points, r, svc.color, insulated);
  addFlanges(b, points, r);

  // parallel return leg, offset to one side, which is how plant rooms are built
  if (def.pair) {
    const pairSvc = SERVICE[def.pair] || svc;
    const off = r * 3.1;
    // offset perpendicular to the route, so the two legs stay parallel instead of
    // crossing over each other at every bend
    const first = points[0], last = points[points.length - 1];
    const alongX = Math.abs(last.x - first.x) >= Math.abs(last.z - first.z);
    const shifted = points.map((p) => (alongX
      ? new THREE.Vector3(p.x, p.y, p.z + off)
      : new THREE.Vector3(p.x + off, p.y, p.z)));
    addRun(b, shifted, r, pairSvc.color, insulated);
    addFlanges(b, shifted, r);
  }

  // valves at both ends
  for (const [i, p] of [[0, points[0]], [points.length - 1, points[points.length - 1]]]) {
    const nb = points[i === 0 ? 1 : points.length - 2];
    if (!nb) continue;
    const dir = new THREE.Vector3().subVectors(nb, p).normalize();
    if (Math.abs(dir.y) < 0.7) addValve(b, p, r, dir);
  }

  // supports and penetrations
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], c = points[i];
    const horiz = Math.hypot(c.x - a.x, c.z - a.z);
    if (horiz > 3 && Math.abs(c.y - a.y) < 0.2) {
      const n = Math.max(1, Math.round(horiz / 3.2));
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1);
        addHanger(b, new THREE.Vector3(a.x + (c.x - a.x) * t, a.y, a.z + (c.z - a.z) * t), ceilY, r);
      }
    }
  }
  addSleeves(b, points);

  const group = b.finish();
  group.userData = { pipeId: def.id, pipe: true, service: def.service };
  return { def, group, length, points, service: svc };
}

export function buildPipeLayer(site) {
  const root = new THREE.Group();
  root.name = 'pipes';
  const pipes = [];
  for (const def of PIPES) {
    const p = buildOne(site, def);
    if (!p) { console.warn('pipe not routed', def.id); continue; }
    root.add(p.group);
    pipes.push(p);
  }
  return {
    root,
    pipes,
    byId: Object.fromEntries(pipes.map((p) => [p.def.id, p])),
    setVisible(v) { root.visible = v; }
  };
}
