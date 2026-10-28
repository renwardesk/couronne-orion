// trêve de nuit : aucune attaque contre un empire entre minuit et 9 h (heure de Paris)
const P1=window.__P1;window.NIGHT_OFF=false;
const at=(h,m=0)=>{for(let d=0;d<3;d++){const base=Date.now()+d*864e5;const [hh,mm]=parisHM(base);const t=base-(base%60e3)+((h-hh)*60+(m-mm))*60e3;if(t>Date.now())return t}};
T.ok(isNight(at(2))&&isNight(at(8,59))&&!isNight(at(9))&&!isNight(at(23,59)),'nuit = minuit à 9 h, heure de Paris');
{const t3=at(3,30);T.ok(Math.abs(nightEnd(t3)-t3-5.5*HR)<60e3&&!isNight(nightEnd(t3)),'fin de la trêve à 9 h')}
// le joueur ne peut pas lancer une attaque qui arriverait la nuit
T.adv(at(23,50)-Date.now());
const P2=Object.keys(PLANETS).filter(k=>!S.planets[k]&&!PLANETS[k].core&&!PLANETS[k].raid&&!PLANETS[k].comet&&!PLANETS[k].sig&&!PLANETS[k].deep&&!isBody(k)&&galOf(k)===galOf(P1)).sort((a,b)=>dist(a,P1)-dist(b,P1))[3];
S.planets[P2]={...S.planets[P1],pid:P2,owner:'u2',capital:true,bq:[],shipQ:[]};S.planets[P1].ships.fighter=500;S.planets[P1].res.f=1e7;T.sync();
let t=await T.send({from:P1,to:P2,mission:'attack',ships:{fighter:100}});T.L('   ',t.join(' | '));
T.ok(t.some(x=>/Trêve de nuit/.test(x))&&!Object.values(S.fleets).some(f=>f.owner==='u1'&&f.to===P2),'attaque refusée si elle arrive la nuit');
// une attaque déjà en route qui arrive la nuit attend 9 h
const fid='fx1';await locked('fleets/'+fid,async(d,ref)=>{await ref.set({kind:'fleet',fid,owner:'u1',from:P1,to:P2,mission:'attack',ships:{fighter:50},cargo:{m:0,c:0,f:0},depart:Date.now(),arrive:at(1),phase:'out',spied:[]})});
T.adv(at(1)-Date.now()+1000);await T.tick(2);let f=S.fleets[fid];
T.ok(f&&f.phase==='out'&&!isNight(f.arrive)&&f.arrive>=at(9)-60e3,'attaque en route repoussée à 9 h ('+(f&&clock(f.arrive))+')');
T.ok(S.reports.some(r=>/Trêve de nuit/.test(r.title||'')),'l’attaquant est prévenu');
// les Pillards ne lancent pas de raid la nuit
S.players.u1.nextRaid=Date.now()-1;S.players.u1.pillLast=0;T.sync();PILL_T=0;await T.tick(2);
T.ok(!Object.values(S.fleets).some(x=>isNpc(x.owner)&&x.phase==='out'),'pas de raid pillard lancé la nuit');
// les Seigneurs non plus
const b=BOTS[0],bp=botPlanets(b.uid)[0];T.ok(bp&&!(await botLaunch(b.uid,bp.pid,P1,'attack',{fighter:1})),'les Seigneurs ne lancent pas d’attaque qui arriverait la nuit');
// à 9 h, ça frappe
T.adv(at(9,20)-Date.now());await T.tick(3);await sleep(50);
T.ok(!S.fleets[fid]||S.fleets[fid].phase!=='out','à 9 h l’attaque frappe');
PILL_T=0;S.players.u1.nextRaid=Date.now()-1;S.players.u1.pillLast=0;T.sync();T.adv(30*60e3);PILL_T=0;await T.tick(2);
T.ok(Object.values(S.fleets).some(x=>isNpc(x.owner)&&x.phase==='out'&&S.planets[x.to].owner==='u1'),'les raids reprennent le jour');
window.NIGHT_OFF=true;
