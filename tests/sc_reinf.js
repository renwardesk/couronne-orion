const P1=window.__P1,me='u1';const P2=myPlanets().map(p=>p.pid).find(p=>p!==P1&&!isBody(p));S.planets[P2].lv.bay=6;T.sync();
const c2=settle(S.planets[P2],Date.now()).ships.cruiser||0;
const t=await T.send({from:P1,to:P2,mission:'reinforce',ships:{cruiser:10}});T.ok(!t.length,'renfort lancé '+t.join('|'));
const f=T.fleetsOf(me).find(x=>x.mission==='reinforce');T.adv(f.arrive-Date.now()+500);await T.tick();
const fx=S.fleets[f.fid];T.L('   état',fx?fx.phase:'(fusionnée)',' croiseurs P2',settle(S.planets[P2],Date.now()).ships.cruiser);
T.ok((fx&&fx.phase==='hold')||settle(S.planets[P2],Date.now()).ships.cruiser===c2+10,'renfort arrivé (en orbite ou stationné)');
// rappel
if(fx&&fx.phase==='hold'){T.L('   rattaché à',fx.home||fx.from)}
// renfort vers une planète tombée entre-temps : demi-tour, jamais d'attaque
{const P1=window.__P1,L=Object.keys(PLANETS).filter(k=>!S.planets[k]&&!PLANETS[k].core&&!PLANETS[k].raid&&!PLANETS[k].comet&&!PLANETS[k].sig&&!PLANETS[k].deep&&!isBody(k)&&galOf(k)===galOf(P1)).sort((a,b)=>dist(a,P1)-dist(b,P1)),X=L[4];
S.planets[X]={kind:'planet',pid:X,owner:null,garrison:{fighter:500},pill:true};S.planets[P1].ships.fighter=(S.planets[P1].ships.fighter||0)+50;T.sync();
await locked('fleets/rf9',async(d,ref)=>{await ref.set({kind:'fleet',fid:'rf9',owner:'u1',from:P1,to:X,mission:'reinforce',ships:{fighter:50},cargo:{m:0,c:0,f:0},depart:Date.now()-1e4,arrive:Date.now()-1000,phase:'out',spied:[]})});await T.tick(2);
T.ok(S.fleets.rf9&&S.fleets.rf9.phase==='back'&&count(S.planets[X].garrison)===500,'renfort vers une planète perdue : demi-tour sans combat');
T.ok(S.reports.some(r=>/Renfort sans objet/.test(r.title||'')),'le joueur est prévenu')}
