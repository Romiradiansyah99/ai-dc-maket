// Left tree, right detail panel, walkthrough bar, heads up controls.
import { EQUIPMENT, SYSTEMS, INDEX, FLOWS, SYS_COLOR } from './data/systems.js';
import { PHOTOS } from './data/photos.js';
import { VIDEOS } from './data/videos.js';
import { CABLES_TOUCHING } from './data/cables.js';
import { PIPES_TOUCHING, SERVICE } from './data/pipes.js';

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

const ytSearch = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
const ytWatch = (id) => 'https://www.youtube.com/watch?v=' + id;

/* ------------------------------------------------------------------ */
/* Tree                                                                */
/* ------------------------------------------------------------------ */

export class Tree {
  constructor(mount, { onSelect, onToggle }) {
    this.mount = mount;
    this.onSelect = onSelect;
    this.onToggle = onToggle;
    this.open = new Set(['elec']);
    this.visibleSystems = new Set(SYSTEMS.map((s) => s.id));
    this.activeKey = null;
    this.render();
  }

  render() {
    this.mount.innerHTML = '';
    for (const s of SYSTEMS) {
      const block = el('div', 'sys');
      const head = el('div', 'sys-head');
      head.style.setProperty('--c', SYS_COLOR[s.id]);
      const eye = el('button', 'eye' + (this.visibleSystems.has(s.id) ? '' : ' off'));
      eye.title = this.visibleSystems.has(s.id) ? 'Hide system' : 'Show system';
      eye.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>';
      eye.onclick = (e) => {
        e.stopPropagation();
        if (this.visibleSystems.has(s.id)) this.visibleSystems.delete(s.id);
        else this.visibleSystems.add(s.id);
        this.onToggle(s.id, this.visibleSystems.has(s.id));
        this.render();
      };
      const title = el('button', 'sys-name');
      title.innerHTML = `<span class="dot"></span>${s.name}<span class="count">${s.subsystems.reduce((a, b) => a + b.items.length, 0)}</span>`;
      title.onclick = () => {
        if (this.open.has(s.id)) this.open.delete(s.id);
        else this.open.add(s.id);
        this.render();
      };
      head.append(eye, title);
      block.append(head);

      if (this.open.has(s.id)) {
        const body = el('div', 'sys-body');
        for (const sub of s.subsystems) {
          const subEl = el('div', 'sub');
          subEl.append(el('div', 'sub-name', sub.name));
          const list = el('div', 'items');
          for (const k of sub.items) {
            const e = EQUIPMENT[k];
            if (!e) continue;
            const row = el('button', 'item' + (this.activeKey === k ? ' on' : ''));
            row.innerHTML = `<span class="tag">${e.tag}</span><span class="nm">${e.name}</span>`;
            row.onclick = () => this.onSelect(k);
            list.append(row);
          }
          subEl.append(list);
          body.append(subEl);
        }
        block.append(body);
      }
      this.mount.append(block);
    }
  }

  setActive(key) {
    if (this.activeKey === key) return;
    this.activeKey = key;
    if (key) {
      const info = INDEX[key];
      if (info) this.open.add(info.system);
    }
    this.render();
    const on = this.mount.querySelector('.item.on');
    if (on) on.scrollIntoView({ block: 'nearest' });
  }
}

/* ------------------------------------------------------------------ */
/* Detail panel                                                        */
/* ------------------------------------------------------------------ */

export class Panel {
  constructor(mount, opts = {}) {
    this.mount = mount;
    this.current = null;
    this.onClose = opts.onClose || null;
    this.onCable = opts.onCable || null;
    this.onPipe = opts.onPipe || null;
  }

  clear() {
    this.current = null;
    this.mount.classList.remove('open');
    this.mount.innerHTML = '';
  }

