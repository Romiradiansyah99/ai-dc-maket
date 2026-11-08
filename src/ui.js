// Left tree, right detail panel, walkthrough bar, heads up controls.
import { EQUIPMENT, SYSTEMS, INDEX, FLOWS, SYS_COLOR } from './data/systems.js';
import { PHOTOS } from './data/photos.js';
import { VIDEOS } from './data/videos.js';

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
    const photo = ph ? `<figure class="photo">
          <img src="media/photos/${key}.jpg" alt="${e.name}" loading="lazy"
               onerror="this.closest('figure').remove()">
          <figcaption>${ph.credit} · ${ph.licence} · <a href="${ph.page}" target="_blank" rel="noopener">source</a></figcaption>
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
    this.mount.querySelector('.p-body').scrollTop = 0;
  }
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
