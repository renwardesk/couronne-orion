// combat de boss dont la fin est interrompue (téléphone en veille) : la flotte ne doit pas rester bloquée en bataille
const P1=window.__P1;
const bz=Object.keys(RAIDS).filter(k=>RAIDS[k].gal===0&&bossMaxR(RAIDS[k])>1&&!raidState(k).done&&!RAIDS[k].deep).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
T.L('   boss',bz,plName(bz),'rounds',bossMaxR(RAIDS[bz]));
S.planets[P1].ships={...S.planets[P1].ships,fighter:40000,cruiser:12000,battleship:4000};S.planets[P1].lv.bay=20;S.planets[P1].res={m:1e7,c:1e7,f:1e7};T.sync();
const t=await T.send({from:P1,to:bz,mission:'attack',ships:{fighter:40000,cruiser:12000,battleship:4000}});T.L('   envoi',t.join(' | '));
const fid=Object.values(S.fleets).find(f=>f.owner==='u1'&&f.to===bz).fid;T.adv((S.fleets[fid].arrive-Date.now())+1000);await T.tick(3);
T.ok(S.fleets[fid]&&S.fleets[fid].phase==='battle','la flotte entre en combat de boss');
const real=window.bossFinish;let cut=0;window.bossFinish=async()=>{cut++};
await T.battleEnd();await T.tick(2);window.bossFinish=real;
const ev=Object.values(S.events).find(e=>e.battle&&e.pid===bz);
T.ok(cut>0&&ev&&ev.done&&!ev.settled&&S.fleets[fid].phase==='battle','fin interrompue : flotte bloquée (cas de Scorpius)');
await T.tick(2);T.ok(S.fleets[fid].phase==='battle','pas de rattrapage trop tôt (moins d’1 min)');
T.adv(2*60e3);await T.tick(3);await sleep(50);
const f=S.fleets[fid];T.ok(!f||f.phase!=='battle','rattrapage : la flotte est libérée ('+(f?f.phase:'rentrée')+')');
const rp=S.reports.filter(r=>/anéantis|repoussé|tient encore/.test(r.title||'')&&(r.title||'').includes(plName(bz)));T.L('   ',rp.map(r=>r.title+' :: '+r.lines.join(' / ')).join(' || ').slice(0,500));
T.ok(rp.length===1,'rapport de victoire envoyé une seule fois');
T.ok(Object.values(S.events).find(e=>e.battle&&e.pid===bz).settled,'combat marqué réglé');
await T.tick(3);T.ok(S.reports.filter(r=>r===rp[0]||(r.title===rp[0].title)).length===1,'pas de double butin');
