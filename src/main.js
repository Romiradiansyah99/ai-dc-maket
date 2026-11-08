import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { Nav } from './controls.js';
import { buildSite, equipmentKeyOf } from './scene/build.js';
import { FlowLayer } from './scene/flow.js';
import { Tree, Panel, Walk } from './ui.js';
import { buildCableLayer } from './scene/cables.js';
import { CABLE_BY_ID } from './data/cables.js';
import { buildPipeLayer } from './scene/pipes.js';
import { PIPE_BY_ID } from './data/pipes.js';
import { LEVELS, ROOMS, BUILDING, RISERS } from './data/layout.js';
import { EQUIPMENT, INDEX, FLOWS, SYS_COLOR, SYSTEMS } from './data/systems.js';

/* ---------------- renderer ---------------- */

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();

const VIEW_H = 46;
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 900);
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  camera.left = (-VIEW_H * aspect) / 2;
  camera.right = (VIEW_H * aspect) / 2;
  camera.top = VIEW_H / 2;
  camera.bottom = -VIEW_H / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
}
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:3';
document.body.appendChild(labelRenderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x93a7c4, 1.55));
const key = new THREE.DirectionalLight(0xffffff, 0.42);
key.position.set(40, 60, 30);
scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.18);
fill.position.set(-40, 20, -30);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 0.1);
rim.position.set(0, 10, 60);
scene.add(rim);

const nav = new Nav(camera, canvas);
window.__nav = nav;  // debugging hook: inspect camera state from the console
resize();
window.addEventListener('resize', resize);

/* ---------------- content ---------------- */

const site = buildSite();
scene.add(site.root);

// Cables are routed from the real equipment anchors, so they cannot drift from the model.
const cables = buildCableLayer(site);
scene.add(cables.root);

// Piping is built from the pipe schedule against the same equipment anchors.
const pipes = buildPipeLayer(site);
scene.add(pipes.root);

// The structure is context, not content: fade it so the electrical layer reads clearly.
for (const g of Object.values(site.shell.groups)) {
  g.traverse((o) => {
    if (o.isMesh && o.material) {
      o.material = o.material.clone();
      o.material.transparent = true;
      o.material.opacity = 0.14;
      o.material.depthWrite = false;
    } else if (o.isLineSegments && o.material) {
      o.material = o.material.clone();
      o.material.transparent = true;
      o.material.opacity = 0.18;
    }
  });
}

const flow = new FlowLayer(scene);

const state = {
  level: 'ALL',
  exploded: false,
  roof: false,
  paper: true,
  cables: true,
  pipes: true,
  structure: true,
  selected: null,
  hovered: null
};

const levelIndex = (id) => LEVELS.findIndex((l) => l.id === id);
site.items.forEach((it) => {
  it.group.userData.baseY = it.group.position.y;
});

/* ---------------- labels ---------------- */

const roomLabels = [];
for (const lv of LEVELS) {
  for (const r of (ROOMS[lv.id] || [])) {
    const d = document.createElement('div');
    d.className = 'lbl lbl-room';
    d.textContent = r.name;
    const o = new CSS2DObject(d);
    o.position.set((r.x[0] + r.x[1]) / 2, lv.y + 0.9, (r.z[0] + r.z[1]) / 2);
    o.userData = { level: lv.id };
    scene.add(o);
    roomLabels.push(o);
  }
}
const yardLabels = [];
for (const y of [
  { name: 'Customer Substation', x: -41, z: -9 },
  { name: 'Generator Yard', x: -21, z: -32 },
  { name: 'Fuel Farm', x: -8, z: -32 },
  { name: 'Cooling Towers', x: 5, z: -32 },
  { name: 'Dry Coolers', x: 23.5, z: -32 }
]) {
  const d = document.createElement('div');
  d.className = 'lbl lbl-room';
  d.textContent = y.name;
  const o = new CSS2DObject(d);
  o.position.set(y.x, 1.4, y.z);
  scene.add(o);
  yardLabels.push(o);
}

// Shaft labels: a riser is useless if nobody can find the shaft.
const shaftLabels = [];
for (const r of RISERS) {
  const d = document.createElement('div');
  d.className = 'lbl lbl-shaft';
  d.textContent = r.name;
  const o = new CSS2DObject(d);
  o.position.set(r.x, LEVELS[1].y + 1.1, r.z);
  scene.add(o);
  shaftLabels.push(o);
}

