const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for(const w of [320,375,390]){const pg=await b.newPage({viewport:{width:w,height:800},deviceScaleFactor:2});
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.goto('http://localhost:8777/index.html');await pg.waitForTimeout(1000);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));await pg.evaluate(fs.readFileSync(__dirname+'/harness.js','utf8'));
 const o=await pg.evaluate(async()=>{S.got={f:1,e:1,p:1,pl:1};const other=Object.keys(PLANETS).find(x=>!S.planets[x]&&!isBody(x)&&galOf(x)===0&&!PLANETS[x].raid&&!PLANETS[x].sig&&!PLANETS[x].comet&&!PLANETS[x].core&&!PLANETS[x].deep);S.planets[other]={...colonyPlanet(other,'u1'),res:{m:12345678,c:9876543,f:5555555}};
  S.events['proj-balises']={kind:'event',id:'proj-balises',got:{m:9.1e6,c:7.4e6,f:5.2e6,ir:12000},by:{u1:2e7,u2:9e6,u3:4e6}};T.sync();S.tab='projects';render();await sleep(200);
  const W=document.documentElement.clientWidth;return{sw:document.documentElement.scrollWidth,W,over:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>W+0.5).slice(0,10).map(e=>e.tagName+'.'+(e.className||'')+'#'+(e.id||'')+' →'+Math.round(e.getBoundingClientRect().right)+' '+(e.textContent||'').slice(0,40))}});
 console.log(w,JSON.stringify(o));await pg.screenshot({path:`/tmp/claude-0/-home-claude/f373f78e-bafc-5310-b56a-91f20a2f2a39/scratchpad/bots/ov${w}.png`});await pg.close()}
await b.close()})();
