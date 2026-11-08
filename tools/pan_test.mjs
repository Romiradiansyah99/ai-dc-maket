// Diagnostic: does the on screen pan pad actually move the model?
import puppeteer from 'puppeteer-core';
const PORT = process.argv[2] || 8812;
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium', headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 820, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 3500));

const hash = async () => page.evaluate(() => {
  const c = document.getElementById('scene');
  const g = document.createElement('canvas');
  g.width = 200; g.height = 130;
  g.getContext('2d').drawImage(c, 0, 0, 200, 130);
  const d = g.getContext('2d').getImageData(0, 0, 200, 130).data;
  let h = 0;
  for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) >>> 0;
  return h;
});

const state = async () => page.evaluate(() => {
  const n = window.__nav; if (!n) return null;
  return { t: n.target.toArray().map(v => +v.toFixed(2)), zoom: +n.zoom.toFixed(3), th: +n.theta.toFixed(3), ph: +n.phi.toFixed(3) };
});
const s0 = await state();
const a = await hash();
const padBtn = await page.$('[title="Pan right"], .pan button:nth-child(3), .pad button:nth-child(3)');
let clicked = 0;
if (padBtn) {
  for (let i = 0; i < 8; i++) { await padBtn.click(); clicked++; await new Promise((r) => setTimeout(r, 60)); }
} else {
  // fall back: any button whose text is an arrow
  const handles = await page.$$('button');
  for (const h of handles) {
    const t = (await page.evaluate((el) => el.textContent.trim(), h));
    if (t === '▶') { for (let i = 0; i < 8; i++) { await h.click(); clicked++; await new Promise((r) => setTimeout(r, 60)); } break; }
  }
}
await new Promise((r) => setTimeout(r, 500));
const b = await hash();
const s1 = await state();
console.log(JSON.stringify({ clicks: clicked, s0, s1, padMoved: JSON.stringify(s0.t) !== JSON.stringify(s1.t) }, null, 0));

// now try a real right drag on the canvas
const c = await page.$('#scene');
const box = await c.boundingBox();
const cx = box.x + box.width * 0.55, cy = box.y + box.height * 0.5;
await page.mouse.move(cx, cy);
await page.mouse.down({ button: 'right' });
for (let i = 1; i <= 12; i++) { await page.mouse.move(cx - i * 12, cy - i * 4); await new Promise((r) => setTimeout(r, 16)); }
await page.mouse.up({ button: 'right' });
await new Promise((r) => setTimeout(r, 400));
const d = await hash();
const s2 = await state();
console.log(JSON.stringify({ s2, rightDragMoved: JSON.stringify(s1.t) !== JSON.stringify(s2.t) }, null, 0));

await browser.close();