const focusLabel = document.createElement('div');
focusLabel.className = 'lbl lbl-eq';
const focusObj = new CSS2DObject(focusLabel);
focusObj.visible = false;
scene.add(focusObj);

/* ---------------- selection ---------------- */

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const tooltip = document.getElementById('tooltip');

function pickAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const targets = site.pickRoots.slice();
  if (cables.root.visible) targets.push(cables.root);
  if (pipes.root.visible) targets.push(pipes.root);
  const hits = raycaster.intersectObjects(targets, true);
  for (const h of hits) {
    if (!h.object.visible) continue;
    let o = h.object;
    while (o && !(o.userData && (o.userData.key || o.userData.cableId || o.userData.pipeId))) o = o.parent;
    if (o && o.visible) return o;
  }
  return null;
}

nav.onHover = (e) => {
  const obj = pickAt(e.clientX, e.clientY);
  if (obj) {
    canvas.style.cursor = 'pointer';
    tooltip.textContent = obj.userData.cableId
      ? obj.userData.cableId + '  ' + (CABLE_BY_ID[obj.userData.cableId] || {}).conductor
      : obj.userData.pipeId
        ? obj.userData.pipeId + '  DN' + (PIPE_BY_ID[obj.userData.pipeId] || {}).dn
        : obj.userData.tag + '  ' + obj.userData.name;
    tooltip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 10}px)`;
    tooltip.classList.add('on');
  } else {
    canvas.style.cursor = 'grab';
    tooltip.classList.remove('on');
  }
};

nav.onPick = (e) => {
  const obj = pickAt(e.clientX, e.clientY);
  if (obj && obj.userData.cableId) selectCable(obj.userData.cableId);
  else if (obj && obj.userData.pipeId) selectPipe(obj.userData.pipeId);
  else if (obj) select(obj.userData.key, obj);
  else deselect();
};

function selectPipe(id) {
  const p = pipes.byId[id];
  if (!p) return;
  state.selected = 'pipe:' + id;
  tree.setActive(null);
  panel.showPipe(p.def, p.length);
  document.body.classList.add('has-selection');
  const mid = p.points[Math.floor(p.points.length / 2)];
  focusLabel.textContent = id;
  focusObj.position.copy(mid).add(new THREE.Vector3(0, 0.6, 0));
  focusObj.visible = true;
  flyTo(mid.clone(), Math.max(nav.zoom, 1.1));
}

function selectCable(id) {
  const c = cables.byId[id];
  if (!c) return;
  state.selected = 'cable:' + id;
  tree.setActive(null);
  panel.showCable(c.def, c.length);
  document.body.classList.add('has-selection');
  const mid = c.points[Math.floor(c.points.length / 2)];
  focusLabel.textContent = id;
  focusObj.position.copy(mid).add(new THREE.Vector3(0, 0.6, 0));
  focusObj.visible = true;
  flyTo(mid.clone(), Math.max(nav.zoom, 1.1));
}

function anchorFor(k) {
  const list = site.byKey[k];
  if (!list || !list.length) return null;
  return list[Math.floor(list.length / 2)].anchor;
}

function select(k, obj) {
  const item = obj ? site.items.find((i) => i.group === obj) : site.byKey[k] && site.byKey[k][0];
  state.selected = k;
  panel.show(k, focusKey);
  tree.setActive(k);
  const a = item ? item.anchor : anchorFor(k);
  if (a) {
    focusLabel.textContent = (EQUIPMENT[k] && EQUIPMENT[k].tag) || k;
    focusObj.position.copy(a);
    focusObj.visible = true;
  }
  document.body.classList.add('has-selection');
}

function deselect() {
  state.selected = null;
  panel.clear();
  tree.setActive(null);
  focusObj.visible = false;
  document.body.classList.remove('has-selection');
}

function focusKey(k) {
  const a = anchorFor(k);
  if (!a) return;
  const lvl = (site.byKey[k] && site.byKey[k][0].floor) || 'ALL';
  if (state.level !== 'ALL' && state.level !== lvl) setLevel('ALL');
  flyTo(a, Math.max(nav.zoom, 1.9));
  select(k);
}

/* ---------------- camera flight ---------------- */

let flight = null;
function flyTo(target, zoom, dur = 620) {
  flight = {
    t: 0,
    dur,
    fromT: nav.target.clone(),
    toT: target.clone(),
    fromZ: nav.zoom,
    toZ: zoom
  };
}
function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

/* ---------------- level / display ---------------- */

function applyDisplay() {
  const lvl = state.level;
  site.items.forEach((it) => {
    const vis = lvl === 'ALL' || it.floor === lvl;
    it.group.visible = vis;
    if (state.exploded) {
      it.group.position.y = it.group.userData.baseY + levelIndex(it.floor) * 4.2;
    } else {
      it.group.position.y = it.group.userData.baseY;
    }
  });
  for (const [id, g] of Object.entries(site.shell.groups)) {
    g.visible = state.structure && (lvl === 'ALL' || id === lvl);
  }
  // cables span floors, so they are only honest when the whole site is shown
  cables.root.visible = state.cables && lvl === 'ALL' && !state.exploded;
  pipes.root.visible = state.pipes && lvl === 'ALL' && !state.exploded;
  site.shell.roof.visible = state.roof && (lvl === 'ALL' || lvl === 'L2');
  const risers = site.root.getObjectByName('risers');
  if (risers) risers.visible = lvl === 'ALL' && !state.exploded;

  roomLabels.forEach((o) => {
    o.visible = lvl !== 'ALL' && o.userData.level === lvl;
  });
  yardLabels.forEach((o) => { o.visible = lvl === 'L0'; });
  const risersGroup = site.root.getObjectByName('risers');
  shaftLabels.forEach((o) => { o.visible = !!risersGroup && risersGroup.visible; });
  document.querySelectorAll('#levels button').forEach((b) => {
    b.classList.toggle('on', b.dataset.level === lvl);
  });
}

function setLevel(id) {
  state.level = id;
  applyDisplay();
  const targetY = id === 'ALL' ? 8 : (LEVELS.find((l) => l.id === id).y + 3);
  const center = id === 'ALL' ? new THREE.Vector3(0, 8, -4) : new THREE.Vector3(0, targetY, -4);
  flyTo(center, id === 'ALL' ? 0.42 : 0.9, 700);
}

/* ---------------- ui wiring ---------------- */

const tree = new Tree(document.getElementById('tree'), {
  onSelect: (k) => focusKey(k),
  onToggle: (sid, on) => {
    site.items.filter((i) => i.system === sid).forEach((i) => {
      i.group.visible = on && (state.level === 'ALL' || i.floor === state.level);
    });
  }
});

const panel = new Panel(document.getElementById('panel'), {
  onClose: deselect,
  onCable: (id) => selectCable(id),
  onPipe: (id) => selectPipe(id)
});

// Resolve a walkthrough stage into the real geometry of the connection it names.
// Direction is taken from the previous stage, so the pulse always travels the way
// the current flows, not the way the schedule happens to be written.
function segmentFor(prevKey, link) {
  if (!link) return null;
  const src = cables.byId[link] || pipes.byId[link];
  if (!src) { console.warn('walkthrough link not found', link); return null; }
  const def = src.def;
  let pts = src.points;
  let connected = true;
  if (def.from === prevKey) {
    // already pointing the right way
  } else if (def.to === prevKey) {
    pts = pts.slice().reverse();
  } else {
    connected = false;
  }
  return { points: pts, connected, id: link };
}

const walk = new Walk(document.getElementById('walk'), {
  onStart: (f) => {
    const segs = f.nodes.map((n, i) => (i === 0 ? null : segmentFor(f.nodes[i - 1].k, n.link)));
    flow.build(f, segs);
    if (state.level !== 'ALL') setLevel('ALL');
  },
  onStep: (f, i) => {
    const n = f.nodes[i];
    flow.setStep(i);
    const seg = flow.anchorAt(i);
    if (seg) {
      // frame the whole connection: a long riser run needs a wider shot than a jumper
      const z = Math.min(2.4, Math.max(0.5, 42 / Math.max(8, seg.length * 1.6)));
      flyTo(seg.mid, z, 900);
    } else {
      const a = anchorFor(n.k);
      if (a) flyTo(a, Math.max(nav.zoom, 1.2), 900);
    }
    select(n.k);
    document.getElementById('status').textContent =
      `${f.name} · ${i + 1}/${f.nodes.length} · ${n.state}`;
  },
  onStop: () => {
    flow.setVisible(false);
    document.getElementById('status').textContent = 'Ready';
  }
});

document.querySelectorAll('#levels button').forEach((b) => {
  b.onclick = () => {
    if (flow.visible) { flow.setVisible(false); walk.reset(); }
    setLevel(b.dataset.level);
  };
});
document.querySelectorAll('#views button').forEach((b) => {
  b.onclick = () => {
    if (b.dataset.view === 'fit') { nav.fit(58, new THREE.Vector3(0, 7, -4)); }
    else if (b.dataset.view === 'risers') {
      // the four shafts sit in a line near z 11; frame them so the risers are readable
      if (state.level !== 'ALL') setLevel('ALL');
      nav.focus(new THREE.Vector3(2, 7, 11), 1.25);
      nav.theta = Math.PI * 0.62;
      nav.phi = Math.PI * 0.4;
      nav.apply();
    } else nav.view(b.dataset.view);
  };
});
document.getElementById('chkRoof').onchange = (e) => { state.roof = e.target.checked; applyDisplay(); };
document.getElementById('chkCables').onchange = (e) => {
  state.cables = e.target.checked;
  applyDisplay();
};
document.getElementById('chkPipes').onchange = (e) => {
  state.pipes = e.target.checked;
  applyDisplay();
};
document.getElementById('chkStructure').onchange = (e) => {
  state.structure = e.target.checked;
  applyDisplay();
};
document.getElementById('chkExplode').onchange = (e) => { state.exploded = e.target.checked; applyDisplay(); };
document.getElementById('chkPaper').onchange = (e) => {
  state.paper = e.target.checked;
  document.body.classList.toggle('no-paper', !state.paper);
};
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') deselect();
});

/* pad placement: it sits above the walkthrough bar, and must never be covered by it */
function placePad() {
  const walkEl = document.getElementById('walk');
  const pad = document.getElementById('pad');
  if (!walkEl || !pad) return;
  const h = walkEl.getBoundingClientRect().height;
  pad.style.bottom = (34 + h + 12) + 'px';
}
window.addEventListener('resize', placePad);

document.querySelectorAll('#pad button').forEach((b) => {
  b.onclick = () => {
    if (b.dataset.pan) {
      const [fx, fy] = b.dataset.pan.split(',').map(Number);
      nav.panStep(fx, fy);
    } else if (b.dataset.zoom === 'in') {
      nav.zoomTo(new THREE.Vector2(0, 0), 1.25);
    } else {
      nav.zoomTo(new THREE.Vector2(0, 0), 0.8);
    }
  };
});

const help = document.getElementById('help');
document.getElementById('btnHelp').onclick = () => help.classList.add('on');
document.getElementById('btnHelpClose').onclick = () => help.classList.remove('on');
help.onclick = (e) => { if (e.target === help) help.classList.remove('on'); };

/* ---------------- loop ---------------- */

const clock = new THREE.Clock();
function tick() {
  const dt = clock.getDelta();
  const t = clock.elapsedTime;

  if (flight) {
    flight.t += dt * 1000;
    const p = Math.min(1, flight.t / flight.dur);
    const e = ease(p);
    nav.target.lerpVectors(flight.fromT, flight.toT, e);
    nav.zoom = flight.fromZ + (flight.toZ - flight.fromZ) * e;
    nav.apply();
    if (p >= 1) flight = null;
  }

  flow.update(t);
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(tick);
}

/* ---------------- boot ---------------- */

function boot() {
  applyDisplay();
  placePad();
  nav.fit(62, new THREE.Vector3(0, 7, -4));
  nav.zoom = 0.56;
  flyTo(new THREE.Vector3(0, 7, -4), 0.56, 1);
  document.getElementById('loading').classList.add('done');
  const total = site.items.filter((i) => i.key === 'rack').length;
  document.getElementById('status').textContent =
    `${SYSTEMS.length} systems · ${Object.keys(EQUIPMENT).length} equipment types · ${total} AI racks · 3 levels`;
  window.__app = { scene, camera, nav, site, flow, cables, pipes, select, selectCable, selectPipe, setLevel, state, EQUIPMENT, INDEX, FLOWS, SYS_COLOR };
}
boot();
tick();
