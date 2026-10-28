await T.tick(2);await sleep(50);
const pid=Object.keys(PLANETS).find(p=>!S.planets[p]&&!isBody(p)&&galOf(p)===0&&!PLANETS[p].raid&&!PLANETS[p].sig&&!PLANETS[p].comet&&!PLANETS[p].core&&!PLANETS[p].deep);
S.players.u4={kind:'player',uid:'u4',name:'Nova',color:'#00c2a8',joined:Date.now()};S.planets[pid]=homePlanet(pid,'u4');T.sync();
await newcomerRp('u4','Nova',pid);await sleep(50);
const w=S.reports.find(r=>/Bienvenue dans Orion, Nova/.test(r.title||''));T.ok(w&&w.push&&w.to.join()==='u4','message d’accueil au nouveau joueur (notif)');
const a=S.reports.find(r=>/nouvel empire s’éveille : Nova/.test(r.title||''));T.ok(a&&a.push&&!a.to.includes('u4')&&a.to.includes('u1')&&!a.to.some(isBot),'annonce aux autres joueurs');
const m=S.reports.find(r=>/message du Cœur d’Orion pour Nova/.test(r.title||''));T.ok(m&&m.push&&m.to.join()==='u4','menace d’un Seigneur au nouveau joueur');T.L('   ',m&&m.lines.slice(0,2).join(' '));
const o=S.reports.find(r=>/a remarqué Nova/.test(r.title||''));T.ok(o&&o.to.includes('u1'),'les autres voient la menace');
T.ok(Object.values(S.events).some(e=>e.news&&/Nova/.test(e.title||'')),'visible dans les Actus');
{const g=S.reports.find(r=>/Guide d’Orion/.test(r.title||''));T.ok(g&&g.to.join()==='u4'&&g.lines.some(l=>/Quêtes/.test(l))&&g.lines.some(l=>/Trêve de nuit/.test(l))&&g.lines.some(l=>/SITUATION/.test(l)),'guide d’Orion envoyé au nouveau (bases + situation)');T.L('   guide',g&&g.lines.length,'lignes')}