  show(key, onFocus) {
    const e = EQUIPMENT[key];
    if (!e) return;
    this.current = key;
    const info = INDEX[key] || {};
    const c = SYS_COLOR[info.system] || '#1F4E8C';

    const rows = (arr, cls) => arr.map((x) => `<li class="${cls || ''}">${x}</li>`).join('');
    const spec = (e.spec || []).map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join('');
    const refs = (e.refs || []).map(([k, v]) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`).join('');
    const resolved = (VIDEOS[key] || []);
    const vids = resolved.length
      ? resolved.map((v) => `<a class="vid" href="${ytWatch(v.id)}" target="_blank" rel="noopener">
          <img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy">
          <span><b>${v.title}</b><em>${v.channel}</em></span></a>`).join('')
      : (e.videos || []).map((v) => `<a class="vid" href="${ytSearch(v.q || v.title)}" target="_blank" rel="noopener">
          <span class="vicon"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
          <span><b>${v.title}</b><em>search YouTube</em></span></a>`).join('');

    const ph = PHOTOS[key];
    const wires = CABLES_TOUCHING(key).map((c) => {
      const dir = c.from === key ? 'out' : 'in';
      const other = dir === 'out' ? c.to : c.from;
      const otherName = (EQUIPMENT[other] && EQUIPMENT[other].tag) || other;
      return `<button class="cablerow" data-cable="${c.id}">
          <span class="cid">${c.id}<i class="dir ${dir}">${dir === 'out' ? 'feeds' : 'fed by'}</i></span>
          <span class="cto">${otherName}</span>
          <span class="cspec">${c.conductor}</span>
        </button>`;
    }).join('');
    const cables = wires ? `<section class="cablelist">
          <h3>Electrical connections</h3>
          ${wires}
        </section>` : '';

    const plines = PIPES_TOUCHING(key).map((pp) => {
      const svc = SERVICE[pp.service] || {};
      const other = pp.from === key ? pp.to : pp.from;
      const otherName = (EQUIPMENT[other] && EQUIPMENT[other].tag) || other;
      return `<button class="piperow" data-pipe="${pp.id}" style="--sc:#${(svc.color || 0x5A6B82).toString(16).padStart(6, '0')}">
          <span class="cid">${pp.id}<i class="dir">${pp.from === key ? 'feeds' : 'fed by'}</i></span>
          <span class="cto">${otherName}</span>
          <span class="cspec">DN${pp.dn} · ${svc.short || ''} · ${pp.temp}</span>
        </button>`;
    }).join('');
    const pipework = plines ? `<section class="cablelist pipelist">
          <h3>Pipework</h3>
          ${plines}
        </section>` : '';

    const shot = `<figure class="shot">
          <img src="media/shots/${key}.png" alt="${e.name} model view" loading="lazy"
               onerror="this.closest('figure').remove()">
          <figcaption>Model view · rendered from this model's geometry</figcaption>
        </figure>`;
    const photo = ph ? `<figure class="photo">
          <img src="media/photos/${key}.jpg" alt="${e.name}" loading="lazy"
               onerror="this.closest('figure').remove()">
          <figcaption>Reference photograph · ${ph.credit} · ${ph.licence} · <a href="${ph.page}" target="_blank" rel="noopener">source</a></figcaption>
        </figure>` : '';

    this.mount.innerHTML = `
      <button class="close" title="Close">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M5 5l14 14M19 5 5 19"/>
        </svg>
      </button>
      <div class="p-head" style="--c:${c}">
        <div class="p-crumb">${info.systemName || ''} <span>/</span> ${info.subName || ''}</div>
        <h2>${e.name}</h2>
        <div class="p-tagrow"><span class="pill">${e.tag}</span><span class="p-short">${e.short || ''}</span></div>
      </div>
      <div class="p-body">
        <p class="philo">${e.philosophy || ''}</p>
        ${cables}
        ${pipework}
        ${shot}
        ${photo}
        <section>
          <h3>What it does</h3>
          <p>${e.function || ''}</p>
        </section>
        <section>
          <h3>Design values</h3>
          <div class="kvs">${spec}</div>
        </section>
        <section>
          <h3>Where it fails</h3>
          <ul class="risks">${rows(e.risks || [])}</ul>
        </section>
        <section>
          <h3>Commissioning checks</h3>
          <ul class="tests">${rows(e.tests || [])}</ul>
        </section>
        <section>
          <h3>Reference figures</h3>
          <div class="kvs">${refs}</div>
        </section>
        <section class="videos">
          <h3>Learn more</h3>
          ${vids}
        </section>
        <button class="focus-btn">Focus in model</button>
      </div>`;

    this.mount.classList.add('open');
    const closeBtn = this.mount.querySelector('.close');
    if (closeBtn && this.onClose) closeBtn.onclick = () => this.onClose();
    this.mount.querySelector('.focus-btn').onclick = () => onFocus && onFocus(key);
    this.mount.querySelectorAll('.cablerow').forEach((b) => {
      b.onclick = () => this.onCable && this.onCable(b.dataset.cable);
    });
    this.mount.querySelectorAll('.piperow').forEach((b) => {
      b.onclick = () => this.onPipe && this.onPipe(b.dataset.pipe);
    });
    this.mount.querySelector('.p-body').scrollTop = 0;
  }

  showPipe(def, length) {
    if (!def) return;
    this.current = 'pipe:' + def.id;
    this.mount.innerHTML = `
      <button class="close" title="Close">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M5 5l14 14M19 5 5 19"/>
        </svg>
      </button>
      ${pipeCardHTML(def, length)}`;
    this.mount.classList.add('open');
    const closeBtn = this.mount.querySelector('.close');
    if (closeBtn && this.onClose) closeBtn.onclick = () => this.onClose();
    this.mount.querySelector('.p-body').scrollTop = 0;
  }

  showCable(def, length) {
    if (!def) return;
    this.current = 'cable:' + def.id;
    this.mount.innerHTML = `
      <button class="close" title="Close">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M5 5l14 14M19 5 5 19"/>
        </svg>
      </button>
      ${cableCardHTML(def, length)}`;
    this.mount.classList.add('open');
    const closeBtn = this.mount.querySelector('.close');
    if (closeBtn && this.onClose) closeBtn.onclick = () => this.onClose();
    this.mount.querySelector('.p-body').scrollTop = 0;
  }
}

/* ------------------------------------------------------------------ */
/* Cable card                                                          */
/* ------------------------------------------------------------------ */

const KIND_NAME = {
  mv: 'Medium voltage cable',
  lv: 'Low voltage cable',
  duct: 'Busduct',
  dc: 'Flexible tap cable',
  earth: 'Earthing conductor'
};

export function cableCardHTML(def, length, anchors) {
  const fromName = (EQUIPMENT[def.from] && EQUIPMENT[def.from].name) || def.from;
  const toName = (EQUIPMENT[def.to] && EQUIPMENT[def.to].name) || def.to;
  return `
    <div class="p-head" style="--c:#8A1F2B">
      <div class="p-crumb">Electrical system <span>/</span> ${KIND_NAME[def.kind] || 'Cable'}</div>
      <h2>${def.id}</h2>
      <div class="p-tagrow"><span class="pill">${def.kind.toUpperCase()}</span><span class="p-short">${fromName} to ${toName}</span></div>
    </div>
    <div class="p-body">
      <p class="philo">${def.note || ''}</p>
      <section>
        <h3>Schedule</h3>
        <div class="kvs">
          <div class="kv"><span>From</span><b>${fromName}</b></div>
          <div class="kv"><span>To</span><b>${toName}</b></div>
          <div class="kv"><span>Voltage</span><b>${def.voltage}</b></div>
          <div class="kv"><span>Conductor</span><b>${def.conductor}</b></div>
          <div class="kv"><span>Circuits drawn</span><b>${def.circuits}</b></div>
          <div class="kv"><span>Design load</span><b>${def.load}</b></div>
          <div class="kv"><span>Route length</span><b>${length ? length.toFixed(1) + ' m' : 'n/a'}</b></div>
        </div>
      </section>
      <section>
        <h3>Route</h3>
        <p>${def.routeNote || ''}</p>
      </section>
      <section>
        <h3>Why it is routed this way</h3>
        <p>${def.tray === 'buried'
          ? 'Buried in a duct bank at grade, run on the two axes in turn, entering each end at floor level.'
          : (def.render && def.render.type === 'duct'
            ? `Rises to its own busduct support level at ${def.tray} m, runs on the two axes in turn, then drops into the far end. It does not sit in a tray: at this current it is the tray.`
            : `Leaves the equipment, rises into the cable tray at ${def.tray} m, runs along the two axes in turn, then drops into the far end.`)} Bends are swept, not mitred, and nothing crosses a room diagonally.</p>
      </section>
    </div>`;
}

export function pipeCardHTML(def, length) {
  const svc = SERVICE[def.service] || {};
  const fromName = (EQUIPMENT[def.from] && EQUIPMENT[def.from].name) || def.from;
  const toName = (EQUIPMENT[def.to] && EQUIPMENT[def.to].name) || def.to;
  const hex = '#' + (svc.color || 0x5A6B82).toString(16).padStart(6, '0');
  return `
    <div class="p-head" style="--c:${hex}">
      <div class="p-crumb">Mechanical <span>/</span> ${svc.name || 'Pipework'}</div>
      <h2>${def.id}</h2>
      <div class="p-tagrow"><span class="pill" style="background:${hex}">${svc.short || ''}</span><span class="p-short">${fromName} to ${toName}</span></div>
    </div>
    <div class="p-body">
      <p class="philo">${def.note || ''}</p>
      <section>
        <h3>Schedule</h3>
        <div class="kvs">
          <div class="kv"><span>From</span><b>${fromName}</b></div>
          <div class="kv"><span>To</span><b>${toName}</b></div>
          <div class="kv"><span>Service</span><b>${svc.name || ''}</b></div>
          <div class="kv"><span>Line size</span><b>DN${def.dn}</b></div>
          <div class="kv"><span>Medium</span><b>${def.medium}</b></div>
          <div class="kv"><span>Temperature</span><b>${def.temp}</b></div>
          <div class="kv"><span>Design flow</span><b>${def.flow}</b></div>
          <div class="kv"><span>Insulation</span><b>${def.insulation}</b></div>
          <div class="kv"><span>Route length</span><b>${length ? length.toFixed(1) + ' m' : 'n/a'}</b></div>
        </div>
      </section>
      <section>
        <h3>Route</h3>
        <p>${def.routeNote || ''}</p>
      </section>
      <section>
        <h3>Why it is drawn this way</h3>
        <p>${def.elev === 'buried'
          ? 'Buried at grade in a duct, entering each end below floor level, with the slab penetrations shown where it rises.'
          : `Runs at ${def.elev} m above its own floor, on hangers to the slab, with flanges every 6 m and an isolation valve at each equipment connection.`} Where it crosses a floor the sleeve is drawn, because a riser is a hole in a slab with a fire stop around it, not a line on a drawing.</p>
      </section>
    </div>`;
}

/* ------------------------------------------------------------------ */
/* Walkthrough bar                                                     */
/* ------------------------------------------------------------------ */

export class Walk {
  constructor(mount, { onStart, onStep, onStop }) {
    this.mount = mount;
    this.onStart = onStart;
    this.onStep = onStep;
    this.onStop = onStop;
    this.flowId = FLOWS[0].id;
    this.step = -1;
    this.playing = false;
    this.timer = null;
    this.render();
  }

  get flow() {
    return FLOWS.find((f) => f.id === this.flowId);
  }

  render() {
    const f = this.flow;
    this.mount.innerHTML = `
      <div class="w-left">
        <div class="w-tabs">
          ${FLOWS.map((x) => `<button class="w-tab${x.id === this.flowId ? ' on' : ''}" data-flow="${x.id}">${x.name}</button>`).join('')}
        </div>
        <div class="w-narr">
          <span class="w-state">${this.step >= 0 ? f.nodes[this.step].state : f.blurb}</span>
          <span class="w-note">${this.step >= 0 ? f.nodes[this.step].note : ''}</span>
        </div>
      </div>
      <div class="w-right">
        <div class="w-prog">${f.nodes.map((n, i) => `<i class="${i <= this.step ? 'on' : ''}"></i>`).join('')}</div>
        <div class="w-btns">
          <button class="wbtn play">${this.playing ? 'Pause' : 'Play'}</button>
          <button class="wbtn step">Next</button>
          <button class="wbtn reset" title="Reset walkthrough">Reset</button>
        </div>
      </div>`;

    this.mount.querySelectorAll('.w-tab').forEach((b) => {
      b.onclick = () => {
        this.setFlow(b.dataset.flow);
      };
    });
    this.mount.querySelector('.play').onclick = () => this.togglePlay();
    this.mount.querySelector('.step').onclick = () => this.next();
    this.mount.querySelector('.reset').onclick = () => this.reset();
  }

  setFlow(id) {
    this.stopTimer();
    this.flowId = id;
    this.step = -1;
    this.render();
    this.onStart(this.flow);
    this.playing = true;
    this.next();
    this.startTimer();
  }

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (this.step >= this.flow.nodes.length - 1) {
        this.playing = false;
        this.stopTimer();
        this.render();
        return;
      }
      this.next();
    }, 5600);
  }

  togglePlay() {
    if (this.playing) {
      this.playing = false;
      this.stopTimer();
      this.render();
      return;
    }
    this.playing = true;
    if (this.step < 0) this.onStart(this.flow);
    this.next();
    this.startTimer();
  }

  next() {
    if (this.step >= this.flow.nodes.length - 1) return;
    this.step++;
    this.onStep(this.flow, this.step);
    this.render();
  }

  reset() {
    this.stopTimer();
    this.step = -1;
    this.playing = false;
    this.onStop();
    this.render();
  }

  stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
