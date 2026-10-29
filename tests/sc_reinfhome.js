// renfort vers une de mes planètes : la flotte reste rattachée à sa planète d'origine, « Rentrer » la ramène chez elle
const P1=window.__P1,me='u1';await T.tick(2);
const P2=Object.keys(PLANETS).filter(k=>!S.planets[k]&&!PLANETS[k].raid&&!PLANETS[k].core&&!PLANETS[k].comet&&!PLANETS[k].sig&&!PLANETS[k].deep&&!isBody(k)&&galOf(k)===galOf(P1)).sort((a,b)=>dist(a,P1)-dist(b,P1))[2];
S.planets[P2]={...S.planets[P1],pid:P2,owner:me,capital:false,bq:[],shipQ:[],ships:{...zeroShips()},lv:{...S.planets[P1].lv,bay:20}};S.planets[P1].ships.fighter=500;S.planets[P1].res.f=1e7;T.sync();
const t=await T.send({from:P1,to:P2,mission:'reinforce',ships:{fighter:200}});T.ok(!t.length,'renfort lancé '+t.join('|'));
const f=T.fleetsOf(me).find(x=>x.mission==='reinforce'&&x.to===P2);T.adv(f.arrive-Date.now()+500);await T.tick(2);
const h=S.fleets[f.fid];T.ok(h&&h.phase==='hold'&&(h.home||h.from)===P1,'en garde, toujours rattachée à sa planète d’origine');
await fleetHome(f.fid);await sleep(30);const b=S.fleets[f.fid];T.ok(b&&b.phase==='back'&&b.from===P1&&b.back>Date.now()+60e3,'« Rentrer » : retour vers la planète d’origine ('+(b&&fmtDur((b.back-Date.now())/1000))+')');
T.adv(b.back-Date.now()+500);await T.tick(2);T.ok(!S.fleets[f.fid]&&S.planets[P1].ships.fighter>=500&&(S.planets[P2].ships.fighter||0)===0,'les vaisseaux sont rentrés à la maison');
