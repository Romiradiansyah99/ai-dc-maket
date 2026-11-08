import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath:'/usr/bin/chromium', headless:'shell', args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({width:1500,height:950, deviceScaleFactor:2});
const errs=[]; const logs=[];
p.on('pageerror',e=>errs.push(e.message));
p.on('console',m=>{ if(m.type()==='error') logs.push(m.text()); });
await p.goto('http://127.0.0.1:8813/', {waitUntil:'domcontentloaded'});
await new Promise(r=>setTimeout(r,5000));
const info = await p.evaluate(() => {
  const a = window.__app;
  const g = a.scene.getObjectByName('pipes');
  return { pipes: g ? g.children.length : 0, visible: g ? g.visible : null,
           ids: a.pipes.pipes.map(x=>x.def.id),
           lens: a.pipes.pipes.map(x=>[x.def.id, +x.length.toFixed(1)]) };
});
console.log(JSON.stringify({info, errs, logs: logs.filter(l=>!/404/.test(l))}));
await p.evaluate(()=>{ const a=window.__app; a.nav.focus(a.scene.position.clone().set(-10,4,-4), 1.0); });
await new Promise(r=>setTimeout(r,1200));
await p.screenshot({path:'/tmp/pipes1.png'});
await p.evaluate(()=>{ const a=window.__app; a.nav.focus(a.scene.position.clone().set(11.5,8,11), 2.2); });
await new Promise(r=>setTimeout(r,1200));
await p.screenshot({path:'/tmp/pipes_riser.png'});
await b.close();
