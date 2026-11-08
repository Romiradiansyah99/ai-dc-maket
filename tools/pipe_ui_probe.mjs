import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/usr/bin/chromium', headless:'shell', args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({width:1400,height:900});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8813/', {waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,5000));
// open the cooling system in the tree and inspect a CDU
await p.evaluate(()=>{
  const heads=[...document.querySelectorAll('.sys-name')];
  const cw=heads.find(h=>/Cooling, Water/i.test(h.textContent)); cw.click();
});
await new Promise(r=>setTimeout(r,400));
await p.evaluate(()=>{
  const row=[...document.querySelectorAll('.item')].find(x=>/CDU-01/.test(x.textContent)); row.click();
});
await new Promise(r=>setTimeout(r,1000));
const equip = await p.evaluate(()=>({
  title: document.querySelector('.p-head h2')?.textContent,
  pipeRows: [...document.querySelectorAll('.piperow')].map(b=>b.dataset.pipe),
  cableRows: [...document.querySelectorAll('.cablerow')].map(b=>b.dataset.cable)
}));
await p.evaluate(()=>document.querySelector('.piperow')?.click());
await new Promise(r=>setTimeout(r,900));
const pipe = await p.evaluate(()=>({
  title: document.querySelector('.p-head h2')?.textContent,
  crumb: document.querySelector('.p-crumb')?.textContent.trim(),
  kv: [...document.querySelectorAll('.kv')].map(k=>k.textContent.trim())
}));
// toggle pipes off
await p.evaluate(()=>document.getElementById('chkPipes').click());
await new Promise(r=>setTimeout(r,300));
const pipesVisible = await p.evaluate(()=>window.__app.scene.getObjectByName('pipes').visible);
console.log(JSON.stringify({equip, pipe, pipesVisible, errs}, null, 1));
await b.close();
