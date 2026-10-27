const {chromium}=require('playwright');const fs=require('fs');const OUT=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 pg.on('pageerror',e=>console.log('PAGEERR',e.message));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.goto('http://localhost:8777/index.html');await pg.waitForTimeout(1200);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));await pg.evaluate(fs.readFileSync(__dirname+'/harness.js','utf8'));
 await pg.evaluate(async()=>{S.got={f:1,e:1,p:1,pl:1};T.sync();await T.tick(2);await locked('events/invasion',async(x,ref)=>{await ref.set({...x,at:Date.now()+20*HR+1000})});INV_T=0;await T.tick(2);await sleep(100);S.tab='news';render();document.querySelectorAll('.scrim').forEach(e=>e.remove());const t=document.getElementById('tut');if(t)t.innerHTML='';window.scrollTo(0,0)});
 await pg.waitForTimeout(1200);{const a=await pg.$('.inv-alert');await a.screenshot({path:OUT+'/inv1.png'})}
 await pg.evaluate(async()=>{T.adv(20*HR+5000);INV_T=0;await T.tick(2);await sleep(100);S.tab='news';render();document.querySelectorAll('.scrim').forEach(e=>e.remove())});await pg.waitForTimeout(800);
 {const a=await pg.$('.inv-alert');await a.screenshot({path:OUT+'/inv2.png'})}
 await b.close()})();
