// Seigneurs d'Orion : création, économie, expansion (8 max), espionnage, trêve d'une semaine puis attaques
const P1=window.__P1,me='u1';
const pw0=livePW();
await T.tick(2);await sleep(50);
T.ok(BOTS.every(b=>S.players[b.uid]&&S.players[b.uid].bot),'3 seigneurs créés');
T.ok(BOTS.every(b=>S.planets[b.seat]&&S.planets[b.seat].owner===b.uid),'chacun tient sa planète du Cœur');
T.ok(!S.planets['o0-1']&&!S.planets['o0-4'],'Trône et Citadelle restent à l’Empereur');
for(const b of BOTS){const pl=botPlanets(b.uid);T.L('   '+b.name,pl.length,'planètes :',pl.map(p=>PLANETS[p.pid].name+'('+GALS[galOf(p.pid)].name+')').join(', '),'· puissance',Math.round(playerPower(b.uid)))}
const avg=humanAvg().pw;T.ok(BOTS.every(b=>Math.abs(playerPower(b.uid)-avg)<avg*.15),'puissance de départ ≈ joueur moyen ('+Math.round(avg)+')');
T.ok(BOTS.every(b=>botPlanets(b.uid).filter(p=>!PLANETS[p.pid].core).every(p=>galOf(p.pid)===0&&sysSector(PLANETS[p.pid].sys)===b.sec)),'colonies dans Orion, chacun dans son tiers');
const msg=S.reports.filter(r=>/Seigneurs d’Orion se sont réveillés/.test(r.title||''));T.ok(msg.length===1&&msg[0].push&&msg[0].to.includes('u1')&&!msg[0].to.some(isBot),'message de motivation envoyé une fois, en notif, aux joueurs seulement');
T.ok(Math.abs(livePW()-pw0)<1,'la force des ennemis ne compte pas les seigneurs');
T.ok(!humanIds().some(isBot)&&!/orion-/.test(onlinePill()),'seigneurs absents de la liste des joueurs en ligne');
await T.tick(2);T.ok(S.reports.filter(r=>/se sont réveillés/.test(r.title||'')).length===1,'pas de message en double');
S.tab='news';render();{const a=[...document.querySelectorAll('.orion-alert')].find(x=>/Seigneurs d’Orion/.test(x.textContent));T.ok(a&&/Ils attaqueront dans/.test(a.textContent)&&a.querySelector('[data-cd]'),'Actus : alerte noir et violet avec compte à rebours de la trêve '+(a?a.textContent.slice(0,200):'absente'))}
// premier tour
T.adv(6*60e3);await T.tick(2);await sleep(50);
const q=BOTS.map(b=>S.planets[b.seat]);T.ok(q.every(p=>(p.bq||[]).length>0&&(p.shipQ||[]).length>0),'tour de jeu : constructions et vaisseaux lancés');
T.ok(BOTS.every(b=>S.players[b.uid].bot.next>Date.now()),'prochain tour programmé');
// une semaine et demie de jeu, par pas de 2 h
let spied=0,att0=null,maxP=0;const h0=Date.now();
for(let h=0;h<220;h+=2){T.adv(2*HR);await T.tick(2);if(h%6===0){for(const f of Object.values(S.fleets))if(isBot(f.owner)&&f.phase==='out'&&f.mission!=='spy'&&f.mission!=='colonize'&&f.mission!=='attack')T.L('   mission inattendue',f.mission);}
  for(const f of Object.values(S.fleets))if(isBot(f.owner)&&f.mission==='attack'&&f.phase==='out'&&!att0)att0={t:Date.now(),f:{...f}};
  for(const b of BOTS)maxP=Math.max(maxP,planetsOf(b.uid))}
{const w1=S.reports.filter(r=>/attaqueront dans 24 h/.test(r.title||'')),w2=S.reports.filter(r=>/La trêve est rompue/.test(r.title||''));T.ok(w1.length===1&&w1[0].push&&w2.length===1&&w2[0].push,'notifs téléphone : veille de la fin de trêve, puis début des attaques (une fois chacune)')}
spied=S.reports.filter(r=>/Les sondes de .* au-dessus/.test(r.title||'')).length;
T.ok(BOTS.every(b=>playerPower(b.uid)<=humanAvg().pw*1.75+300),'leur flotte reste plafonnée (1,6 × joueur moyen) : '+BOTS.map(b=>Math.round(playerPower(b.uid))).join(', ')+' / moyenne '+Math.round(humanAvg().pw));
for(const b of BOTS){T.L('   '+b.name,'→',planetsOf(b.uid),'planètes · puissance',Math.round(playerPower(b.uid)),'· siège',JSON.stringify(S.planets[b.seat]||null).slice(0,160))}
T.ok(BOTS.every(b=>S.planets[b.seat]&&S.planets[b.seat].owner===b.uid),'ils gardent leur planète du Cœur (pas de raid PNJ contre eux)');
T.ok(BOTS.every(b=>botPlanets(b.uid).filter(p=>!PLANETS[p.pid].core).every(p=>galOf(p.pid)===0&&sysSector(PLANETS[p.pid].sys)===b.sec&&!SYSTEMS[PLANETS[p.pid].sys].planets.some(q=>S.planets[q]&&S.planets[q].owner&&!isBot(S.planets[q].owner)&&!isNpc(S.planets[q].owner)))),'après 9 jours : toujours dans leur tiers d’Orion, jamais dans un système de joueur');
T.ok(!S.reports.some(r=>/^👑 (Kael|Ysmera|Draxen)/.test(r.title||'')),'pas d’annonce de seigneur de système pour eux');
T.ok(BOTS.some(b=>planetsOf(b.uid)>3),'ils colonisent de nouvelles planètes');T.ok(maxP<=BOT_MAXP,'jamais plus de 8 planètes ('+maxP+')');
T.ok(spied>0,'les joueurs voient passer leurs sondes ('+spied+' rapports)');
const created=S.events['orion-lords'].created;T.ok(!att0||att0.t>=created+BOT_PEACE,'aucune attaque pendant la trêve d’une semaine'+(att0?' (1re à J+'+((att0.t-created)/86400e3).toFixed(1)+')':''));
T.L('   rapports joueurs',S.reports.filter(r=>(r.to||[]).includes(me)&&/Seigneur|sondes de/.test(r.title||'')).slice(0,4).map(r=>r.title).join(' | '));
T.ok(BOTS.every(b=>(S.players[b.uid].nextRaid||0)>Date.now()+1e9),'les Pillards ignorent les seigneurs');
// les joueurs peuvent prendre les mondes des seigneurs (aucune n'est une capitale)
await T.runToEnd(12);
const col=botPlanets('orion-1').find(p=>!PLANETS[p.pid].core&&!isBody(p.pid));const hp=S.planets[P1];hp.ships={...hp.ships,fighter:4000,cruiser:1500,battleship:600,colony:2};hp.lv.bay=20;hp.lv.store=25;hp.res={m:9e6,c:9e6,f:9e6};S.players[me].slots=15;S.players[me].unlocked=9;S.players[me].rare={ir:99999,xe:99999,am:999};T.sync();
const t1=await T.send({from:P1,to:col.pid,mission:'colonize',ships:{fighter:3000,cruiser:1000,battleship:400,colony:1}});T.L('   envoi annexion',t1.join('|'));
await T.runToEnd(60);T.L('   rapports',S.reports.filter(r=>(r.to||[]).includes(me)).slice(0,4).map(r=>r.title+' :: '+(r.lines||[]).join(' / ').slice(0,200)).join(' || '));T.ok(S.planets[col.pid]&&S.planets[col.pid].owner===me,'colonie d’un seigneur annexée par un joueur');
// bonus du Cœur
const r0=rates(S.planets[P1]).m;S.planets['o0-0']={...S.planets['o0-0'],owner:me};T.sync();CST.t=0;const r1=rates(S.planets[P1]).m;
T.ok(Math.abs(r1/r0-1.02*1.05)<.002,'1 planète du Cœur : +2 % pour tous et +5 % pour son détenteur (×'+(r1/r0).toFixed(4)+')');
const other=Object.values(S.planets).find(p=>p.owner==='u2'&&!isBody(p.pid));if(other){const o0=rates(other).m;T.L('   ');}
for(const pid of CORE_P)S.planets[pid]={...(S.planets[pid]||colonyPlanet(pid,me)),owner:me};T.sync();CST.t=0;const r5=rates(S.planets[P1]).m;
T.ok(coreStats().lord===me,'les 5 planètes : Seigneur d’Orion');T.ok(Math.abs(r5/r0-1.10*1.25*1.15)<.003,'production ×'+(r5/r0).toFixed(3)+' (+10 % tous, +25 % détenteur, +15 % Seigneur)');
T.ok(Math.abs(modsOf(me).fighter.att/modsOf('u2').fighter.att-1.08)<.01,'+8 % d’attaque pour le Seigneur d’Orion');
S.tab='players';render();T.L('   onglet',document.querySelector('main')?document.querySelector('main').innerText.slice(0,200).replace(/\n/g,' / '):'?');T.ok(/Cœur d’Orion/.test(document.body.textContent)&&/Seigneur d’Orion/.test(document.body.textContent),'encart du Cœur dans l’onglet Joueurs');
for(const pid of CORE_P)delete S.planets[pid];T.sync();CST.t=0;
