const P1=window.__P1,me='u1';const tg=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&!isBody(p)&&worth(view(p).garrison||{})>0).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
T.L('cible',tg,PLANETS[tg].name);const pr0=settle(S.planets[P1],Date.now()).ships.probe;
const t=await T.send({from:P1,to:tg,mission:'spy',ships:{probe:5}});T.ok(!t.length,'espionnage lancé '+t.join('|'));
const f=T.fleetsOf(me).find(x=>x.mission==='spy');T.adv(f.arrive-Date.now()+500);await T.tick();
const r=T.lastRep(me,/espionnage/i);T.ok(r&&r.intel,'rapport d’espionnage avec infos');if(r)T.ok(repCat(r)[0]==='spy','classé dans l’onglet Espionnage');
T.L('   rapports',S.reports.slice(0,3).map(x=>x.title).join(' | '));
const f2=S.fleets[f.fid];T.ok(f2&&f2.phase==='back','sondes sur le retour');if(f2){T.adv(f2.back-Date.now()+500);await T.tick()}
T.ok(settle(S.planets[P1],Date.now()).ships.probe===pr0,'5 sondes rentrées');
