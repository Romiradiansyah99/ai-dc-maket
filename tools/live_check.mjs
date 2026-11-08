import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/usr/bin/chromium', headless:'shell', args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({width:1600,height:960, deviceScaleFactor:2});
const errs=[], logs=[];
p.on('pageerror',e=>errs.push(e.message));
p.on('console',m=>{ if(m.type()==='error') logs.push(m.text()); });
await p.goto('https://romiradiansyah99.github.io/ai-dc-maket/', {waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,6000));
const info = await p.evaluate(()=>{
  const a=window.__app;
  return {
    pipes: a.pipes.pipes.length,
    cables: a.cables.cables.length,
    pipesVisible: a.scene.getObjectByName('pipes').visible,
    shaftLabels: [...document.querySelectorAll('.lbl-shaft')].map(x=>x.textContent),
    toggles: [...document.querySelectorAll('.chk')].map(l=>l.textContent.trim()),
    views: [...document.querySelectorAll('#views button')].map(b=>b.textContent.trim())
  };
});
await p.evaluate(()=>{ window.__app.selectPipe('TP-01'); });
await new Promise(r=>setTimeout(r,900));
const card = await p.evaluate(()=>({ title: document.querySelector('.p-head h2')?.textContent, crumb: document.querySelector('.p-crumb')?.textContent.trim() }));
await p.evaluate(()=>{ document.querySelector('[data-view="risers"]').click(); });
await new Promise(r=>setTimeout(r,1800));
await p.screenshot({path:'/tmp/live_risers.png'});
console.log(JSON.stringify({info, card, errs, logs: logs.filter(l=>!/404/.test(l))}));
await b.close();
