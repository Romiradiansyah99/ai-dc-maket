// Verifies that every service which crosses a slab actually passes through a shaft.
//
// The rule this checks is the one that was broken: a riser is not a vertical line
// drawn beside the building, it is the only place a cable or a pipe is allowed to
// change floor. Anything else is either a trench penetration (below grade, allowed
// and listed) or a mistake.
//
// Usage: node tools/check_risers.mjs [port|url]
import puppeteer from 'puppeteer-core';

const ARG = process.argv[2] || '8123';
const URL = /^https?:/.test(ARG) ? ARG : `http://127.0.0.1:${ARG}/`;

// Shafts, mirrored from src/data/layout.js. Kept explicit here so the check fails
// loudly if the two ever disagree.
const SHAFTS = [
  { id: 'lv', x: 0.0, z: 9.0, lo: 0, hi: 18 },
  { id: 'chw', x: 4.0, z: 9.0, lo: 0, hi: 18 },
  { id: 'fire', x: 6.6, z: 9.0, lo: 0, hi: 18 },
  { id: 'fiber', x: 0.0, z: 13.5, lo: 0, hi: 18 },
  { id: 'lift', x: 6.6, z: 13.5, lo: 0, hi: 18 }
];

// Deliberate penetrations outside a shaft, with the reason. A trench crossing the
// hall floor is normal plant practice; an unexplained hole is not.
const TRENCH = {
  'CHW-01': 'CDU to heat exchanger, drops through the hall floor into the plant trench'
};

const SLABS = [0, 6, 12];
const TOL = 1.15;

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: 'shell',
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 800 });
const errs = [];
page.on('pageerror', (e) => errs.push(e.message));
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 4500));

const res = await page.evaluate(({ shafts, trench, slabs, tol }) => {
  const a = window.__app;
  const runs = [
    ...a.cables.cables.map((c) => ({ id: c.def.id, pts: c.points })),
    ...a.pipes.pipes.map((p) => ({ id: p.def.id, pts: p.points }))
  ];
  const crossings = [];
  const usage = {};
  const holes = [];
  for (const r of runs) {
    for (let i = 1; i < r.pts.length; i++) {
      const p = r.pts[i - 1], q = r.pts[i];
      const dy = Math.abs(q.y - p.y);
      const dh = Math.hypot(q.x - p.x, q.z - p.z);
      if (dy < 2.0 || dh > 0.6) continue;          // not a vertical leg
      const lo = Math.min(p.y, q.y), hi = Math.max(p.y, q.y);
      const cut = slabs.filter((s) => lo < s - 0.15 && hi > s + 0.15);
      if (!cut.length) continue;                    // a drop inside a floor
      const best = shafts.map((s) => ({ ...s, d: Math.hypot(p.x - s.x, p.z - s.z) }))
        .sort((u, v) => u.d - v.d)[0];
      const rec = { id: r.id, slabs: cut, shaft: best.id, off: +best.d.toFixed(2) };
      crossings.push(rec);
      if (best.d <= tol) (usage[best.id] || (usage[best.id] = [])).push(r.id);
      else if (trench[r.id]) holes.push({ ...rec, kind: 'trench', reason: trench[r.id] });
      else holes.push({ ...rec, kind: 'UNEXPLAINED' });
    }
  }
  return { crossings, usage, holes, cables: a.cables.cables.length, pipes: a.pipes.pipes.length };
}, { shafts: SHAFTS, trench: TRENCH, slabs: SLABS, tol: TOL });

await browser.close();

console.log(`cables ${res.cables}, pipes ${res.pipes}, floor crossings ${res.crossings.length}`);
console.log('\nriser usage');
for (const [k, v] of Object.entries(res.usage)) console.log(`  ${k.padEnd(6)} ${v.join(', ')}`);
const unused = SHAFTS.filter((s) => !res.usage[s.id]).map((s) => s.id);
if (unused.length) console.log('  UNUSED: ' + unused.join(', '));

console.log('\noutside a shaft');
for (const h of res.holes) {
  console.log(`  ${h.id} at slab ${h.slabs.join(',')} ${h.kind}${h.reason ? ' — ' + h.reason : ''}`);
}

const bad = res.holes.filter((h) => h.kind === 'UNEXPLAINED');
const miss = res.crossings.length - res.crossings.filter((c) => c.off <= TOL).length;
if (bad.length || unused.length || errs.length) {
  console.log(`\nFAIL ${bad.length} unexplained, ${unused.length} unused shafts, ${errs.length} page errors`);
  if (errs.length) console.log(errs.join('\n'));
  process.exit(1);
}
console.log(`\nPASS ${res.crossings.length} crossings, ${miss} explained trench penetration(s), every shaft in use, no page errors`);
