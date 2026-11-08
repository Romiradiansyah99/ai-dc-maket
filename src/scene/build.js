// Builds the three-level building and every piece of equipment.
import * as THREE from 'three';
import { Builder, C } from './kit.js';
import { BUILDING, LEVELS, ROOMS, YARD, RISERS, HALL, HALLS, ROOF_Y, SITE } from '../data/layout.js';
import { EQUIPMENT, INDEX, SYS_COLOR } from '../data/systems.js';

const hex = (s) => parseInt(s.replace('#', ''), 16);

/* ------------------------------------------------------------------ */
/* Equipment builders. Local origin at footprint centre, y = 0 floor.  */
/* ------------------------------------------------------------------ */

const KINDS = {
  trafo(b) {
    b.box(2.6, 0.16, 1.9, C.dark, { pos: [0, 0.08, 0] });
    b.box(2.2, 2.1, 1.5, C.steel, { pos: [0, 1.21, 0], amp: 0.014 });
    for (let i = -3; i <= 3; i++) {
      b.box(0.07, 1.7, 1.56, C.fill2, { pos: [i * 0.28, 1.21, 0], edge: false });
    }
    for (const z of [-0.55, 0, 0.55]) {
      b.cyl(0.11, 0.45, C.white, { pos: [-0.7, 2.48, z] });
      b.cyl(0.07, 0.35, C.white, { pos: [0.7, 2.43, z] });
      b.cyl(0.14, 0.08, C.dark, { pos: [-0.7, 2.72, z] });
    }
    b.box(0.9, 0.5, 0.1, C.fill2, { pos: [0, 1.4, 0.76] });
    b.box(0.75, 0.06, 0.03, C.accent, { pos: [0, 2.02, 0.77], edge: false });
    b.box(0.3, 0.9, 0.3, C.dark, { pos: [1.2, 0.45, 0.6] });
  },

  lineup(b, o) {
    const n = o.n || 4;
    const w = o.w || 0.9;
    const d = o.d || 0.9;
    const h = o.h || 2.2;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * w;
      b.box(w * 0.96, h, d, i % 2 ? C.fill : C.steel, { pos: [x, h / 2, 0] });
      b.box(w * 0.78, 0.34, 0.03, C.fill2, { pos: [x, h - 0.45, d / 2 + 0.01], edge: false });
      b.box(0.05, 0.16, 0.04, C.accent, { pos: [x + w * 0.3, h - 0.45, d / 2 + 0.03], edge: false });
      b.box(w * 0.9, 0.1, 0.02, C.dark, { pos: [x, 0.12, d / 2 + 0.02], edge: false });
    }
    b.box(n * w + 0.1, 0.14, d + 0.1, C.dark, { pos: [0, 0.07, 0] });
    b.box(n * w + 0.1, 0.18, d + 0.1, C.dark, { pos: [0, h + 0.09, 0] });
  },

  rmu(b) {
    b.box(1.5, 0.12, 1.1, C.dark, { pos: [0, 0.06, 0] });
    b.box(1.4, 1.7, 1.0, C.steel, { pos: [0, 0.97, 0] });
    for (const x of [-0.42, 0, 0.42]) {
      b.box(0.3, 0.5, 0.03, C.fill2, { pos: [x, 1.35, 0.51], edge: false });
      b.cyl(0.04, 0.14, C.accent, { pos: [x, 1.02, 0.53], axis: 'z', edge: false });
    }
    b.box(1.0, 0.16, 0.02, C.teal, { pos: [0, 0.55, 0.51], edge: false });
    b.cyl(0.1, 2.2, C.white, { pos: [0.5, 2.9, -0.2] });
  },

  genset(b) {
    b.box(6.2, 0.25, 2.4, C.dark, { pos: [0, 0.13, 0] });
    b.box(3.6, 1.5, 1.7, C.steel, { pos: [-0.9, 1.0, 0], amp: 0.012 });
    for (let i = 0; i < 6; i++) b.box(0.06, 1.2, 1.74, C.fill2, { pos: [-2.5 + i * 0.62, 1.0, 0], edge: false });
    b.cyl(0.62, 1.9, C.steel, { pos: [1.8, 1.15, 0], axis: 'x' });
    b.box(1.4, 1.6, 2.0, C.fill, { pos: [3.1, 0.95, 0] });
    for (let i = 0; i < 8; i++) b.box(0.04, 1.4, 1.9, C.dark, { pos: [2.5 + i * 0.16, 0.95, 0], edge: false });
    b.cyl(0.24, 5.4, C.dark, { pos: [3.2, 4.0, -0.7] });
    b.cyl(0.34, 0.5, C.dark, { pos: [3.2, 6.65, -0.7] });
    b.box(1.2, 0.5, 0.5, C.dark, { pos: [-2.6, 0.6, 1.0] });
    b.box(1.4, 1.1, 0.28, C.white, { pos: [-1.0, 1.0, 1.28] });
    b.box(1.1, 0.7, 0.03, C.accent, { pos: [-1.0, 1.15, 1.43], edge: false });
  },

  fueltank(b) {
    b.box(5.6, 0.18, 3.4, C.fill2, { pos: [0, 0.09, 0] });
    for (const x of [-2.2, 2.2]) b.box(0.5, 0.7, 2.2, C.dark, { pos: [x, 0.5, 0] });
    b.cyl(1.1, 5.4, C.steel, { pos: [0, 1.55, 0], axis: 'x', sides: 16 });
    b.cyl(0.1, 0.9, C.dark, { pos: [1.6, 2.6, 0.4] });
    b.box(3.9, 0.55, 0.08, C.accent, { pos: [0, 1.7, 1.12], edge: false });
    b.box(5.6, 0.35, 0.2, C.dark, { pos: [0, 0.18, 1.7] });
  },

  gardu(b) {
    b.box(4.2, 0.2, 3.4, C.fill2, { pos: [0, 0.1, 0] });
    b.box(4.0, 2.6, 3.2, C.steel, { pos: [0, 1.5, 0], amp: 0.014 });
    b.box(4.2, 0.2, 3.4, C.dark, { pos: [0, 2.9, 0] });
    for (const x of [-1.1, 0, 1.1]) {
      b.cyl(0.13, 0.7, C.white, { pos: [x, 3.35, 0] });
      b.cyl(0.18, 0.08, C.dark, { pos: [x, 3.74, 0] });
    }
    b.box(1.4, 0.9, 0.03, C.fill2, { pos: [-1.1, 1.9, 1.62], edge: false });
    for (let i = -2; i <= 2; i++) b.cyl(0.05, 2.6, C.dark, { pos: [i * 1.0, 4.4, -1.6], edge: false });
    b.box(5.0, 0.08, 0.08, C.dark, { pos: [0, 5.65, -1.6], edge: false });
  },

  chiller(b) {
    b.box(6.0, 0.22, 2.6, C.dark, { pos: [0, 0.11, 0] });
    b.cyl(0.85, 4.6, C.steel, { pos: [-0.5, 1.05, 0], axis: 'x', sides: 16 });
    b.box(1.5, 1.2, 1.9, C.fill, { pos: [2.1, 0.8, 0] });
    for (let i = 0; i < 6; i++) b.box(0.05, 1.0, 1.85, C.dark, { pos: [1.5 + i * 0.22, 0.8, 0], edge: false });
    b.box(1.1, 0.9, 1.0, C.steel, { pos: [-2.6, 0.7, 0] });
    b.cyl(0.3, 1.4, C.dark, { pos: [-2.6, 1.85, 0] });
    b.box(0.7, 0.9, 0.16, C.white, { pos: [2.1, 0.75, 1.4] });
    b.box(0.55, 0.55, 0.02, C.teal, { pos: [2.1, 0.85, 1.49], edge: false });
    b.cyl(0.22, 0.7, C.fill2, { pos: [0.9, 1.35, 0], axis: 'x' });
  },

  coolingtower(b) {
    b.box(6.4, 0.3, 6.4, C.fill2, { pos: [0, 0.15, 0] });
    b.box(6.0, 3.4, 6.0, C.steel, { pos: [0, 2.0, 0], amp: 0.016 });
    for (let i = 0; i < 7; i++) {
      b.box(6.02, 0.06, 0.5, C.fill2, { pos: [0, 0.7 + i * 0.42, 3.0], edge: false });
      b.box(6.02, 0.06, 0.5, C.fill2, { pos: [0, 0.7 + i * 0.42, -3.0], edge: false });
    }
    b.box(6.2, 0.25, 6.2, C.dark, { pos: [0, 3.85, 0] });
    for (const x of [-1.4, 1.4]) {
      b.cyl(1.25, 0.5, C.dark, { pos: [x, 4.1, 0] });
      b.cyl(1.15, 0.12, C.fill, { pos: [x, 4.3, 0], sides: 16 });
      for (let i = 0; i < 4; i++) {
        b.box(2.0, 0.04, 0.22, C.fill, { pos: [x, 4.36, 0], rot: [0, (i * Math.PI) / 4, 0.12], edge: false });
      }
    }
    b.box(0.5, 1.2, 0.5, C.dark, { pos: [2.9, 0.9, 2.9] });
    b.cyl(0.3, 0.6, C.white, { pos: [-2.6, 0.7, 2.9] });
  },

  drycooler(b) {
    b.box(5.2, 0.25, 2.4, C.dark, { pos: [0, 0.12, 0] });
    b.box(5.0, 1.9, 1.6, C.steel, { pos: [0, 1.2, 0] });
    for (let i = 0; i < 10; i++) b.box(4.9, 0.04, 1.62, C.fill2, { pos: [0, 0.4 + i * 0.16, 0], edge: false });
    for (const x of [-1.3, 1.3]) {
      b.cyl(0.9, 0.4, C.dark, { pos: [x, 2.3, 0] });
      b.cyl(0.82, 0.1, C.fill, { pos: [x, 2.47, 0], sides: 16 });
      for (let i = 0; i < 3; i++) b.box(1.5, 0.03, 0.14, C.fill, { pos: [x, 2.52, 0], rot: [0, (i * Math.PI) / 3, 0.1], edge: false });
    }
    b.box(0.6, 0.7, 0.2, C.white, { pos: [2.2, 0.85, 0.8] });
  },

  pump(b) {
    b.box(2.4, 0.16, 1.2, C.dark, { pos: [0, 0.08, 0] });
    b.cyl(0.34, 0.7, C.steel, { pos: [-0.55, 0.62, 0], axis: 'x' });
    b.cyl(0.42, 0.5, C.steel, { pos: [-0.55, 0.62, 0], axis: 'y', sides: 14 });
    b.cyl(0.3, 0.9, C.fill, { pos: [0.35, 0.62, 0], axis: 'x' });
    b.box(0.55, 0.45, 0.1, C.white, { pos: [0.95, 0.9, 0.3] });
    b.cyl(0.14, 0.9, C.fill2, { pos: [-0.55, 1.3, 0], edge: false });
    b.cyl(0.14, 1.0, C.fill2, { pos: [-0.55, 0.62, 0.6], axis: 'z', edge: false });
  },

  buffer(b) {
    b.cyl(1.15, 0.16, C.dark, { pos: [0, 0.08, 0], sides: 16 });
    b.cyl(1.1, 3.0, C.steel, { pos: [0, 1.58, 0], sides: 16, amp: 0.012 });
    b.cyl(1.14, 0.1, C.dark, { pos: [0, 3.12, 0], sides: 16 });
    b.cyl(0.1, 0.5, C.dark, { pos: [0, 3.4, 0] });
    b.cyl(0.16, 0.8, C.fill2, { pos: [-1.15, 0.9, 0], axis: 'x', edge: false });
    b.cyl(0.16, 0.8, C.fill2, { pos: [1.15, 2.4, 0], axis: 'x', edge: false });
    b.box(0.3, 0.5, 0.08, C.white, { pos: [0.6, 2.4, 1.1] });
  },

  phe(b) {
    b.box(2.6, 0.16, 1.4, C.dark, { pos: [0, 0.08, 0] });
    b.box(0.22, 1.9, 1.2, C.dark, { pos: [-1.05, 1.1, 0] });
    b.box(0.22, 1.9, 1.2, C.dark, { pos: [1.05, 1.1, 0] });
    for (let i = 0; i < 14; i++) {
      b.box(0.05, 1.5, 1.0, C.steel, { pos: [-0.8 + i * 0.12, 1.15, 0], edge: false });
    }
    b.cyl(0.11, 0.5, C.accent, { pos: [-0.9, 2.1, 0.3], edge: false });
    b.cyl(0.11, 0.5, C.teal, { pos: [0.9, 2.1, -0.3], edge: false });
  },

  cdu(b) {
    b.box(1.8, 0.14, 1.1, C.dark, { pos: [0, 0.07, 0] });
    b.box(1.7, 2.0, 0.95, C.steel, { pos: [0, 1.07, 0], amp: 0.012 });
    b.box(0.8, 0.55, 0.03, C.fill2, { pos: [-0.3, 1.5, 0.48], edge: false });
    b.box(0.5, 0.5, 0.02, C.teal, { pos: [0.45, 1.5, 0.5], edge: false });
    b.box(1.5, 0.14, 0.02, C.accent, { pos: [0, 0.42, 0.49], edge: false });
    b.cyl(0.13, 0.6, C.fill2, { pos: [-0.55, 2.3, 0], edge: false });
    b.cyl(0.13, 0.6, C.fill2, { pos: [0.55, 2.3, 0], edge: false });
    b.cyl(0.1, 0.9, C.teal, { pos: [-0.9, 1.1, 0.7], axis: 'x', edge: false });
  },

  crah(b) {
    b.box(2.6, 0.14, 1.4, C.dark, { pos: [0, 0.07, 0] });
    b.box(2.4, 2.2, 1.3, C.steel, { pos: [0, 1.17, 0] });
    for (let i = 0; i < 9; i++) b.box(2.3, 0.05, 0.06, C.dark, { pos: [0, 0.35 + i * 0.2, 0.66], edge: false });
    b.box(1.6, 0.5, 0.12, C.white, { pos: [0, 1.7, 0.71] });
    b.box(1.2, 0.3, 0.02, C.accent, { pos: [0, 1.72, 0.78], edge: false });
    b.cyl(0.18, 0.5, C.fill2, { pos: [-0.8, 2.5, 0], edge: false });
    b.cyl(0.18, 0.5, C.fill2, { pos: [0.8, 2.5, 0], edge: false });
  },

  rack(b, o) {
    const w = HALL.rackW, h = HALL.rackH, d = HALL.rackD;
    b.box(w, h, d, C.steel, { pos: [0, h / 2, 0], amp: 0.008 });
    for (let i = 0; i < 14; i++) b.box(w * 0.92, 0.045, 0.02, C.fill2, { pos: [0, 0.18 + i * 0.15, d / 2 + 0.005], edge: false });
    b.box(w * 0.7, 0.3, 0.02, C.accent, { pos: [0, h - 0.25, d / 2 + 0.01], edge: false });
    b.box(w * 0.86, 0.06, d * 0.9, C.dark, { pos: [0, h + 0.03, 0], edge: false });
    if (o && o.coldPlate) {
      b.box(w * 0.8, 0.06, d * 0.5, C.teal, { pos: [0, h + 0.09, -0.1], edge: false });
      b.cyl(0.05, 0.5, C.teal, { pos: [0, h + 0.4, -0.1], edge: false });
    }
  },

  containment(b) {
    // Cold aisle containment is a vertical structure: glazed end doors, posts on every
    // rack bay, and a roof panel that sits on the rack tops. A flat plate floating
    // above the aisle is not a containment, it is a ceiling tile.
    const rows = HALL.rows;
    const z0 = rows[0], z1 = rows[1];
    const depth = (z1 - z0) + HALL.rackD + 0.30;
    const len = HALL.racksPerRow * HALL.rackPitch;
    const zc = (z0 + z1) / 2;
    const h = HALL.rackH + 0.10;

    // roof, in panels per bay, landing on the rack tops
    for (let i = 0; i < HALL.racksPerRow; i++) {
      const x = -len / 2 + (i + 0.5) * HALL.rackPitch;
      b.box(HALL.rackPitch - 0.06, 0.05, depth, C.fill, {
        pos: [x, h, zc], edge: true, amp: 0.004
      });
    }

    // vertical end walls: frame, glazed door, closer
    for (const sx of [-1, 1]) {
      const x = sx * (len / 2);
      for (const sz of [-1, 1]) {
        b.box(0.07, h, 0.07, C.dark, { pos: [x, h / 2, zc + (sz * depth) / 2], edge: true, amp: 0.002 });
      }
      b.box(0.07, 0.07, depth, C.dark, { pos: [x, h - 0.035, zc], edge: false });
      b.box(0.05, h - 0.28, depth - 0.18, C.ghost, { pos: [x, (h - 0.28) / 2, zc], edge: true, amp: 0.002 });
      // door mullion and handle
      b.box(0.06, h - 0.28, 0.05, C.dark, { pos: [x, (h - 0.28) / 2, zc], edge: false });
      b.box(0.07, 0.85, 0.04, C.steel, { pos: [x + sx * 0.05, 1.15, zc - depth * 0.3], edge: false });
    }

    // vertical posts at every rack bay, both sides
    for (let i = 0; i <= HALL.racksPerRow; i++) {
      const x = -len / 2 + i * HALL.rackPitch;
      for (const sz of [-1, 1]) {
        b.box(0.06, h, 0.06, C.dark, { pos: [x, h / 2, zc + (sz * depth) / 2], edge: false });
      }
    }

    // raised floor in the aisle
    b.box(len - 0.25, 0.03, depth - 0.25, C.fill2, { pos: [0, 0.016, zc], edge: true, amp: 0.003 });
  },

  busway(b, o) {
    const len = (o && o.len) || 13;
    // copper enclosure, bolted joints, and a metered tap off box per rack position
    b.box(len, 0.34, 0.42, C.copper, { pos: [0, 0, 0], edge: true, amp: 0.005 });
    for (let d = 3; d < len - 0.3; d += 3) {
      b.box(0.14, 0.40, 0.50, C.dark, { pos: [-len / 2 + d, 0, 0], edge: true, amp: 0.002 });
    }
    const n = Math.floor(len / 1.65);
    for (let i = 0; i < n; i++) {
      const x = -len / 2 + 0.9 + i * 1.65;
      b.box(0.36, 0.40, 0.30, C.steel, { pos: [x, -0.36, 0], edge: true });
      b.cyl(0.05, 0.95, C.dark, { pos: [x, -0.42, 0.22], rot: [0.3, 0, 0], edge: false });
      b.box(0.06, 0.10, 0.02, C.accent, { pos: [x + 0.12, -0.30, 0.16], edge: false });
    }
    // hangers to the slab
    for (let d = 1.5; d < len; d += 3) {
      for (const s2 of [-1, 1]) {
        b.cyl(0.028, 0.6, C.dark, { pos: [-len / 2 + d, 0.35, s2 * 0.18], edge: false, sides: 6 });
      }
    }
  },

  manifold(b, o) {
    const len = (o && o.len) || 13;
    for (const z of [-0.55, 0.55]) {
      b.cyl(0.16, len, C.teal, { pos: [0, 0, z], axis: 'x', sides: 10, edge: true, amp: 0.004 });
      const n = Math.floor(len / 1.65);
      for (let i = 0; i < n; i++) {
        b.cyl(0.07, 0.55, C.teal, { pos: [-len / 2 + 0.9 + i * 1.65, -0.32, z], edge: false });
      }
    }
  },

  tray(b, o) {
    const len = (o && o.len) || 12;
    b.box(len, 0.02, 0.6, C.fill2, { pos: [0, 0, 0], edge: true, amp: 0.004 });
    for (const z of [-0.3, 0.3]) b.box(len, 0.12, 0.02, C.dark, { pos: [0, 0.06, z], edge: false });
    for (let i = 0; i < len / 0.5; i++) b.box(0.03, 0.04, 0.6, C.dark, { pos: [-len / 2 + i * 0.5, 0.01, 0], edge: false });
  },

  odf(b) {
    b.box(3.0, 0.14, 1.4, C.dark, { pos: [0, 0.07, 0] });
    for (let i = 0; i < 3; i++) {
      const x = -1.0 + i;
      b.box(0.9, 2.1, 1.2, C.steel, { pos: [x, 1.19, 0] });
      for (let j = 0; j < 8; j++) b.box(0.8, 0.05, 0.05, C.accent, { pos: [x, 0.7 + j * 0.18, 0.62], edge: false });
    }
    b.box(2.9, 0.1, 0.1, C.teal, { pos: [0, 2.32, 0], edge: false });
  },

  vesda(b) {
    b.box(0.6, 0.5, 0.3, C.alarm, { pos: [0, 0.6, 0] });
    b.box(0.5, 0.2, 0.02, C.fill2, { pos: [0, 0.65, 0.16], edge: false });
    b.cyl(0.05, 6.0, C.dark, { pos: [0, 2.6, 0.2], axis: 'x', edge: false });
    for (let i = 0; i < 4; i++) b.cyl(0.03, 0.6, C.dark, { pos: [-3 + i * 2, 2.3, 0.2], edge: false });
  },

  leakdet(b) {
    b.cyl(0.035, 11, C.alarm, { pos: [0, 0.03, 0], axis: 'x', edge: false });
    b.box(0.3, 0.25, 0.2, C.white, { pos: [5.4, 0.15, 0] });
  },

  cleanagent(b) {
    b.box(2.8, 0.14, 1.2, C.dark, { pos: [0, 0.07, 0] });
    for (let i = 0; i < 4; i++) {
      const x = -0.9 + i * 0.6;
      b.cyl(0.22, 1.5, C.alarm, { pos: [x, 0.83, 0], sides: 14 });
      b.cyl(0.08, 0.2, C.dark, { pos: [x, 1.68, 0] });
    }
    b.cyl(0.06, 2.4, C.dark, { pos: [0, 1.9, 0], axis: 'x', edge: false });
    b.box(0.4, 0.3, 0.12, C.white, { pos: [1.4, 1.2, 0.4] });
  },

  preaction(b) {
    const len = 12;
    b.cyl(0.09, len, C.alarm, { pos: [0, 0, 0], axis: 'x', edge: false });
    for (let i = 0; i < 6; i++) {
      b.cyl(0.04, 0.4, C.alarm, { pos: [-len / 2 + 1 + i * 2, -0.2, 0], edge: false });
      b.cyl(0.07, 0.06, C.dark, { pos: [-len / 2 + 1 + i * 2, -0.43, 0] });
    }
    b.box(0.3, 0.3, 0.3, C.dark, { pos: [-len / 2, 0, 0] });
  },

  firepump(b) {
    b.box(4.4, 0.2, 2.4, C.fill2, { pos: [0, 0.1, 0] });
    for (let i = 0; i < 3; i++) {
      const x = -1.4 + i * 1.4;
      b.box(1.1, 0.14, 1.6, C.dark, { pos: [x, 0.27, 0] });
      b.cyl(0.28, 0.8, C.steel, { pos: [x - 0.2, 0.75, 0], axis: 'x' });
      b.cyl(0.22, 0.7, i === 1 ? C.alarm : C.fill, { pos: [x + 0.45, 0.75, 0], axis: 'x' });
      b.cyl(0.1, 1.2, C.fill2, { pos: [x - 0.2, 1.4, 0], edge: false });
    }
    b.box(1.2, 0.9, 0.2, C.white, { pos: [1.9, 1.0, 0.9] });
    b.box(1.0, 0.5, 0.02, C.accent, { pos: [1.9, 1.1, 1.02], edge: false });
  },

  epo(b) {
    b.cyl(0.16, 0.1, C.alarm, { pos: [0, 1.2, 0], rot: [Math.PI / 2, 0, 0] });
    b.cyl(0.2, 0.06, C.dark, { pos: [0, 1.2, -0.06], rot: [Math.PI / 2, 0, 0] });
    b.box(0.08, 1.2, 0.08, C.dark, { pos: [0, 0.6, -0.02], edge: false });
  },

  noc(b) {
    b.box(4.4, 0.1, 2.6, C.fill2, { pos: [0, 0.05, 0] });
    b.box(3.6, 0.08, 0.9, C.dark, { pos: [0, 0.8, 0.7] });
    for (const x of [-1.2, -0.4, 0.4, 1.2]) {
      b.box(0.7, 0.45, 0.05, C.ink, { pos: [x, 1.15, 0.2], rot: [-0.15, 0, 0], edge: false });
      b.box(0.05, 0.35, 0.05, C.dark, { pos: [x, 0.95, 0.25], edge: false });
    }
    b.box(4.2, 2.0, 0.1, C.fill, { pos: [0, 1.0, -1.2] });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
      b.box(0.85, 0.6, 0.04, C.steel, { pos: [-1.4 + i * 0.95, 1.5 - j * 0.7, -1.13], edge: false });
    }
 
    for (const x of [-1.5, 1.5]) {
      b.box(0.5, 0.45, 0.5, C.dark, { pos: [x, 0.28, 0.9] });
    }
  },

  security(b) {
    b.box(2.6, 0.1, 3.0, C.fill2, { pos: [0, 0.05, 0] });
    for (const z of [-1.1, 1.1]) {
      b.box(0.3, 0.3, 0.3, C.dark, { pos: [0, 0.25, z] });
    }
    b.box(0.08, 2.4, 0.08, C.dark, { pos: [-0.8, 1.2, -1.1], edge: false });
    b.box(0.08, 2.4, 0.08, C.dark, { pos: [0.8, 1.2, -1.1], edge: false });
    b.box(1.7, 0.1, 0.08, C.dark, { pos: [0, 2.4, -1.1], edge: false });
    b.box(0.1, 2.4, 0.1, C.accent, { pos: [0.8, 1.2, 1.1], edge: false });
    b.box(0.25, 0.4, 0.15, C.white, { pos: [0.62, 1.3, 0.6] });
  },

  staging(b) {
    b.box(4.0, 0.12, 2.0, C.fill2, { pos: [0, 0.06, 0] });
    for (let i = 0; i < 3; i++) {
      const x = -1.3 + i * 1.1;
      b.box(0.6, 2.2, 1.0, C.steel, { pos: [x, 1.16, 0] });
      b.box(0.5, 0.04, 0.02, C.fill2, { pos: [x, 1.6, 0.51], edge: false });
    }
    b.box(1.6, 0.08, 0.8, C.dark, { pos: [1.4, 0.85, 0.6] });
    for (const x of [0.9, 1.9]) b.box(0.06, 0.8, 0.06, C.dark, { pos: [x, 0.45, 0.6], edge: false });
  },

  office(b) {
    b.box(5.0, 0.08, 2.4, C.fill2, { pos: [0, 0.04, 0] });
    for (let i = 0; i < 4; i++) {
      const x = -1.8 + i * 1.2;
      b.box(1.0, 0.06, 0.6, C.dark, { pos: [x, 0.74, 0.4] });
      b.box(0.06, 0.7, 0.06, C.dark, { pos: [x, 0.37, 0.4], edge: false });
      b.box(0.1, 0.5, 0.1, C.steel, { pos: [x - 0.3, 0.5, -0.2] });
      b.box(0.5, 0.4, 0.5, C.fill, { pos: [x, 0.3, -0.4] });
    }
    b.box(4.8, 1.2, 0.08, C.fill, { pos: [0, 0.6, 1.15] });
  },

  coldplate(b) {
    b.box(0.5, 0.08, 0.4, C.teal, { pos: [0, 1.2, 0] });
    b.cyl(0.05, 0.9, C.teal, { pos: [0, 1.7, 0], edge: false });
    b.cyl(0.05, 0.4, C.teal, { pos: [0.25, 1.4, 0], edge: false });
  },

  header(b) {
    for (const z of [-0.8, 0.8]) {
      b.cyl(0.28, 8.0, C.teal, { pos: [0, 0, z], axis: 'x', sides: 12, edge: true, amp: 0.004 });
    }
    for (const x of [-2.6, 0, 2.6]) {
      b.cyl(0.28, 1.6, C.teal, { pos: [x, 0, 0], axis: 'z', edge: false });
      b.cyl(0.34, 0.12, C.dark, { pos: [x, 0, 0.8], axis: 'z' });
    }
  },

  returnpath(b) {
    b.box(9.0, 0.6, 6.0, C.fill2, { pos: [0, 0, 0], edge: true, amp: 0.006 });
    for (let i = 0; i < 5; i++) b.box(0.06, 0.62, 5.9, C.dark, { pos: [-4 + i * 2, 0, 0], edge: false });
    b.box(1.2, 0.5, 0.12, C.white, { pos: [3.6, 0, 3.0] });
  },

  bbu(b) {
    b.box(0.55, 0.35, 0.9, C.accent, { pos: [0, 1.0, 0] });
    b.box(0.5, 0.06, 0.8, C.fill2, { pos: [0, 1.2, 0], edge: false });
  },

  rackpdu(b) {
    b.box(0.12, 1.7, 0.12, C.accent, { pos: [0, 1.1, 0] });
    b.box(0.3, 0.2, 0.08, C.white, { pos: [0, 1.9, 0] });
  },

  earth(b) {
    for (let i = -3; i <= 3; i++) {
      b.box(18, 0.03, 0.05, C.dark, { pos: [0, 0.02, i * 3], edge: false });
      b.box(0.05, 0.03, 18, C.dark, { pos: [i * 3, 0.02, 0], edge: false });
    }
    b.box(0.12, 2.0, 0.12, C.dark, { pos: [0, 1.0, 0] });
    b.box(1.2, 0.3, 0.1, C.white, { pos: [0, 1.8, 0] });
  },

  lps(b) {
    for (const x of [-0.8, 0.8]) {
      b.box(0.06, 2.2, 0.06, C.dark, { pos: [x, 1.1, 0], edge: false });
      b.cyl(0.03, 0.5, C.dark, { pos: [x, 2.4, 0], edge: false });
    }
    b.box(1.9, 0.05, 0.05, C.dark, { pos: [0, 2.2, 0], edge: false });
  },

  lift(b) {
    b.box(2.3, 0.12, 2.3, C.dark, { pos: [0, 0.06, 0] });
    for (const x of [-1.0, 1.0]) for (const z of [-1.0, 1.0]) {
      b.box(0.08, 2.5, 0.08, C.steel, { pos: [x, 1.25, z], edge: false });
    }
    b.box(1.9, 2.3, 1.9, C.fill, { pos: [0, 1.2, 0] });
    for (const x of [-0.47, 0.47]) {
      b.box(0.9, 2.05, 0.07, C.steel, { pos: [x, 1.05, 1.0], edge: true, amp: 0.003 });
    }
    b.box(0.05, 2.05, 0.05, C.dark, { pos: [0, 1.05, 1.04], edge: false });
    b.box(2.1, 0.07, 0.34, C.dark, { pos: [0, 0.035, 1.2], edge: false });
    b.box(0.12, 0.24, 0.06, C.accent, { pos: [1.28, 1.15, 1.0], edge: false });
    // machine room package above the shaft
    b.cyl(0.32, 0.8, C.dark, { pos: [0, 2.95, 0], sides: 12 });
    b.box(1.4, 0.3, 1.2, C.fill2, { pos: [0, 3.5, 0] });
  },

  dock(b) {
    // Raised dock with three roller doors facing the apron. The plate on each door is
    // the leveller, and the two bumpers are what stops a trailer taking the wall with it.
    b.box(5.6, 1.15, 11.4, C.fill2, { pos: [0, 0.575, 0], amp: 0.008 });
    b.box(0.26, 0.14, 11.4, C.dark, { pos: [2.83, 1.22, 0], edge: true });

    for (const z of [-3.6, 0, 3.6]) {
      b.box(0.14, 3.2, 3.0, C.steel, { pos: [2.86, 2.75, z], edge: true, amp: 0.004 });
      for (let i = 0; i < 8; i++) {
        b.box(0.17, 0.06, 2.9, C.dark, { pos: [2.9, 1.36 + i * 0.22, z], edge: false });
      }
      b.box(1.5, 0.1, 2.2, C.steel, { pos: [2.2, 1.17, z], edge: true, amp: 0.003 });
      for (const zz of [-1.28, 1.28]) {
        b.box(0.3, 0.44, 0.32, C.dark, { pos: [2.95, 0.95, z + zz], edge: true, amp: 0.002 });
      }
      b.box(0.18, 1.5, 0.18, C.dark, { pos: [2.55, 0.75, z + 1.75], edge: false });
    }

    b.box(1.7, 0.12, 11.4, C.fill, { pos: [3.5, 3.32, 0], edge: true, amp: 0.004 });
    for (const z of [-5.0, -1.8, 1.8, 5.0]) {
      b.box(0.1, 3.3, 0.1, C.dark, { pos: [4.15, 1.65, z], edge: false });
    }
    for (const z of [-4.9, 4.9]) b.box(5.2, 0.06, 0.1, C.dark, { pos: [0, 1.2, z], edge: false });
  },

  fibentry(b) {
    b.box(1.8, 0.14, 0.9, C.dark, { pos: [0, 0.07, 0] });
    b.box(1.7, 1.9, 0.8, C.steel, { pos: [0, 1.02, 0], amp: 0.01 });
    for (let i = 0; i < 8; i++) {
      b.box(0.9, 0.05, 0.04, C.accent, { pos: [0, 1.05 + i * 0.11, 0.42], edge: false });
    }
    b.box(1.2, 0.28, 0.02, C.fill2, { pos: [0, 1.72, 0.41], edge: false });
    for (const x of [-0.55, 0.55]) b.cyl(0.09, 0.5, C.dark, { pos: [x, 2.05, 0], edge: false });
  },

  wetpipe(b) { this.preaction(b); }
};

