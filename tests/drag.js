const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const mobile of [false,true]){const ctx=await b.newContext({viewport:{width:360,height:740},hasTouch:mobile,isMobile:mobile});const pg=await ctx.newPage();
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.goto('http://localhost:8777/index.html');await pg.waitForTimeout(1200);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));await pg.evaluate(fs.readFileSync(__dirname+'/harness.js','utf8'));
 await pg.evaluate(()=>{S.got={f:1,e:1,p:1,pl:1};const P1=window.__P1;S.planets[P1].shipQ=[];S.planets[P1].lv.bay=12;T.sync();const tu=document.getElementById('tut');if(tu)tu.innerHTML='';S.tab='yard';S.sel=P1;render();document.querySelectorAll('.scrim').forEach(e=>e.remove())});
 const el=await pg.$('[data-qr="y"][data-t="cruiser"]');await el.scrollIntoViewIfNeeded();await pg.waitForTimeout(300);const bb=await el.boundingBox();const y=bb.y+bb.height/2;
 const hit=await pg.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&e.outerHTML.slice(0,60)},[bb.x+12,y]);
 if(!mobile){await pg.mouse.move(bb.x+12,y);await pg.mouse.down();for(let i=1;i<=12;i++){await pg.mouse.move(bb.x+12+i*(bb.width*.6)/12,y);await pg.waitForTimeout(20)}await pg.mouse.up()}
 else{const c=await ctx.newCDPSession(pg);const tp=x=>[{x,y}];await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp(bb.x+12)});for(let i=1;i<=12;i++){await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:tp(bb.x+12+i*(bb.width*.6)/12)});await pg.waitForTimeout(20)}await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
 await pg.waitForTimeout(400);
 console.log(mobile?'doigt':'souris','hit',hit,'→',await pg.evaluate(()=>`qty ${S.qty.cruiser} · case ${document.querySelector('[data-qin="y"][data-t="cruiser"]').value} · max ${document.querySelector('[data-qr="y"][data-t="cruiser"]').max}`));await ctx.close()}
await b.close()})();
