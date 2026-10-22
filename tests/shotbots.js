const {chromium}=require('playwright');const fs=require('fs');const OUT=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 pg.on('pageerror',e=>console.log('PAGEERR',e.message));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.goto('http://localhost:8777/index.html');await pg.waitForTimeout(1200);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));await pg.evaluate(fs.readFileSync(__dirname+'/harness.js','utf8'));
 await pg.evaluate(async()=>{S.got={f:1,e:1,p:1,pl:1};T.sync();await T.tick(2);await sleep(100);S.tab='players';render();document.querySelectorAll('.scrim').forEach(e=>e.remove());const t=document.getElementById('tut');if(t)t.innerHTML='';window.scrollTo(0,0)});
 await pg.waitForTimeout(400);await pg.evaluate(()=>{S.tab='news';render();document.querySelectorAll('.scrim').forEach(e=>e.remove())});await pg.waitForTimeout(1200);
 {const a=await pg.$('.orion-alert');await a.screenshot({path:OUT+'/alerte.png'})}
 await pg.evaluate(()=>{T.adv(7.2*86400e3);S.tab='news';render();document.querySelectorAll('.scrim').forEach(e=>e.remove())});await pg.waitForTimeout(400);
 {const a=await pg.$('.orion-alert');await a.screenshot({path:OUT+'/alerte-guerre.png'})}
 await pg.evaluate(()=>{S.tab='log';S.logTab='other';render();document.querySelectorAll('.scrim').forEach(e=>e.remove())});await pg.waitForTimeout(300);
 const el=await pg.$('text=Seigneurs d’Orion se sont réveillés');if(el){const c=await el.evaluateHandle(e=>e.closest('.item,.card')||e.parentElement);await c.screenshot({path:OUT+'/message.png'})}else console.log('message introuvable');
 await b.close()})();