/* ------------------------------------------------------------------ */
/* Placement. [x, z, rotationY]                                        */
/* ------------------------------------------------------------------ */

const PLACE = {
  gardu: { kind: 'gardu', floor: 'L0', spots: [[-41, -9, 0]] },
  pln: { kind: 'rmu', floor: 'L0', spots: [[-45.6, -13.4, Math.PI / 2]] },
  genset: { kind: 'genset', floor: 'L0', spots: [[-28, -32, 0], [-21, -32, 0], [-14, -32, 0]] },
  fueltank: { kind: 'fueltank', floor: 'L0', spots: [[-8, -33, 0], [-8, -31.4, 0]] },
  mvinc: { kind: 'lineup', floor: 'L0', spots: [[-27.6, -16, 0]], opt: { n: 2, w: 0.9 } },
  metering: { kind: 'lineup', floor: 'L0', spots: [[-25.2, -16, 0]], opt: { n: 1, w: 0.9 } },
  rmu: { kind: 'rmu', floor: 'L0', spots: [[-23.4, -16, 0]] },
  mvswg: { kind: 'lineup', floor: 'L0', spots: [[-20.4, -16, 0]], opt: { n: 4, w: 0.9, h: 2.3 } },
  trafo: { kind: 'trafo', floor: 'L0', spots: [[-16.2, -17.2, 0], [-13.2, -17.2, 0], [-16.2, -13.4, 0], [-13.2, -13.4, 0]] },
  msb: { kind: 'lineup', floor: 'L0', spots: [[-3.4, -16.8, 0]], opt: { n: 7, w: 0.9, h: 2.3 } },
  pdb: { kind: 'lineup', floor: 'L0', spots: [[-5.4, -13.2, 0]], opt: { n: 3, w: 0.85 } },
  db: { kind: 'lineup', floor: 'L0', spots: [[-1.4, -13.2, 0]], opt: { n: 3, w: 0.75, h: 1.9 } },
  apfc: { kind: 'lineup', floor: 'L0', spots: [[2.1, -16.8, 0]], opt: { n: 2, w: 0.85 } },
  ups: { kind: 'lineup', floor: 'L0', spots: [[7.4, -16.8, 0]], opt: { n: 4, w: 0.85, h: 2.1 } },
  bbu: { kind: 'lineup', floor: 'L0', spots: [[11.6, -16.8, 0]], opt: { n: 3, w: 0.9, h: 1.9 } },
  ats: { kind: 'lineup', floor: 'L0', spots: [[17.4, -16, 0]], opt: { n: 2, w: 1.0, h: 2.2 } },
  sts: { kind: 'lineup', floor: 'L0', spots: [[20.6, -16, 0]], opt: { n: 2, w: 1.0, h: 2.2 } },
  chiller: { kind: 'chiller', floor: 'L0', spots: [[-24, -4, 0], [-24, 1.5, 0], [-24, 7, 0]] },
  pumppri: { kind: 'pump', floor: 'L0', spots: [[-16, 6, 0], [-16, 8.6, 0], [-16, 2, 0]] },
  buffer: { kind: 'buffer', floor: 'L0', spots: [[-9.5, 2, 0]] },
  header: { kind: 'header', floor: 'L0', spots: [[-20, 9.4, 0]] },
  phe: { kind: 'phe', floor: 'L0', spots: [[-2.4, -5, 0], [-2.4, -1.6, 0]] },
  cleanagent: { kind: 'cleanagent', floor: 'L0', spots: [[9.6, -13.2, 0]] },
  firepump: { kind: 'firepump', floor: 'L0', spots: [[8.2, -2.4, 0]] },
  noc: { kind: 'noc', floor: 'L2', spots: [[15.5, 11, 0]] },
  epms: { kind: 'lineup', floor: 'L0', spots: [[17.5, -5, 0]], opt: { n: 2, w: 0.9, h: 2.0 } },
  mdbn: { kind: 'lineup', floor: 'L0', spots: [[1.6, -13.2, 0]], opt: { n: 3, w: 0.9, h: 2.1 } },
  ldb: { kind: 'lineup', floor: 'L2', spots: [[3, 9, 0]], opt: { n: 2, w: 0.85, h: 1.9 } },
  lift: { kind: 'lift', floor: 'L0', spots: [[6.6, 13.5, 0]] },
  fibentry: { kind: 'fibentry', floor: 'L1', spots: [[-20.5, 10, 0]] },
  security: { kind: 'security', floor: 'L0', spots: [[2, 16, 0]] },
  earth: { kind: 'earth', floor: 'L0', spots: [[-33, 14, 0]] },
  coolingtower: { kind: 'coolingtower', floor: 'L0', spots: [[1.5, -32, 0], [9.0, -32, 0]] },
  drycooler: { kind: 'drycooler', floor: 'L0', spots: [[20.5, -32, 0], [26.5, -32, 0]] },

  odf: { kind: 'odf', floor: 'L1', spots: [[-24, 10, 0]] },
  tray: { kind: 'tray', floor: 'L1', spots: [[-9.5, 10, 0]] },
  pdumain: { kind: 'lineup', floor: 'L1', spots: [[13, 11, 0]], opt: { n: 3, w: 0.92, h: 2.2 } },
  busway: { kind: 'busway', floor: 'L1', spots: [[-15.5, -9.75, 0, 3.3], [15.5, -9.75, 0, 3.3]], opt: { len: 13.2 } },
  manifold: { kind: 'manifold', floor: 'L1', spots: [[-15.5, -9.75, 0, 2.75], [15.5, -9.75, 0, 2.75]], opt: { len: 13.2 } },
  containment: { kind: 'containment', floor: 'L1', spots: [[-15.5, -9.75, 0, 0], [15.5, -9.75, 0, 0]] },
  cdu: { kind: 'cdu', floor: 'L1', spots: [[-8.5, -9.75, 0], [-6.7, -9.75, 0], [-4.9, -9.75, 0], [22.5, -9.75, 0], [24.3, -9.75, 0], [26.1, -9.75, 0]] },
  crah: { kind: 'crah', floor: 'L1', spots: [[-23.5, -2.2, 0], [-7.5, -2.2, 0], [7.5, -2.2, 0], [23.5, -2.2, 0]] },
  vesda: { kind: 'vesda', floor: 'L1', spots: [[-28.2, -17.4, 0]] },
  leakdet: { kind: 'leakdet', floor: 'L1', spots: [[-15.5, -8.2, 0, 0.12], [15.5, -8.2, 0, 0.12]] },
  returnpath: { kind: 'returnpath', floor: 'L1', spots: [[-15.5, -3.6, 0, 4.5], [15.5, -3.6, 0, 4.5]] },
  preaction: { kind: 'preaction', floor: 'L1', spots: [[-15.5, -11.8, 0, 4.95], [15.5, -11.8, 0, 4.95]] },
  epo: { kind: 'epo', floor: 'L1', spots: [[-4.4, -17.6, 0], [28.4, -17.6, 0]] },
  lps: { kind: 'lps', floor: 'L2', spots: [[-27, -17, 0], [27, -17, 0]] },
  staging: { kind: 'staging', floor: 'L0', spots: [[19.5, 2, 0], [19.5, 7, 0]] },
  dock: { kind: 'dock', floor: 'L0', spots: [[27, 4, 0]] },
  office: { kind: 'office', floor: 'L2', spots: [[-18, -10, 0], [0, -10, 0]] }
};

