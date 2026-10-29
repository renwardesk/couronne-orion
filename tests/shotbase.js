const {chromium}=require('playwright');const fs=require('fs');const OUT=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 pg.on('pageerror',e=>console.log('PAGEERR',e.message));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.goto('http://localhost:8777/index.html');await pg.waitForTimeout(1200);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));await pg.evaluate(fs.readFileSync(__dirname+'/harness.js','utf8'));
 await pg.evaluate(()=>{S.got={f:1,e:1,p:1,pl:1};const MX=cmdNext(CMD_LMAX-1)+10,P=window.__P1;S.players.u1.cmds=[{id:'g1',key:'k1',xp:MX,st:3,base:P,guard:true},{id:'g2',key:'e12',xp:4000,base:P}];T.sync();S.tab='planet';S.sel=P;S.cmdBSel='g1';render();document.querySelectorAll('.scrim').forEach(e=>e.remove());const t=document.getElementById('tut');if(t)t.innerHTML=''});
 await pg.waitForTimeout(500);const el=await pg.evaluateHandle(()=>[...document.querySelectorAll('.card')].find(e=>/Commandants stationnés/.test(e.textContent)));if(el&&el.asElement()){await el.asElement().scrollIntoViewIfNeeded();await el.asElement().screenshot({path:OUT+'/base-cmd.png'})}else console.log('NO CARD');await b.close()})();
