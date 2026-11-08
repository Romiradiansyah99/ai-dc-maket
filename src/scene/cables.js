// Builds the electrical connection layer: cables, busduct, trays and duct banks,
// routed between the actual equipment positions in the model.
//
// Routing rule, which is also how it is done on site:
//   leave the equipment, rise into the tray or duct at the run elevation,
//   run horizontally along one axis then the other, drop into the far equipment.
// Nothing is drawn as a straight line between two boxes, because nothing is installed
// that way either.
import * as THREE from 'three';
import { Builder, C } from './kit.js';
import { LEVELS, BURIED } from '../data/layout.js';
import { CABLES } from '../data/cables.js';

const COLOR = {
  mv: 0x8A1F2B,      // medium voltage
  lv: 0x2A3340,      // IT critical power
  dc: 0x2E6FD0,      // rack power
  bl: 0x4A6B3A,      // building services, generator backed, not UPS backed
  fiber: 0x7A4FA0,   // structured cabling
  earth: 0x0E7E88,
  duct: 0xB4713C     // copper busduct, drawn as copper
};

const floorY = (id) => (LEVELS.find((l) => l.id === id) || LEVELS[0]).y;

// Where the cable actually lands: the centre of the equipment top face, not a point
// floating half a metre above it. This is what stops the runs looking unattached.
function terminationOf(site, key, index) {
  const list = site.byKey[key];
  if (!list || !list.length) return null;
  const it = list[Math.min(index || 0, list.length - 1)];
  if (!it || !it.group) return null;
  const box = new THREE.Box3().setFromObject(it.group);
  const c = box.getCenter(new THREE.Vector3());
  return new THREE.Vector3(c.x, box.max.y + 0.02, c.z);
}

// Axis aligned corner insertion: the run never cuts diagonally through a room.
function orthoPath(points) {
  const out = [points[0].clone()];
  for (let i = 1; i < points.length; i++) {
    const a = out[out.length - 1];
    const b = points[i];
    const dx = Math.abs(b.x - a.x), dz = Math.abs(b.z - a.z), dy = Math.abs(b.y - a.y);
    if (dx > 0.25 && dz > 0.25 && dy < 0.25) {
      // horizontal turn: go along the longer axis first
      if (dx >= dz) out.push(new THREE.Vector3(b.x, a.y, a.z), b.clone());
      else out.push(new THREE.Vector3(a.x, a.y, b.z), b.clone());
    } else out.push(b.clone());
    out[out.length - 1] = b.clone();
  }
  return out;
}

function routeFor(site, def) {
  const a = terminationOf(site, def.from, def.fromIndex);
  const b = terminationOf(site, def.to, def.toIndex);
  if (!a || !b) return null;

  const buried = def.tray === 'buried';
  const fy = floorY((site.byKey[def.from][0] || {}).floor || 'L0');
  // Buried means below grade. A duct bank at +0.55 m is a cable lying on the lawn.
  const elev = buried ? (def.kind === 'mv' ? BURIED.mv : BURIED.cable) : fy + (def.tray || 3);

  // buried runs leave the equipment at floor level and dive into the trench
  const start = buried ? new THREE.Vector3(a.x, 0.15, a.z) : a.clone();
  const end = buried ? new THREE.Vector3(b.x, 0.15, b.z) : b.clone();

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
    if (Math.abs(start.x - end.x) < 0.3) {
      // same x: the x detour is pointless, go straight along z
      raw[2].x = start.x;
    }
  }
  const pts = orthoPath(raw);

  // drop duplicate and zero length points
  const clean = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].distanceTo(clean[clean.length - 1]) > 0.08) clean.push(pts[i]);
  }

  let length = 0;
  for (let i = 1; i < clean.length; i++) length += clean[i].distanceTo(clean[i - 1]);
  return { points: clean, length };
}

// A ladder tray under a horizontal run: two rails and rungs.
function addTray(b, a, c, w = 0.46, y, ceilY) {
  const dx = c.x - a.x, dz = c.z - a.z;
  const len = Math.hypot(dx, dz);
  if (len < 2.4) return;
  const horiz = Math.abs(dx) > Math.abs(dz);
  const rotY = horiz ? 0 : Math.PI / 2;
  const mid = new THREE.Vector3((a.x + c.x) / 2, y, (a.z + c.z) / 2);

  for (const s of [-1, 1]) {
    const off = horiz ? [0, 0, s * w / 2] : [s * w / 2, 0, 0];
    b.box(horiz ? len : 0.05, 0.09, horiz ? 0.05 : len, C.steel, {
      pos: [mid.x + off[0], y, mid.z + off[2]], edge: true, amp: 0.003
    });
  }
  // hanger rods to the slab above: a tray is supported, never floating
  if (ceilY && ceilY > y + 0.4) {
    const hangs = Math.max(1, Math.round(len / 3));
    for (let i = 1; i <= hangs; i++) {
      const t = i / (hangs + 1);
      const x = a.x + dx * t, z = a.z + dz * t;
      const rodLen = ceilY - y;
      for (const s2 of [-1, 1]) {
        const off = horiz ? [0, 0, s2 * w / 2] : [s2 * w / 2, 0, 0];
        b.cyl(0.025, rodLen, C.dark, {
          pos: [x + off[0], y + rodLen / 2, z + off[2]], edge: false, sides: 6
        });
      }
    }
  }

  const n = Math.max(2, Math.floor(len / 0.65));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = a.x + dx * t, z = a.z + dz * t;
    b.box(horiz ? 0.04 : w, 0.03, horiz ? w : 0.04, C.dark, {
      pos: [x, y - 0.03, z], edge: false
    });
  }
}

