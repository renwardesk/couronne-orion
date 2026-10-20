const P1=window.__P1,me='u1';
// Zagor (u2) possède une planète proche
const zp=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&!isBody(p)).sort((a,b)=>dist(a,P1)-dist(b,P1))[1];
const z=homePlanet(zp,'u2');z.lv={...z.lv,yard:5,bay:10,store:6};z.ships={...zeroShips(),fighter:200,cruiser:60,battleship:5};S.planets[zp]=z;T.sync();
const tg=Object.keys(RAIDS).filter(k=>RAIDS[k].gal===0&&RAIDS[k].local&&!RAIDS[k].mid&&!RAIDS[k].guard&&!RAIDS[k].boss&&!raidState(k).done).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
T.L('cible',tg,PLANETS[tg].name,'garnison',unitLine(raidGarrison(tg,null,Date.now())));
let t=await T.send({from:P1,to:tg,mission:'rally',ships:{fighter:100,cruiser:40,battleship:20},cmd:'a',extra:{rw:30}});T.ok(!t.length,'ralliement lancé '+t.join('|'));
const L=T.fleetsOf(me).find(x=>x.phase==='rally');T.ok(!!L,'chef de ralliement en attente');
// Zagor envoie un soutien (chasseurs rapides) puis tente avec des cuirassés lents
ME='u2';S.sel=zp;
const tooSlow=Date.now()+etaOf(zp,P1,{battleship:1})*1000>L.rallyUntil;
t=await T.send({from:zp,to:P1,mission:'rallysup',ships:{fighter:120},extra:{rally:L.fid}});T.ok(!t.length,'soutien en chasseurs accepté '+t.join('|'));
if(tooSlow){t=await T.send({from:zp,to:P1,mission:'rallysup',ships:{battleship:5},extra:{rally:L.fid}});T.ok(t.some(x=>/Trop lent/.test(x)),'cuirassés trop lents refusés : '+t.join('|'))}
ME='u1';S.sel=P1;
const sup=Object.values(S.fleets).find(x=>x.owner==='u2'&&x.mission==='rallysup');T.adv(sup.arrive-Date.now()+500);await T.tick();T.ok(S.fleets[sup.fid].phase==='rwait','soutien arrivé au point de ralliement');
T.adv(L.rallyUntil-Date.now()+500);await T.tick();
const L2=S.fleets[L.fid];T.ok(L2&&L2.phase==='out','ralliement parti à l’heure');
const sup2=S.fleets[sup.fid];T.ok(sup2&&sup2.group===L.fid&&sup2.phase==='out','soutien parti avec le chef');
const cp1=S.players.u1.cp||0,cp2=S.players.u2.cp||0;
T.adv(L2.arrive-Date.now()+500);await T.tick(4);
const r=S.reports.find(x=>x.battle&&(x.to||[]).includes('u2'));T.ok(!!r,'rapport de combat partagé : '+(r&&r.title));
T.ok((S.players.u1.cp||0)>cp1&&(S.players.u2.cp||0)>cp2,'points de combat pour les deux joueurs');
await T.runToEnd();const zs=settle(S.planets[zp],Date.now());T.ok(!Object.values(S.fleets).some(x=>x.owner==='u2'),'flotte de Zagor rentrée chez elle');T.L('   chasseurs Zagor',zs.ships.fighter);
T.ok(zs.ships.fighter<=200&&zs.ships.fighter>=80,'pas de duplication côté Zagor');
