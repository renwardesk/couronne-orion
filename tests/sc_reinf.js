const P1=window.__P1,me='u1';const P2=myPlanets().map(p=>p.pid).find(p=>p!==P1&&!isBody(p));S.planets[P2].lv.bay=6;T.sync();
const c2=settle(S.planets[P2],Date.now()).ships.cruiser||0;
const t=await T.send({from:P1,to:P2,mission:'reinforce',ships:{cruiser:10}});T.ok(!t.length,'renfort lancé '+t.join('|'));
const f=T.fleetsOf(me).find(x=>x.mission==='reinforce');T.adv(f.arrive-Date.now()+500);await T.tick();
const fx=S.fleets[f.fid];T.L('   état',fx?fx.phase:'(fusionnée)',' croiseurs P2',settle(S.planets[P2],Date.now()).ships.cruiser);
T.ok((fx&&fx.phase==='hold')||settle(S.planets[P2],Date.now()).ships.cruiser===c2+10,'renfort arrivé (en orbite ou stationné)');
// rappel
if(fx&&fx.phase==='hold'){T.L('   rattaché à',fx.home||fx.from)}
