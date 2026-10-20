const P1=window.__P1,me='u1';const tg=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&!isBody(p)&&isEmpty(view(p).garrison||{})&&(lairInfoAt(SYSTEMS[PLANETS[p].sys])||{}).pid!==p).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
S.players[me].culture=99999;S.players[me].slots=6;T.sync();const n0=planetsOf(me);
const t=await T.send({from:P1,to:tg,mission:'colonize',ships:{colony:1,fighter:10}});T.ok(!t.length,'colonisation lancée '+t.join('|'));
const f=T.fleetsOf(me).find(x=>x.mission==='colonize');T.adv(f.arrive-Date.now()+500);await T.tick();
T.ok(S.planets[tg]&&S.planets[tg].owner===me,'planète colonisée');T.ok(planetsOf(me)===n0+1,'nombre de planètes +1');
T.L('   flottes ren',JSON.stringify(T.fleetsOf(me).map(x=>[x.fid,x.phase,x.to,x.ships])),'colonie',JSON.stringify(S.planets[tg].ships));const esc=Object.values(S.fleets).find(x=>x.fid===f.fid);T.ok(esc&&['hold','back'].includes(esc.phase)&&!esc.ships.colony,'escorte en orbite ou sur le retour, colon consommé');
const r=T.lastRep(me,/colonie|Colonisation/i);T.ok(r&&r.push,'notif push de colonisation');
// satellite
const bd=Object.keys(PLANETS).filter(p=>isBody(p)&&!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&isEmpty(view(p).garrison||{})).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
S.planets[P1].ships.colony=1;T.sync();const t2=await T.send({from:P1,to:bd,mission:'colonize',ships:{colony:1}});T.ok(!t2.length,'installation satellite lancée '+t2.join('|'));
const g=T.fleetsOf(me).find(x=>x.to===bd);T.adv(g.arrive-Date.now()+500);await T.tick();T.ok(S.planets[bd]&&S.planets[bd].owner===me&&S.planets[bd].outpost,'avant-poste installé sur '+PLANETS[bd].name);
T.adv(3600e3);const rr=rareRates(me);T.ok(rr.ir+rr.xe+rr.am>0,'minerai rare produit : '+JSON.stringify(rr));
T.L('   rapports:',S.reports.slice(0,5).map(r=>r.title+' :: '+(r.lines||[]).join(' / ').slice(0,200)).join(' || '));T.L('   flotte',JSON.stringify(S.fleets[f.fid]));
