// Navigation regression test: the pan pad, the hand tool, orbit and zoom.
// Uses real browser input events, not synthetic dispatch, so it exercises the same
// path a person does. Usage: node tools/pan_test.mjs [port]
import puppeteer from 'puppeteer-core';

const ARG = process.argv[2] || '8812';
const URL = /^https?:/.test(ARG) ? ARG : `http://127.0.0.1:${ARG}/`;
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium', headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 820, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 4000));

const state = () => page.evaluate(() => {
  const n = window.__nav;
  return {
    t: n.target.toArray().map((v) => +v.toFixed(2)),
    zoom: +n.zoom.toFixed(3), theta: +n.theta.toFixed(3), phi: +n.phi.toFixed(3)
  };
});
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const box = await (await page.$('#scene')).boundingBox();
const cx = box.x + box.width * 0.55, cy = box.y + box.height * 0.45;

async function drag({ button = 'left', dx = 90, dy = 30 }) {
  await page.mouse.move(cx, cy);
  await page.mouse.down({ button });
  for (let i = 1; i <= 12; i++) {
    await page.mouse.move(cx + (dx * i) / 12, cy + (dy * i) / 12);
    await new Promise((r) => setTimeout(r, 12));
  }
  await page.mouse.up({ button });
  await new Promise((r) => setTimeout(r, 250));
}

const out = {};

// 1. arrow pad
const padBtn = await page.$('#pad button[data-pan="1,0"]');
const s0 = await state();
for (let i = 0; i < 4; i++) { await padBtn.click(); await new Promise((r) => setTimeout(r, 70)); }
const s1 = await state();
out.pad = { moved: !same(s0.t, s1.t), to: s1.t };

// 2. middle button (scroll wheel press) drags to pan, no rotation, no zoom
const s2 = await state();
await drag({ button: 'middle', dx: 120, dy: 40 });
const s3 = await state();
out.middleButton = {
  moved: !same(s2.t, s3.t),
  rotationUnchanged: s2.theta === s3.theta && s2.phi === s3.phi,
  zoomUnchanged: s2.zoom === s3.zoom
};

// 3. plain left drag orbits
const s4 = await state();
await drag({ button: 'left', dx: 100, dy: 20 });
const s5 = await state();
out.orbit = { rotated: s4.theta !== s5.theta, targetUnchanged: same(s4.t, s5.t) };

// 4. right drag pans
const s6 = await state();
await drag({ button: 'right', dx: 80, dy: 25 });
const s7 = await state();
out.rightDrag = { moved: !same(s6.t, s7.t), noRotation: s6.theta === s7.theta };

// 5. wheel zooms toward the cursor
const s8 = await state();
await page.mouse.move(cx, cy);
await page.mouse.wheel({ deltaY: -240 });
await new Promise((r) => setTimeout(r, 250));
const s9 = await state();
out.wheel = { zoomedIn: s9.zoom > s8.zoom };

console.log(JSON.stringify(out, null, 1));
await browser.close();
