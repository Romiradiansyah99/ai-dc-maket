// Measures how far the animated path strays from the modelled connection geometry.
// Usage: node tools/flow_dev.mjs [tabIndex]
import puppeteer from 'puppeteer-core';
const tab = Number(process.argv[2] || 0);
const ARG = process.argv[3] || '8814';
const URL = /^https?:/.test(ARG) ? ARG : `http://127.0.0.1:${ARG}/`;
const b = await puppeteer.launch({ executablePath:'/usr/bin/chromium', headless:'shell', args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({width:1200,height:800});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL, { waitUntil: 'domcontentloaded' });
await new Promise(r=>setTimeout(r,4500));
await p.evaluate((i)=>document.querySelectorAll('.w-tab')[i].click(), tab);
await new Promise(r=>setTimeout(r,1600));
const res = await p.evaluate(() => {
  const a = window.__app, f = a.flow;
  const flow = a.FLOWS.find(x => x.id === f.flow.id) || a.FLOWS[0];
  const dev = (curve, pts) => {
    let max = 0;
    for (let i=0;i<=80;i++){
      const q = curve.getPoint(i/80);
      let best = Infinity;
      for (let k=1;k<pts.length;k++){
        const A=pts[k-1], B=pts[k];
        const ab=B.clone().sub(A), ap=q.clone().sub(A);
        const t=Math.max(0,Math.min(1, ap.dot(ab)/ab.lengthSq()));
        best=Math.min(best, q.distanceTo(A.clone().addScaledVector(ab,t)));
      }
      max=Math.max(max,best);
    }
    return +max.toFixed(3);
  };
  const out = [];
  for (let i=1;i<flow.nodes.length;i++){
    const link = flow.nodes[i].link;
    const src = a.cables.byId[link] || a.pipes.byId[link];
    const curve = f.curves[i];
    out.push({ i, link, dev: (src && curve) ? dev(curve, src.points) : 'MISSING' });
  }
  return { flow: flow.name, out };
});
console.log(JSON.stringify({res, errs}));
await b.close();