/* Racks: 32 units, 8 per row, 4 rows across two halls. */
const RACKS = [];
for (const hall of HALLS) {
  const center = (hall.x0 + (hall.id === 'dh01' ? -2 : 29)) / 2;
  for (const z of HALL.rows) {
    for (let i = 0; i < HALL.racksPerRow; i++) {
      RACKS.push({
        x: center + (i - (HALL.racksPerRow - 1) / 2) * HALL.rackPitch,
        z,
        hall: hall.id
      });
    }
  }
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

function tintGroup(group, sysColor, amt = 0.14) {
  const c = new THREE.Color(sysColor);
  const targets = [C.steel, C.fill, C.fill2];
  group.traverse((o) => {
    if (!o.isMesh || o.userData.baseColor === undefined) return;
    if (!targets.includes(o.userData.baseColor)) return;
    const base = new THREE.Color(o.userData.baseColor);
    o.material = o.material.clone();
    o.material.color.copy(base.lerp(c, amt));
  });
}

function addShell(root) {
  const bw = BUILDING.w, bd = BUILDING.d;
  const slab = BUILDING.slab;
  const groups = {};

  // ground and yard pads always visible
  const gb = new Builder(3);
  gb.box(SITE.w, 0.2, SITE.d, C.paper, { pos: [0, -0.1, 0], edge: false });
  gb.box(bw + 2, 0.25, bd + 2, C.fill2, { pos: [0, -0.02, 0], edge: true, amp: 0.004 });
  for (const yd of YARD) {
    const w = yd.x[1] - yd.x[0], d = yd.z[1] - yd.z[0];
    gb.box(w, 0.06, d, C.paper, { pos: [(yd.x[0] + yd.x[1]) / 2, 0.05, (yd.z[0] + yd.z[1]) / 2], edge: true, amp: 0.004 });
  }
  const ground = gb.finish();
  ground.name = 'ground';
  root.add(ground);

  LEVELS.forEach((lv, i) => {
    const b = new Builder(3);
    const y = lv.y;

    if (i > 0) {
      b.box(bw, slab, bd, C.ghost, { pos: [0, y - slab / 2, 0], edge: true, amp: 0.006 });
    }

    const hw = i === 0 ? 1.4 : 1.1;
    const t = 0.25;
    b.box(bw, hw, t, C.fill, { pos: [0, y + hw / 2, -bd / 2], amp: 0.006 });
    b.box(bw, hw, t, C.fill, { pos: [0, y + hw / 2, bd / 2], amp: 0.006 });
    b.box(t, hw, bd, C.fill, { pos: [-bw / 2, y + hw / 2, 0], amp: 0.006 });
    b.box(t, hw, bd, C.fill, { pos: [bw / 2, y + hw / 2, 0], amp: 0.006 });

    for (const r of (ROOMS[lv.id] || [])) {
      const w = r.x[1] - r.x[0], d = r.z[1] - r.z[0];
      const cx = (r.x[0] + r.x[1]) / 2, cz = (r.z[0] + r.z[1]) / 2;
      const hh = 0.55;
      b.box(w, hh, 0.14, C.dark, { pos: [cx, y + hh / 2, r.z[0]], edge: true, amp: 0.004 });
      b.box(w, hh, 0.14, C.dark, { pos: [cx, y + hh / 2, r.z[1]], edge: true, amp: 0.004 });
      b.box(0.14, hh, d, C.dark, { pos: [r.x[0], y + hh / 2, cz], edge: true, amp: 0.004 });
      b.box(0.14, hh, d, C.dark, { pos: [r.x[1], y + hh / 2, cz], edge: true, amp: 0.004 });
    }

    for (let x = -bw / 2 + 5; x <= bw / 2 - 5; x += 10) {
      for (let z = -bd / 2 + 5; z <= bd / 2 - 5; z += 10) {
        b.box(0.45, BUILDING.floorH, 0.45, C.fill, { pos: [x, y + BUILDING.floorH / 2, z], edge: true, amp: 0.005 });
      }
    }

    const g = b.finish();
    g.name = 'level-' + lv.id;
    root.add(g);
    groups[lv.id] = g;
  });

  const rb = new Builder(3);
  rb.box(bw + 1, 0.4, bd + 1, C.fill2, { pos: [0, ROOF_Y + 0.2, 0], edge: true, amp: 0.006 });
  const roof = rb.finish();
  roof.name = 'roof';
  roof.visible = false;
  root.add(roof);

  return { roof, groups, ground };
}

function addRisers(root) {
  const b = new Builder(2);
  // The shaft is a hole, not a decoration. Every service inside it is drawn by the
  // cable, pipe and fiber layers from their own schedules, in its own lane, so what
  // you see in the shaft is what is actually installed there.

  // Shaft enclosure: four corner angles and a frame at every slab, so a riser reads
  // as a shaft passing through floors rather than a line floating in the building.
  const S = 0.95;
  for (const r of RISERS) {
    const len = r.to - r.from;
    const midY = r.from + len / 2;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      b.box(0.07, len, 0.07, C.dark, {
        pos: [r.x + sx * S, midY, r.z + sz * S], edge: true, amp: 0.003
      });
    }
    for (const lv of LEVELS) {
      if (lv.y < r.from || lv.y > r.to) continue;
      for (const s2 of [-1, 1]) {
        b.box(2 * S, 0.05, 0.05, C.dark, { pos: [r.x, lv.y + 0.03, r.z + s2 * S], edge: false });
        b.box(0.05, 0.05, 2 * S, C.dark, { pos: [r.x + s2 * S, lv.y + 0.03, r.z], edge: false });
      }
      // sleeve through the slab: the hole the service actually passes through
      b.box(1.05, 0.1, 1.05, C.ghost, { pos: [r.x, lv.y + 0.02, r.z], edge: true, amp: 0.002 });
    }
    if (r.kind === 'lift') {
      for (const s2 of [-1, 1]) {
        b.box(0.06, len, 0.12, C.steel, { pos: [r.x + s2 * 0.75, midY, r.z], edge: false });
        b.box(0.06, len, 0.12, C.steel, { pos: [r.x, midY, r.z + s2 * 0.75], edge: false });
      }
    }
  }

  const g = b.finish();
  g.name = 'risers';
  root.add(g);
}

