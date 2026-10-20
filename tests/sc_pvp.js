const P1=window.__P1,me='u1';
// planète de Scorpius (u3) dans Orion, peu défendue
const tg=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&!isBody(p)).sort((a,b)=>dist(a,P1)-dist(b,P1))[3];
const hp=colonyPlanet(tg,'u3');hp.lv={mine:3,crys:3,fuel:2,store:3,yard:1,def:1};hp.res={m:20000,c:15000,f:5000};hp.ships={...zeroShips(),fighter:10};S.planets[tg]=hp;T.sync();
S.players.u1.culture=99999;S.players.u1.slots=6;T.sync();
// 1) pillage sans colon
let t=await T.send({from:P1,to:tg,mission:'attack',ships:{fighter:80,cruiser:30}});T.ok(!t.length,'attaque lancée '+t.join('|'));
let f=T.fleetsOf(me).find(x=>x.to===tg);T.adv(f.arrive-Date.now()+500);await T.tick();T.L('   échanges',await T.battleEnd());
let r=S.reports.find(x=>x.battle&&(x.to||[]).includes(me));T.ok(!!r,'rapport de bataille : '+(r&&r.title));
const pv=pvpInfo(r);T.ok(pv&&pv.att[0]==='u1'&&pv.def[0]==='u3'&&pv.win==='att','bandeau joueur contre joueur : '+JSON.stringify(pv));
const al=S.reports.find(x=>(x.to||[]).includes('u3')&&x.push&&/pillé/.test(x.title));T.ok(!!al,'alerte de pillage pour la victime : '+(al&&al.title+' / '+al.lines.join(' ')));
const vict=settle(S.planets[tg],Date.now());T.ok(vict.res.m<20000,'ressources volées à la victime ('+Math.round(vict.res.m)+' métal restant)');
const nw=Object.values(S.events).find(e=>e.news&&e.type==='battle');T.ok(nw&&nw.pv,'actu de bataille avec vainqueur');
// retour
let fb=S.fleets[f.fid];if(fb&&fb.phase==='back'){T.adv(fb.back-Date.now()+500);await T.tick()}
// 2) annexion avec colon
S.planets[P1].ships.colony=2;T.sync();
t=await T.send({from:P1,to:tg,mission:'colonize',ships:{fighter:60,cruiser:20,colony:1}});T.ok(!t.length,'attaque avec colon lancée '+t.join('|'));
f=T.fleetsOf(me).find(x=>x.to===tg&&x.phase==='out');T.adv(f.arrive-Date.now()+500);await T.tick();T.L('   échanges',await T.battleEnd());
T.ok(S.planets[tg].owner===me,'planète annexée');
const al2=S.reports.find(x=>(x.to||[]).includes('u3')&&x.push&&/t’a pris/.test(x.title));T.ok(!!al2,'alerte « planète perdue » : '+(al2&&al2.title));
await sleep(300);const nC=Object.values(S.events).filter(e=>e.news&&e.type==='conquest').length;T.ok(nC>=1,'actu de conquête');
T.L('   rapports:',S.reports.slice(0,4).map(r=>r.title+' :: '+(r.lines||[]).join(' / ').slice(0,250)).join(' || '));T.L('   planètes ren',planetsOf('u1'),'/',MAXP,'emplacements',slotsOf('u1'),'culture',S.players.u1.culture);
