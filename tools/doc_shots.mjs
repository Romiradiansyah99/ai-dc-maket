// Regenerates the two README screenshots from the live page.
// Usage: node tools/doc_shots.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, rel === '/' ? '/index.html' : rel);
  fs.readFile(file, (err, data) => {
    if (err || !file.startsWith(ROOT)) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader']
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForFunction('window.__ready !== undefined || document.querySelector(\'#scene\') !== null', { timeout: 30000 });
await new Promise((r) => setTimeout(r, 4000));

await page.screenshot({ path: path.join(ROOT, 'docs/screenshot-iso.png') });
console.log('OK docs/screenshot-iso.png');

await page.evaluate(() => {
  const heads = [...document.querySelectorAll('.sys-name')];
  const cool = heads.find((x) => /Cooling, Water/i.test(x.textContent));
  if (cool) cool.click();
});
await new Promise((r) => setTimeout(r, 600));
await page.evaluate(() => {
  const row = [...document.querySelectorAll('.item')].find((x) => /Water Cooled Chiller|Chiller/i.test(x.textContent));
  if (row) row.click();
});
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: path.join(ROOT, 'docs/screenshot-panel.png') });
console.log('OK docs/screenshot-panel.png');

await browser.close();
server.close();
