// deux clients connectés en même temps sur une base partagée (côté Node), avec verrous réels et diffusion temps réel
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const STORE=new Map(),LEASE=new Map();let OFF=0;const pages=[];const log=[];let fails=0;const ok=(c,m)=>{log.push((c?'  ✔ ':'  ✘ ')+m);if(!c)fails++};
const now=()=>Date.now()+OFF;
async function mk(uid){const pg=await b.newPage();pg.on('pageerror',e=>log.push('  PAGEERR '+e.message));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS||__dirname+'/three.min.js'),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.exposeFunction('__dget',p=>{const d=STORE.get(p);return d==null?null:JSON.stringify(d)});
 await pg.exposeFunction('__dset',async(p,j)=>{const d=j==null?null:JSON.parse(j);if(d==null)STORE.delete(p);else STORE.set(p,d);for(const q of pages)q.evaluate(([p,j])=>window.__mir&&window.__mir(p,j),[p,j]).catch(()=>{})});
 await pg.exposeFunction('__dacq',(p,h,ttl)=>{const l=LEASE.get(p),n=now();if(l&&l.h!==h&&l.exp>n)return false;LEASE.set(p,{h,exp:n+ttl});return true});
 await pg.exposeFunction('__off',()=>OFF);
 await pg.goto('http://localhost:8777/index.html');await pg.waitForTimeout(1200);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));
 await pg.evaluate(async uid=>{const _dn=Date.now.bind(Date);window.__O=0;Date.now=()=>_dn()+window.__O;toast=()=>{};
  const cp=x=>x==null?x:JSON.parse(JSON.stringify(x));
  window.__mir=(path,j)=>{const d=j==null?null:JSON.parse(j);const [c,id]=path.split('/');const tgt={fleets:S.fleets,planets:S.planets,players:S.players,events:S.events}[c];if(tgt){if(d)tgt[id]=d;else delete tgt[id]}if(c==='reports'&&d)S.reports.unshift({id,...d})};
  const ref=path=>({id:path.split('/').pop(),path,async get(){const j=await __dget(path);return{exists:j!=null,data:()=>j==null?undefined:JSON.parse(j)}},async set(d){suspGuard();await __dset(path,JSON.stringify(d))},async delete(){suspGuard();await __dset(path,null)},async update(d){const c=await this.get();await this.set({...(c.data()||{}),...d})},async acquire({holder,ttlMs}){suspGuard();return{acquired:await __dacq(path,holder,ttlMs)}},collection:p=>colr(path+'/'+p),onSnapshot(){return()=>{}}});
  const colr=c=>({doc:id=>ref(c+'/'+(id||newId())),add:async d=>{const r=ref(c+'/'+newId());await r.set(d);return r},where:()=>colr(c),orderBy:()=>colr(c),limit:()=>colr(c),async get(){return{docs:[],size:0,empty:true}},onSnapshot(){return()=>{}}});
  db={doc:ref,collection:colr};ME=uid;S.got={f:1,e:1,p:1,pl:1};},uid);
 pages.push(pg);return pg}
const A=await mk('u1'),B=await mk('u2');
// état initial commun écrit par A
await A.evaluate(async()=>{S.players.u1.kind='player';S.players.u2={...S.players.u2,kind:'player',cmds:[],rare:{ir:0,xe:0,am:0}};S.planets[window.__P1].shipQ=[];S.planets[window.__P1].lv.bay=12;
  for(const[k,v]of Object.entries(S.planets))await db.doc('planets/'+k).set(v);for(const[k,v]of Object.entries(S.players))await db.doc('players/'+k).set({kind:'player',...v})});
// B se synchronise sur la base
await B.evaluate(async()=>{S.planets={};S.players={}});for(const[p,d]of STORE)await B.evaluate(([p,j])=>__mir(p,j),[p,JSON.stringify(d)]);
// A lance 3 attaques vers des planètes pirates
const fids=await A.evaluate(async()=>{const P1=window.__P1;const tgs=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&!isBody(p)&&worth(view(p).garrison||{})>0&&worth(view(p).garrison)<worth({fighter:50})).sort((a,b)=>dist(a,P1)-dist(b,P1)).slice(0,3);
  const out=[];for(const tg of tgs){S.modal={from:P1,to:tg,mission:'attack',ships:{...zeroShips(),fighter:30,cruiser:8}};S.launching=false;await launch()}return Object.keys(S.fleets)});
ok(fids.length===3,'3 flottes lancées');
const maxArr=Math.max(...await A.evaluate(()=>Object.values(S.fleets).map(f=>f.arrive)))-Date.now()+2000;
OFF+=maxArr;await A.evaluate(o=>window.__O=o,OFF);await B.evaluate(o=>window.__O=o,OFF);
// les deux clients résolvent en même temps, plusieurs fois
await Promise.all([A.evaluate(async()=>{for(let i=0;i<4;i++)await resolveDue()}),B.evaluate(async()=>{for(let i=0;i<4;i++)await resolveDue()})]);
await new Promise(r=>setTimeout(r,500));
const reps=[...STORE.entries()].filter(([p,d])=>p.startsWith('reports/')&&/Pirates chassés|Défaite face|Combat indécis/.test(d.title||''));
ok(reps.length===3,'exactement 3 rapports de combat (pas de doublon) : '+reps.length);
const gains=[...STORE.entries()].filter(([p,d])=>p.startsWith('reports/')&&/Tes gains/.test(d.title||''));ok(gains.length===3,'points de combat crédités une seule fois par combat : '+gains.length);
const fl=[...STORE.entries()].filter(([p])=>p.startsWith('fleets/')).map(([,d])=>d);ok(fl.length===3&&fl.every(f=>f.phase==='back'),'3 flottes sur le retour : '+JSON.stringify(fl.map(f=>f.phase)));
const cp=STORE.get('players/u1').cp;log.push('   points de combat ren '+cp);
// retour en même temps
OFF+=Math.max(...fl.map(f=>f.back))-(Date.now()+OFF)+2000;await A.evaluate(o=>window.__O=o,OFF);await B.evaluate(o=>window.__O=o,OFF);
const s0=STORE.get('planets/'+await A.evaluate(()=>window.__P1)).ships;
await Promise.all([A.evaluate(async()=>{for(let i=0;i<4;i++)await resolveDue()}),B.evaluate(async()=>{for(let i=0;i<4;i++)await resolveDue()})]);await new Promise(r=>setTimeout(r,300));
const s1=STORE.get('planets/'+await A.evaluate(()=>window.__P1)).ships;const back=fl.reduce((t,f)=>t+(f.ships.fighter||0),0);
ok(s1.fighter-s0.fighter===back,'chasseurs rentrés une seule fois : +'+(s1.fighter-s0.fighter)+' (attendu +'+back+')');
ok(![...STORE.keys()].some(p=>p.startsWith('fleets/')),'plus aucune flotte');
console.log('### duo (2 clients simultanés)\n'+log.join('\n')+'\nÉCHECS : '+fails);await b.close()})();