// A busduct is not a cable: it is a rigid copper enclosure in three metre lengths,
// bolted joint by joint, hung from the slab and tapped wherever a load appears.
// Drawing it as a plain box is why it disappeared against the structure.
function addBusduct(b, a, c, w, h, colour) {
  const len = a.distanceTo(c);
  if (len < 0.12) return;
  const dx = Math.abs(c.x - a.x), dy = Math.abs(c.y - a.y), dz = Math.abs(c.z - a.z);
  const cx = (a.x + c.x) / 2, cy = (a.y + c.y) / 2, cz = (a.z + c.z) / 2;
  const vertical = dy > dx + dz;
  const alongX = dx >= dz;

  if (vertical) b.box(w, len, h, colour, { pos: [cx, cy, cz], edge: true, amp: 0.002 });
  else if (alongX) b.box(len, h, w, colour, { pos: [cx, cy, cz], edge: true, amp: 0.002 });
  else b.box(w, h, len, colour, { pos: [cx, cy, cz], edge: true, amp: 0.002 });

  const dir = new THREE.Vector3(c.x - a.x, c.y - a.y, c.z - a.z).normalize();
  // bolted joints every three metres
  for (let d = 3; d < len - 0.4; d += 3) {
    const p = a.clone().addScaledVector(dir, d);
    if (vertical) b.box(w * 1.18, 0.14, h * 1.18, C.dark, { pos: [p.x, p.y, p.z], edge: true, amp: 0.001 });
    else if (alongX) b.box(0.14, h * 1.18, w * 1.18, C.dark, { pos: [p.x, p.y, p.z], edge: true, amp: 0.001 });
    else b.box(w * 1.18, h * 1.18, 0.14, C.dark, { pos: [p.x, p.y, p.z], edge: true, amp: 0.001 });
  }
  // hangers on horizontal runs
  if (!vertical) {
    const n = Math.max(1, Math.round(len / 3));
    for (let i = 1; i <= n; i++) {
      const p = a.clone().addScaledVector(dir, (len * i) / (n + 1));
      for (const s2 of [-1, 1]) {
        const off = alongX ? [0, 0, s2 * w * 0.62] : [s2 * w * 0.62, 0, 0];
        b.cyl(0.028, 0.55, C.dark, { pos: [p.x + off[0], p.y + h / 2 + 0.28, p.z + off[2]], edge: false, sides: 6 });
      }
      b.box(alongX ? 0.1 : w * 1.4, 0.05, alongX ? w * 1.4 : 0.1, C.dark, {
        pos: [p.x, p.y + h / 2 + 0.02, p.z], edge: false
      });
    }
  }
}

// A duct bank for buried runs: a shallow enclosure the cables sit inside.
function addDuctBank(b, a, c, y) {
  const dx = c.x - a.x, dz = c.z - a.z;
  const len = Math.hypot(dx, dz);
  if (len < 1.5) return;
  const horiz = Math.abs(dx) > Math.abs(dz);
  const mid = [(a.x + c.x) / 2, y, (a.z + c.z) / 2];
  b.box(horiz ? len : 0.62, 0.3, horiz ? 0.62 : len, C.ghost, {
    pos: mid, edge: true, amp: 0.004
  });
}

function buildOne(site, def) {
  const route = routeFor(site, def);
  if (!route) return null;
  const { points, length } = route;
  const b = new Builder(2);
  const color = COLOR[def.kind] || COLOR.lv;
  const ceilY = floorY((site.byKey[def.from][0] || {}).floor || 'L0') + 5.9;
  const render = def.render || { type: 'tubes', n: 2, r: 0.05 };

  if (render.type === 'duct') {
    for (let i = 1; i < points.length; i++) {
      addBusduct(b, points[i - 1], points[i], render.w, render.h, COLOR.duct);
    }
  } else {
    const n = render.n || 2;
    for (let k = 0; k < n; k++) {
      const lift = (k - (n - 1) / 2) * (render.r * 2.1 || 0.1);
      const liftPts = points.map((p, i) => new THREE.Vector3(
        p.x, p.y + lift, p.z
      ));
      b.pipe(liftPts.map((p) => [p.x, p.y, p.z]), render.r || 0.05, color);
    }
  }

  // containment: ladder tray at high level, duct bank below grade
  const buried = def.tray === 'buried';
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], c = points[i];
    const dy = Math.abs(c.y - a.y);
    const horizLen = Math.hypot(c.x - a.x, c.z - a.z);
    if (horizLen < 2.4 || dy > 0.25) continue;
    if (buried) addDuctBank(b, a, c, (a.y + c.y) / 2);
    else if (render.type !== 'duct') {
      addTray(b, a, c, 0.46, (a.y + c.y) / 2 + 0.06, ceilY);
    }
  }

  // Cable entry at each end: a gland plate on the equipment top, so the run visibly
  // terminates instead of stopping in the air above the cabinet.
  if (def.tray !== 'buried') {
    for (const p of [points[0], points[points.length - 1]]) {
      b.box(0.42, 0.1, 0.42, C.dark, { pos: [p.x, p.y + 0.03, p.z], edge: true, amp: 0.002 });
      b.box(0.3, 0.05, 0.3, C.steel, { pos: [p.x, p.y + 0.1, p.z], edge: false });
    }
  }

  const group = b.finish();
  group.userData = { cableId: def.id, cable: true, kind: def.kind };
  return { def, group, length, points };
}

export function buildCableLayer(site) {
  const root = new THREE.Group();
  root.name = 'cables';
  const cables = [];
  for (const def of CABLES) {
    const c = buildOne(site, def);
    if (!c) { console.warn('cable not routed', def.id); continue; }
    root.add(c.group);
    cables.push(c);
  }
  return {
    root,
    cables,
    byId: Object.fromEntries(cables.map((c) => [c.def.id, c])),
    setVisible(v) { root.visible = v; }
  };
}
