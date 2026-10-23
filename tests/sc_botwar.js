// entraide des seigneurs, vengeance, défenses relevées
const P1=window.__P1,me='u1';
await T.tick(2);await sleep(50);for(let i=0;i<3;i++){T.adv(60e3);await T.tick(1);await sleep(30)}
const L=S.events['orion-lords'];T.ok(L&&L.boost1,'renfort unique des défenses appliqué');
const seat=S.planets['o0-0'];T.ok(seat.lv.def>=9&&seat.lv.shld>=4&&seat.lv.mines>=4,'siège : défense '+seat.lv.def+', bouclier '+seat.lv.shld+', mines '+seat.lv.mines);
const col=botPlanets('orion-1').find(p=>!PLANETS[p.pid].core&&!isBody(p.pid));T.ok(col.lv.def>=6,'colonie : défense '+col.lv.def);
// un joueur attaque une colonie de Kael
const hp=S.planets[P1];hp.ships={...hp.ships,fighter:3000,cruiser:1000,battleship:300};hp.lv.bay=20;hp.lv.store=25;hp.res={m:9e6,c:9e6,f:9e6};S.players[me].rare={ir:99999,xe:99999,am:999};T.sync();
const t=await T.send({from:P1,to:col.pid,mission:'attack',ships:{fighter:2500,cruiser:800,battleship:250}});T.L('   envoi',t.join('|'));
const atk=T.fleetsOf(me).find(f=>f.to===col.pid);T.L('   impact dans',Math.round((atk.arrive-Date.now())/60000),'min');
BOT_T=0;await T.tick(2);await sleep(50);
const helps=Object.values(S.fleets).filter(f=>isBot(f.owner)&&f.mission==='reinforce'&&f.to===col.pid);T.L('   renforts',helps.map(f=>pname(f.owner)+' '+unitLine(f.ships)+' arrivée '+Math.round((f.arrive-Date.now())/60000)+' min').join(' | '));
T.ok(helps.length>=1,'les seigneurs envoient des renforts');T.ok(helps.every(f=>f.arrive<atk.arrive),'renforts arrivés avant l’attaque');
const rep=S.reports.find(r=>/a repéré ton attaque/.test(r.title||''));T.ok(rep&&rep.push&&rep.to.includes(me),'le joueur est prévenu (notif)');T.L('   ',rep&&rep.lines.join(' / '));
T.ok(S.players['orion-1'].bot.rev&&S.players['orion-1'].bot.rev.uid===me,'Kael jure vengeance');
BOT_T=0;await T.tick(2);T.ok(S.reports.filter(r=>/a repéré ton attaque/.test(r.title||'')).length===1,'pas de double alerte pour la même attaque');
// combat
await T.runToEnd(8);const br=S.reports.find(r=>r.battle&&(r.to||[]).includes(me));T.L('   combat',br&&br.title,'::',br&&(br.lines||[]).slice(0,4).join(' / ').slice(0,400));
// vengeance pendant la trêve
const created=S.events['orion-lords'].created;let rev=null;for(let i=0;i<20&&!rev;i++){T.adv(30*60e3);await T.tick(2);rev=Object.values(S.fleets).find(f=>f.owner==='orion-1'&&f.mission==='attack'&&f.phase==='out')}
T.ok(!!rev&&Date.now()<created+BOT_PEACE,'vengeance lancée malgré la trêve'+(rev?' vers '+plName(rev.to):''));
T.ok(S.reports.some(r=>/se venge sur/.test(r.title||'')&&r.push),'notif de vengeance');
// les renforts rentrent ensuite
for(let i=0;i<10;i++){T.adv(60*60e3);await T.tick(2)}
T.ok(!Object.values(S.fleets).some(f=>isBot(f.owner)&&f.mission==='reinforce'&&f.phase==='hold'),'les renforts sont rentrés chez eux');
T.ok(BOTS.every(b=>playerPower(b.uid)<=humanAvg().pw*1.6*1.5+500),'flottes plafonnées : '+BOTS.map(b=>Math.round(playerPower(b.uid))).join(', ')+' / moy '+Math.round(humanAvg().pw));
