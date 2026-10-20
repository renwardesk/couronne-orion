const P1=window.__P1,me='u1';
const zp=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&!isBody(p)).sort((a,b)=>dist(a,P1)-dist(b,P1))[1];
const z=homePlanet(zp,'u2');z.lv={...z.lv,bay:10};z.ships={...zeroShips(),fighter:200};S.planets[zp]=z;T.sync();
const tg=Object.keys(RAIDS).filter(k=>RAIDS[k].gal===0&&RAIDS[k].local&&!RAIDS[k].mid&&!RAIDS[k].guard&&!RAIDS[k].boss&&!raidState(k).done).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
let t=await T.send({from:P1,to:tg,mission:'rally',ships:{fighter:50,cruiser:20},cmd:'a',extra:{rw:30}});const L=T.fleetsOf(me).find(x=>x.phase==='rally');
ME='u2';S.sel=zp;await T.send({from:zp,to:P1,mission:'rallysup',ships:{fighter:80},extra:{rally:L.fid}});ME='u1';S.sel=P1;
await T.tick();T.ok(!S.reports.some(r=>/part à/.test(r.title||'')),'pas de rappel 25 min avant');
T.adv(L.rallyUntil-Date.now()-4*60000);await T.tick();await sleep(50);
const rm=S.reports.filter(r=>/part à/.test(r.title||''));T.ok(rm.length===1,'un rappel envoyé à 4 min du départ : '+(rm[0]&&rm[0].title));
T.ok(rm[0]&&rm[0].push&&rm[0].to.includes('u1')&&rm[0].to.includes('u2'),'notif push au chef et au soutien');T.L('   ',rm[0]&&rm[0].lines.join(' / '));
await T.tick();await T.tick();T.ok(S.reports.filter(r=>/part à/.test(r.title||'')).length===1,'pas de rappel en double');
T.adv(5*60000);await T.tick();T.ok(S.fleets[L.fid].phase==='out','le ralliement part normalement');
// ralliement très court (5 min) : pas de rappel
await T.runToEnd();S.players.u1.cmds.forEach(c=>{c.inj=0;c.move=null});T.sync();
t=await T.send({from:P1,to:tg,mission:'rally',ships:{fighter:20},cmd:'a',extra:{rw:5}});T.L('   ralliement court',t.join('|'));await T.tick();T.ok(S.reports.filter(r=>/part à/.test(r.title||'')).length===1,'aucun rappel pour un ralliement de 5 min');
