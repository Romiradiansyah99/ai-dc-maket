// Renders an isolated catalog-style cut of every equipment type straight from
// the live model geometry. Output: media/shots/<key>.png
// Usage: node tools/render_shots.mjs [keys...]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'media', 'shots');
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, rel === '/' ? '/render.html' : rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: 'shell',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox']
});

const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE', m.text()); });
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.goto(`http://127.0.0.1:${port}/render.html`, { waitUntil: 'networkidle0', timeout: 60000 });
await page.waitForFunction('window.__ready === true', { timeout: 60000 });

let keys = process.argv.slice(2);
if (!keys.length) keys = await page.evaluate('window.__keys()');

let ok = 0, miss = 0;
for (const k of keys) {
  const url = await page.evaluate((kk) => window.__shot(kk), k);
  if (!url) { console.log('SKIP', k); miss++; continue; }
  const b64 = url.split(',')[1];
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(path.join(OUT, `${k}.png`), buf);
  console.log('OK  ', k.padEnd(12), (buf.length / 1024).toFixed(0) + ' KB');
  ok++;
}

console.log(`\n${ok} rendered, ${miss} skipped`);
await browser.close();
server.close();