/* ------------------------------------------------------------------ */
/* Equipment                                                           */
/* ------------------------------------------------------------------ */

export function buildSite() {
  const root = new THREE.Group();
  const shell = addShell(root);
  addRisers(root);

  const items = [];            // { key, tag, group, anchor, floor, system }
  const byKey = {};            // key -> [item, ...]
  const pickRoots = [];

  const floorY = (id) => (LEVELS.find((l) => l.id === id) || LEVELS[0]).y;

  function register(key, kind, group, floor, opt) {
    const meta = EQUIPMENT[key] || {};
    const info = INDEX[key] || {};
    group.userData = {
      key,
      tag: meta.tag || key,
      name: meta.name || key,
      system: info.system || 'fac',
      floor,
      selectable: true
    };
    const box3 = new THREE.Box3().setFromObject(group);
    const anchor = box3.getCenter(new THREE.Vector3());
    anchor.y = box3.max.y + 0.5;
    const item = { key, tag: group.userData.tag, name: group.userData.name, group, anchor, floor, system: group.userData.system };
    tintGroup(group, SYS_COLOR[group.userData.system] || '#5A6B82', 0.16);
    items.push(item);
    (byKey[key] || (byKey[key] = [])).push(item);
    pickRoots.push(group);
  }

  for (const [key, p] of Object.entries(PLACE)) {
    if (!KINDS[p.kind]) { console.warn('missing kind', p.kind); continue; }
    const y = floorY(p.floor);
    for (const [x, z, rot, yoff] of p.spots) {
      const b = new Builder(p.kind === 'rack' ? 2 : 3);
      KINDS[p.kind](b, p.opt || {});
      const g = b.finish();
      g.position.set(x, y + (yoff || 0), z);
      g.rotation.y = rot || 0;
      root.add(g);
      register(key, p.kind, g, p.floor, p.opt);
    }
  }

  // racks
  for (const r of RACKS) {
    const b = new Builder(2);
    KINDS.rack(b, { coldPlate: true });
    const g = b.finish();
    g.position.set(r.x, 6, r.z);
    root.add(g);
    register('rack', 'rack', g, 'L1');
    g.userData.hall = r.hall;

    const bbu = new Builder(2);
    KINDS.bbu(bbu);
    const gb = bbu.finish();
    gb.position.set(r.x, 6 + 0.05, r.z + 0.3);
    root.add(gb);
    register('bbu', 'bbu', gb, 'L1');

    const pdu = new Builder(2);
    KINDS.rackpdu(pdu);
    const gp = pdu.finish();
    gp.position.set(r.x + 0.5, 6, r.z);
    root.add(gp);
    register('rackpdu', 'rackpdu', gp, 'L1');
  }

  // one exposed cold plate module, drawn on top of the first rack so the load
  // end of the liquid loop has something to point at
  {
    const r = RACKS[0];
    const b = new Builder(2);
    KINDS.coldplate(b);
    const g = b.finish();
    g.position.set(r.x, 6 + 2.28, r.z);
    root.add(g);
    register('coldplate', 'coldplate', g, 'L1');
  }

  return { root, items, byKey, shell, pickRoots };
}

export function floorOf(obj) {
  let o = obj;
  while (o) {
    if (o.userData && o.userData.floor) return o.userData.floor;
    o = o.parent;
  }
  return null;
}

export function equipmentKeyOf(obj) {
  let o = obj;
  while (o) {
    if (o.userData && o.userData.key) return o.userData.key;
    o = o.parent;
  }
  return null;
}

export { RACKS, SYS_COLOR, hex };
