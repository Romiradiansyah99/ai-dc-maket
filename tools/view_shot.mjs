// Ad hoc inspector: node tools/view_shot.mjs <x> <y> <z> <zoom> <out.png> [noStructure]
import puppeteer from 'puppeteer-core';
const [, , x, y, z, zoom, out, noStruct] = process.argv;
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium', headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
});
const page = await browser.newPage();
await page.setViewport({ width: 1500, height: 950, deviceScaleFactor: 2 });
await page.goto('http://127.0.0.1:8812/', { waitUntil: 'domcontentloaded' });
await new Promise((r) => setTimeout(r, 4000));
await page.evaluate((a) => {
  const app = window.__app;
  if (a.noStruct) document.getElementById('chkStructure').click();
  const v = app.scene.position.clone().set(a.x, a.y, a.z);
  app.nav.focus(v, a.zoom);
}, { x: +x, y: +y, z: +z, zoom: +zoom, noStruct: noStruct === '1' });
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: out });
console.log('wrote', out);
await browser.close();
