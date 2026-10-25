const {chromium}=require('playwright');const fs=require('fs');const OUT=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 pg.on('pageerror',e=>console.log('PAGEERR',e.message));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.goto('http://localhost:8777/index.html');await pg.waitForTimeout(1200);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));await pg.evaluate(fs.readFileSync(__dirname+'/harness.js','utf8'));
 await pg.evaluate(async()=>{S.got={f:1,e:1,p:1,pl:1};const MX=cmdNext(CMD_LMAX-1)+10;S.players.u1.cmds=[{id:'a',key:'l4',xp:MX,st:3,aw:1},{id:'b',key:'l2',xp:MX,st:5},{id:'c',key:'e7',xp:MX,st:1,aw:0},{id:'d',key:'r4',xp:9000}];T.sync();
  document.querySelectorAll('.scrim').forEach(e=>e.remove());const t=document.getElementById('tut');if(t)t.innerHTML='';});
 for(const [id,n] of [['a','card-a'],['b','card-b'],['c','card-c']]){await pg.evaluate(id=>{S.tab='cmds';S.cmdOpen=id;render();document.querySelectorAll('.scrim').forEach(e=>e.remove())},id);await pg.waitForTimeout(300);
  const el=await pg.$('.cmdc .awk');const card=el?await el.evaluateHandle(e=>e.closest('.cmdc')):null;if(card)await card.asElement().screenshot({path:OUT+'/'+n+'.png'})}
 await pg.evaluate(()=>{chestFx({t:'g',k:'l4',dup:true,xp:0,frag:0,L0:10,L1:10,aw:{st0:2,st:3,aw:0,need:2}})});await pg.waitForTimeout(2600);await pg.screenshot({path:OUT+'/chest.png'});await b.close()})();
