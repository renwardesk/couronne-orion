const {chromium}=require('playwright');const fs=require('fs');const OUT=process.argv[2];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const pg=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 pg.on('pageerror',e=>console.log('PAGEERR',e.message));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.goto('http://localhost:8777/index.html');await pg.addInitScript(()=>{});await pg.waitForTimeout(1500);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));await pg.evaluate(fs.readFileSync(__dirname+'/harness.js','utf8'));
 for(const tgt of ['core','wreck','hole']){await pg.evaluate(t=>{window.SYS_T=t==='core'?CORE.i:t==='wreck'?DEEP[0].wreck.i:DEEP[0].hole.i},tgt);console.log('=== '+tgt);
 const info=await pg.evaluate(async()=>{S.got={f:1,e:1,p:1,pl:1};T.sync();await T.tick(2);await sleep(100);document.querySelectorAll('.scrim').forEach(e=>e.remove());S.tab='galaxy';render();await sleep(500);
   const o={ok:MP.ok};try{mpGoSystem(window.SYS_T)}catch(e){o.err=e.message}await sleep(9000);o.level=MP.level;o.sys=MP.sys;o.orbs=(MP.orbs||[]).map(x=>x.pid+(x.ghost?'(g)':''));return o});
 console.log(JSON.stringify(info));
 await pg.screenshot({path:OUT+'/'+tgt+'.png'});
 // projeter chaque planète et cliquer dessus
 const pts=await pg.evaluate(()=>{const r=mpc.getBoundingClientRect();return MP.orbs.filter(o=>!o.ghost).map(o=>{const v=new THREE.Vector3();o.mesh.getWorldPosition(v);const q=mpProject([v.x,v.y,v.z]);return q?{pid:o.pid,x:r.left+q[0],y:r.top+q[1]}:{pid:o.pid,x:-1,y:-1}})});
 for(const p of pts){const hit=await pg.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?e.tagName+'.'+e.className:'-'},[p.x,p.y]);await pg.mouse.click(p.x,p.y);await pg.waitForTimeout(400);const r=await pg.evaluate(()=>S.pickP+' popup:'+!!document.querySelector('[data-act="mpsend"]'));console.log(p.pid,Math.round(p.x),Math.round(p.y),'élément:',hit,'→ pickP',r);await pg.evaluate(()=>{S.pickP=null;render()})}
 }
 await b.close()})();
