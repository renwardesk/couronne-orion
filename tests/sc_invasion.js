// grande invasion du Néant : annonce 24 h avant, attaque simultanée de tous les empires, récompense collective
const P1=window.__P1;
for(const p of Object.values(S.planets))if(p.owner==='u1')p.ships={...p.ships,fighter:20000,cruiser:6000,battleship:2500};
const P2=Object.keys(PLANETS).filter(k=>!S.planets[k]&&!PLANETS[k].core&&!PLANETS[k].raid&&!PLANETS[k].comet&&!PLANETS[k].sig&&!PLANETS[k].deep&&!isBody(k)&&galOf(k)===galOf(P1)).sort((a,b)=>dist(a,P1)-dist(b,P1))[3];
S.planets[P2]={...S.planets[P1],pid:P2,owner:'u2',capital:true,bq:[],shipQ:[]};
delete S.events.invasion;T.sync();
INV_T=0;await T.tick(2);let e=S.events.invasion;
T.ok(e&&e.phase==='wait'&&new Date(e.at).getUTCDay()===6&&new Date(e.at).getUTCHours()===15&&e.at-Date.now()>=24*HR,'invasion programmée un samedi, au moins 24 h à l’avance ('+new Date(e.at).toISOString()+')');
// annonce
await locked('events/invasion',async(x,ref)=>{await ref.set({...x,at:Date.now()+23*HR})});INV_T=0;await T.tick(2);e=S.events.invasion;
const ann=S.reports.find(r=>/lance la grande invasion/.test(r.title||''));T.ok(e.ann&&ann&&ann.push&&!ann.to.some(isBot),'annonce 24 h avant, notif à tous les joueurs (pas aux seigneurs)');
INV_T=0;await T.tick(2);T.ok(S.reports.filter(r=>/lance la grande invasion/.test(r.title||'')).length===1,'annonce envoyée une seule fois');
S.tab='news';render();T.ok(/Invasion du Néant/.test(document.body.textContent)&&document.querySelector('.inv-alert [data-cd]'),'Actus : compte à rebours de l’invasion');
// un nouvel empire (moins de 5 jours) n'est pas visé
const P3=Object.keys(PLANETS).filter(k=>!S.planets[k]&&!PLANETS[k].core&&!PLANETS[k].raid&&!PLANETS[k].comet&&!PLANETS[k].sig&&!PLANETS[k].deep&&!isBody(k)&&galOf(k)===galOf(P1)).sort((a,b)=>dist(a,P1)-dist(b,P1))[5];
S.players.u3={...S.players.u3,joined:Date.now()-2*864e5};S.planets[P3]={...S.planets[P1],pid:P3,owner:'u3',capital:true,bq:[],shipQ:[]};T.sync();
// déclenchement
T.adv(23*HR+1000);INV_T=0;await T.tick(2);e=S.events.invasion;
const F=Object.values(S.fleets).filter(f=>f.inv!=null);const owners=[...new Set(F.map(f=>S.planets[f.to].owner))];
for(const p of Object.values(S.planets))if(p.owner==='u1'||p.owner==='u2')p.ships={...p.ships,fighter:p.ships.fighter*12,cruiser:p.ships.cruiser*12,battleship:p.ships.battleship*12};T.sync();
T.L('   flottes',F.length,'empires',owners.map(pname).join(', '),'chef',e.chief);
T.ok(e.phase==='live'&&F.length>=2&&owners.length>=2,'invasion lancée sur plusieurs empires en même temps');
T.ok(owners.every(u=>F.filter(f=>S.planets[f.to].owner===u).length<=5),'au plus 5 planètes par empire');
T.ok(F.every(f=>f.arrive-Date.now()>=3*HR-60e3&&f.arrive-Date.now()<=5*HR+60e3),'trajet comme les Pillards : 3 à 5 h');
T.ok(F.filter(f=>f.chief).length===1,'un seul chef, contre l’empire le plus fort');
T.ok(!F.some(f=>isBot(S.planets[f.to].owner)),'les seigneurs ne sont pas visés');
T.ok(!F.some(f=>S.planets[f.to].owner==='u3'),'nouvel empire protégé : pas visé');
// combats
T.adv(5*HR+5*60e3);for(let i=0;i<8;i++){await T.tick(2);await T.battleEnd();}
INV_T=0;await T.tick(2);await sleep(50);e=S.events.invasion;
const end=S.reports.find(r=>/invasion du Néant est repoussée|invasion du Néant est contenue|Néant a frappé fort/.test(r.title||''));
T.L('   ',end&&end.title,'::',end&&end.lines.join(' / '));
T.ok(e.phase==='wait'&&e.last&&e.last.known>0&&e.n===1,'invasion close, la suivante est programmée');
T.ok(end&&/repoussée/.test(end.title)&&e.last.chiefRep,'défense solide : invasion repoussée, chef battu');
T.ok(((S.players.u1.chests||{}).s||0)>=1,'récompense collective : coffre d’argent');
T.ok(e.at-Date.now()>5*864e5,'prochaine invasion dans environ une semaine');
// les Pillards apprennent : chaque raid repoussé +5 % (max 30 %), chaque raid réussi −10 %
T.ok(Math.abs((S.players.u1.pillAd||0)-.15)<.001&&Math.abs((S.players.u2.pillAd||0)-.05)<.001,'adaptation : ren +15 % (3 raids repoussés), Zagor +5 % ('+S.players.u1.pillAd+', '+S.players.u2.pillAd+')');
{const r1=rng(7),r2=rng(7),a=worth(pillArmy(P1,'u1',r1));const sv=S.players.u1.pillAd;S.players.u1.pillAd=0;const b=worth(pillArmy(P1,'u1',r2));S.players.u1.pillAd=sv;T.ok(Math.abs(a/b-1.15)<.02,'armée pillarde 15 % plus forte contre ren ('+Math.round(a)+' contre '+Math.round(b)+')')}
for(let i=0;i<8;i++)await pillLearn('u1',false);T.ok(S.players.u1.pillAd===.3,'plafond à 30 %');
await pillLearn('u1',true);T.ok(Math.abs(S.players.u1.pillAd-.2)<.001,'un raid réussi fait redescendre de 10 %');
