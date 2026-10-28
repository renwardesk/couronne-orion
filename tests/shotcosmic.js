const {chromium}=require('playwright');const fs=require('fs');const OUT=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 pg.on('pageerror',e=>console.log('PAGEERR',e.message));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.goto('http://localhost:8777/index.html');await pg.waitForTimeout(1200);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));await pg.evaluate(fs.readFileSync(__dirname+'/harness.js','utf8'));
 await pg.evaluate(async()=>{S.got={f:1,e:1,p:1,pl:1};const MX=cmdNext(CMD_LMAX-1)+10;S.players.u1.cmds=[{id:'k1',key:'k1',xp:0},{id:'k4',key:'k4',xp:MX,st:3},{id:'l11',key:'l11',xp:MX},{id:'e12',key:'e12',xp:4000},{id:'c19',key:'c19',xp:0},{id:'l4',key:'l4',xp:MX},{id:'c1',key:'c1',xp:0}];T.sync();
  document.querySelectorAll('.scrim').forEach(e=>e.remove());const t=document.getElementById('tut');if(t)t.innerHTML='';});
 await pg.evaluate(()=>{S.tab='cmds';S.cmdOpen=null;render();document.querySelectorAll('.scrim').forEach(e=>e.remove());window.scrollTo(0,0)});await pg.waitForTimeout(400);
 {const el=await pg.$('.crole');if(el)await el.screenshot({path:OUT+'/list.png'})}
 for(const id of ['k1','k4']){await pg.evaluate(id=>{S.tab='cmds';S.cmdOpen=id;render();document.querySelectorAll('.scrim').forEach(e=>e.remove())},id);await pg.waitForTimeout(300);
  const card=await pg.evaluateHandle(()=>[...document.querySelectorAll('.cmdc')].find(e=>e.querySelector('.awk'))||document.querySelector('.cmdc'));if(card&&card.asElement())await card.asElement().screenshot({path:OUT+'/card-'+id+'.png'})}
 await pg.evaluate(()=>{chestFx({t:'g',k:'k2'})});await pg.waitForTimeout(2800);await pg.screenshot({path:OUT+'/chest.png'});await b.close()})();
