// pacte des Seigneurs : 24 h avant la fin de leur trêve, une coalition de Pillards frappe plusieurs planètes de chaque empire
const P1=window.__P1;await T.tick(2);await sleep(50);
const free=Object.keys(PLANETS).filter(k=>!S.planets[k]&&!PLANETS[k].core&&!PLANETS[k].raid&&!PLANETS[k].comet&&!PLANETS[k].sig&&!PLANETS[k].deep&&!isBody(k)&&galOf(k)===galOf(P1)).sort((a,b)=>dist(a,P1)-dist(b,P1));
const C=free.slice(2,8),P2=free[10];for(const c of C)S.planets[c]={...colonyPlanet(c,'u1'),ships:{fighter:500,cruiser:100,battleship:20}};
S.planets[P2]={...S.planets[P1],pid:P2,owner:'u2',capital:true,bq:[],shipQ:[]};delete S.events['orion-pact'];
const ol=S.events['orion-lords'];T.ok(!!ol,'seigneurs présents');
ol.created=Date.now()-BOT_PEACE+30*HR;T.sync();PACT_TK=0;await T.tick(2);T.ok(!S.events['orion-pact'],'rien à plus de 24 h de la fin de la trêve');
// fixe l'heure à 14 h (Paris) pour que les impacts tombent avant minuit
ol.created=Date.now()-BOT_PEACE+23*HR;T.sync();PACT_TK=0;await T.tick(2);await sleep(50);let e=S.events['orion-pact'];
const F=Object.values(S.fleets).filter(f=>f.pact);T.L('   coalition',F.length,'flottes',F.map(f=>plName(f.to)+'←'+pname(f.pact)+' '+Math.round(worth(f.ships))).join(', '));
T.ok(e&&Object.keys(e.fl).length===F.length&&F.length>=5,'coalition lancée 24 h avant la fin de la trêve');
const n1=F.filter(f=>S.planets[f.to].owner==='u1').length,n2=F.filter(f=>S.planets[f.to].owner==='u2').length;
{const np=Object.values(S.planets).filter(p=>p.owner==='u1'&&!isBody(p.pid)).length;T.ok(n1===pactN(np)&&n1>=4&&n2===pactN(1),'adapté au nombre de planètes ('+n1+' cibles pour '+np+' planètes, '+n2+' pour 1)')}
T.ok(F.every(f=>f.owner===NPC&&isBot(f.pact)&&f.arrive-Date.now()>=4*HR-60e3&&f.arrive-Date.now()<=8*HR+60e3),'impacts dans 4 à 8 h');
{const w1=F.filter(f=>S.planets[f.to].owner==='u1').reduce((a,f)=>a+worth(f.ships),0);T.ok(w1>=playerPower('u1')*.5,'coalition lourde : au moins la moitié de la puissance de l’empire ('+Math.round(w1)+' / '+Math.round(playerPower('u1'))+')')}
T.ok(S.reports.some(r=>/Coalition en route/.test(r.title||'')&&r.push&&r.to[0]==='u1'),'notif « Coalition en route »');
PACT_TK=0;await T.tick(2);T.ok(Object.values(S.fleets).filter(f=>f.pact).length===F.length,'lancée une seule fois');
S.tab='news';render();T.ok(/Coalition du pacte/.test([...document.querySelectorAll('.orion-alert')].map(x=>x.textContent).join(' ')),'Actus : état de la coalition');
for(const p of Object.values(S.planets))if(p.owner==='u1')p.ships={fighter:150000,cruiser:50000,battleship:20000};S.planets[P2].ships={};S.planets[P2].lv.def=0;T.sync();
T.adv(8*HR+5*60e3);for(let i=0;i<6;i++){await T.tick(2);await T.battleEnd()}PACT_TK=0;await T.tick(2);await sleep(80);e=S.events['orion-pact'];const v=pactStat(e);
T.ok(v.rep===n1&&v.won===1,'résultats notés ('+JSON.stringify(v)+')');T.ok(e.done&&S.reports.some(r=>/coalition des Seigneurs/.test(r.title||'')),'bilan envoyé');
T.ok(Math.abs(etaOf(P1,C[0],{fighter:1})-etaOf(P1,C[0],{fighter:1}))===0&&BAL_K===.7,'balises : −30 %');
