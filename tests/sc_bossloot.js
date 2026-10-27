// butin d'un boss : chaque flotte le livre sur SA planète de départ, en proportion des forces engagées
const P1=window.__P1;
const P2=Object.keys(PLANETS).filter(k=>!S.planets[k]&&!PLANETS[k].core&&!PLANETS[k].raid&&!PLANETS[k].comet&&!PLANETS[k].sig&&!PLANETS[k].deep&&!isBody(k)&&galOf(k)===galOf(P1)).sort((a,b)=>dist(a,P1)-dist(b,P1))[2];
S.planets[P2]={...colonyPlanet(P2,'u1'),lv:{...S.planets[P1].lv,store:20}};S.planets[P1].lv.store=20;
for(const q of[P1,P2]){S.planets[q].ships={...S.planets[q].ships,fighter:40000,cruiser:12000,battleship:4000};S.planets[q].lv.bay=20;S.planets[q].res={m:1e6,c:1e6,f:1e7}}T.sync();
const bz=Object.keys(RAIDS).filter(k=>RAIDS[k].gal===0&&bossMaxR(RAIDS[k])>1&&!raidState(k).done&&!RAIDS[k].deep).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
await T.send({from:P1,to:bz,mission:'attack',ships:{fighter:30000,cruiser:9000,battleship:3000}});
await T.send({from:P2,to:bz,mission:'attack',ships:{fighter:10000,cruiser:3000,battleship:1000}});
const fs=Object.values(S.fleets).filter(f=>f.owner==='u1'&&f.to===bz);T.ok(fs.length===2,'deux flottes de deux planètes');
const m1=settle(S.planets[P1],Date.now()).res.m,m2=settle(S.planets[P2],Date.now()).res.m,t0=Date.now();
T.adv(Math.max(...fs.map(f=>f.arrive))-Date.now()+1000);await T.tick(3);await T.battleEnd();await T.tick(3);await sleep(50);
const s1=settle(S.planets[P1],Date.now()),s2=settle(S.planets[P2],Date.now()),dt=(Date.now()-t0)/60000,g1=s1.res.m-m1-rates(s1).m*dt,g2=s2.res.m-m2-rates(s2).m*dt;
T.L('   gains métal',plName(P1),Math.round(g1),'·',plName(P2),Math.round(g2));
T.ok(g1>0&&g2>0,'butin livré sur les deux planètes de départ');
T.ok(g1/g2>2.3&&g1/g2<3.7,'partage proportionnel aux forces engagées (≈ 3 pour 1 : '+(g1/g2).toFixed(2)+')');
