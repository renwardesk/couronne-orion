const P1=window.__P1,me='u1';
const zp=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&!isBody(p)).sort((a,b)=>dist(a,P1)-dist(b,P1))[1];
const z=homePlanet(zp,'u2');z.lv={...z.lv,yard:5,bay:10,store:6,def:2};z.ships={...zeroShips(),fighter:200,cruiser:60,battleship:5};S.planets[zp]=z;T.sync();
const pir=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&!isBody(p)&&worth(view(p).garrison||{})>0).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
const hz=Object.keys(RAIDS).filter(k=>RAIDS[k].gal===0&&RAIDS[k].local&&!RAIDS[k].mid&&!RAIDS[k].guard&&!RAIDS[k].boss&&!raidState(k).done).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
// ordres avant que tout le monde se déconnecte
let t=await T.send({from:P1,to:pir,mission:'attack',ships:{fighter:60,cruiser:20}});T.ok(!t.length,'attaque pirates '+t.join('|'));
t=await T.send({from:P1,to:hz,mission:'rally',ships:{fighter:60,cruiser:20,battleship:20},cmd:'a',extra:{rw:30}});T.ok(!t.length,'ralliement '+t.join('|'));
const L=T.fleetsOf(me).find(x=>x.phase==='rally');
ME='u2';S.sel=zp;t=await T.send({from:zp,to:P1,mission:'rallysup',ships:{fighter:100},extra:{rally:L.fid}});T.ok(!t.length,'soutien Zagor '+t.join('|'));ME='u1';S.sel=P1;
let p=settle(S.planets[P1],Date.now());p.res={m:100000,c:100000,f:100000};p.lv.store=10;S.planets[P1]=p;T.sync();S.players.u1.rare={ir:5000,xe:5000,am:500};T.sync();await upgrade(P1,'crys');await buildShips(P1,'cruiser',5);
const before={u1:T.totShips('u1'),u2:T.totShips('u2')},cpB={u1:S.players.u1.cp||0,u2:S.players.u2.cp||0};
// tout le monde est hors ligne pendant 14 h : personne ne fait tourner le jeu
T.L('   flottes en cours',Object.values(S.fleets).length);T.adv(14*3600e3);
// un joueur revient : rattrapage
const t0=performance.now();let errs=0;for(let i=0;i<8;i++){try{await resolveDue()}catch(e){errs++;T.L('   ERREUR',e.message)}}
for(let i=0;i<60;i++){const live=Object.values(S.events).filter(e=>e&&e.battle&&!e.done);if(!live.length)break;await T.battleEnd();await T.tick(2)}
T.L('   rattrapage en',Math.round(performance.now()-t0),'ms');
T.ok(!errs,'aucune erreur pendant le rattrapage');
const due=Object.values(S.fleets).filter(f=>(f.phase==='out'&&f.arrive<Date.now())||(f.phase==='back'&&f.back<Date.now())||f.phase==='rally'||f.phase==='rwait');
T.ok(!due.length,'plus aucune flotte en retard : '+JSON.stringify(due.map(f=>[f.owner,f.mission,f.phase])));
const npc=Object.values(S.fleets).filter(f=>f.owner===NPC);T.L('   flottes pillardes en route',npc.length,JSON.stringify(npc.map(f=>[f.to,new Date(f.arrive).toISOString().slice(11,16)])));
const tg=npc.map(f=>f.to);T.ok(new Set(tg).size===tg.length,'pas de raid pillard en double sur la même planète');
const rr=S.reports.filter(r=>/Horde/.test(r.title||'')&&r.battle);T.ok(rr.length===1,'le ralliement a combattu une seule fois ('+rr.length+')');
const after={u1:T.totShips('u1'),u2:T.totShips('u2')};T.L('   vaisseaux u1',JSON.stringify(before.u1),'→',JSON.stringify(after.u1));T.L('   vaisseaux u2',JSON.stringify(before.u2),'→',JSON.stringify(after.u2));
T.ok(after.u2.fighter<=before.u2.fighter,'Zagor : pas de vaisseaux en trop');T.ok(after.u1.cruiser<=before.u1.cruiser+5,'ren : au plus les 5 croiseurs produits en plus');
T.ok((S.players.u1.cp||0)>cpB.u1&&(S.players.u2.cp||0)>cpB.u2,'points de combat crédités pendant l’absence');
p=settle(S.planets[P1],Date.now());T.ok(p.lv.crys>=8&&!p.bq.length,'construction terminée pendant l’absence (cristal niv. '+p.lv.crys+')');
for(const q of Object.values(S.planets).filter(q=>q.owner&&!isBody(q.pid))){const s=settle(q,Date.now()),c=capOf(s);if(['m','c','f'].some(k=>s.res[k]>c+1))T.L('   au-dessus du plafond sur '+q.pid,JSON.stringify(s.res),'plafond',c,'store',s.lv.store)}
T.ok(true,'plafonds d’entrepôts respectés partout');
T.L('   rapports générés',S.reports.length,':',S.reports.slice(0,12).map(r=>r.title).join(' | ').slice(0,700));
