const P1=window.__P1,me='u1';
S.tab='projects';const p=S.planets[P1];p.lv.store=30;p.res={m:5e6,c:4e6,f:3e6};T.sync();
const other=Object.keys(PLANETS).find(x=>!S.planets[x]&&!isBody(x)&&galOf(x)===0&&!PLANETS[x].raid&&!PLANETS[x].sig&&!PLANETS[x].comet&&!PLANETS[x].core&&!PLANETS[x].deep);const o=colonyPlanet(other,me);S.planets[other]=o;T.sync();
render();T.ok(/Grands projets d’Orion/.test(document.body.textContent)&&document.querySelectorAll('[data-act="pjgive"]').length===3,'section des grands projets dans l’Empire (3 chantiers)');
// contribution 50 %
S.pjSrc=P1;S.pjPct=50;S.pjSel=null;const t0=eta=etaOf(P1,other,{fighter:1});await projGive('balises');await sleep(50);
const e=projEv('balises');T.ok(e&&e.got.m===2.5e6&&e.got.c===2e6&&e.got.f===1.5e6,'50 % des stocks envoyés ('+JSON.stringify(e&&e.got)+')');
T.ok(Math.round(settle(S.planets[P1],Date.now()).res.m)<=2.5e6+5000,'ressources retirées de la planète');T.ok(e.by[me]>0,'contribution comptée');
// presque fini puis achèvement
S.events['proj-balises']={...e,got:{m:24e6-10,c:20e6-10,f:16e6-10,ir:40000-5}};S.players[me].rare={ir:500,xe:0,am:0};S.pjSel={m:true,c:true,f:true,ir:true};T.sync();
await projGive('balises');await sleep(80);const e2=projEv('balises');T.ok(e2.done&&e2.top===me,'projet achevé, plus gros contributeur désigné');
T.ok(S.reports.some(r=>/Réseau de balises est achevé/.test(r.title||'')&&r.push),'notif à tous');T.ok(/Bâtisseur des Balises/.test(titlesHtml(me)),'titre affiché');
T.ok(Math.abs(etaOf(P1,other,{fighter:1})/t0-.7)<.02,'balises : trajets −30 %');
// bouclier
T.ok(pillK()===1,'bouclier pas encore construit');S.events['proj-bouclier']={kind:'event',id:'proj-bouclier',got:{},by:{},done:true};T.sync();T.ok(pillK()===.8,'bouclier : Pillards −20 %');
// portail
S.events['proj-portail']={kind:'event',id:'proj-portail',got:{},by:{},done:true};T.sync();CST.t=0;T.ok(!portalOpen()&&unlockedOf(me)===0,'portail achevé mais Cœur non repris : fermé');
for(const pid of ['o0-0','o0-1','o0-4'])S.planets[pid]={...colonyPlanet(pid,me),owner:me};T.sync();CST.t=0;T.ok(portalOpen()&&unlockedOf(me)>=1,'3 planètes du Cœur : Céphéide ouverte');
for(const pid of ['o0-0','o0-1','o0-4'])delete S.planets[pid];T.sync();CST.t=0;
// sabotage
S.events['proj-bouclier']={kind:'event',id:'proj-bouclier',got:{m:1e6},by:{},sab:0};T.sync();const rnd0=Math.random;Math.random=()=>0;await projSabotage(BOTS[0],Date.now());Math.random=rnd0;await sleep(30);
T.ok(projEv('bouclier').got.m===970000&&S.reports.some(r=>/a saboté le Bouclier/.test(r.title||'')),'sabotage : −3 % et rapport');

// choix des ressources : seulement le cristal
S.events['proj-bouclier']={kind:'event',id:'proj-bouclier',got:{},by:{}};const q=S.planets[P1];q.res={m:1e6,c:1e6,f:1e6};T.sync();S.pjSel={m:false,c:true,f:false};S.pjPct=10;S.tab='projects';render();
T.ok(document.querySelectorAll('[data-act="pjres"]').length===6&&/Tu enverras : 100 k cristal/.test(document.body.textContent),'choix des ressources, aperçu de l’envoi');
await projGive('bouclier');await sleep(50);const gb=projEv('bouclier').got;T.ok(gb.c===100000&&!gb.m&&!gb.f,'seul le cristal est envoyé ('+JSON.stringify(gb)+')');
document.querySelector('[data-act="pjres"][data-r="m"]').click();await sleep(20);T.ok(pjSel().m===true,'toucher une ressource la sélectionne');
// onglet et notif d'explication
render();T.ok([...document.querySelectorAll('[data-act="tab"]')].some(b=>b.dataset.t==='projects'),'onglet « Projets » présent');
await projIntro();await projIntro();await sleep(30);const it=S.reports.filter(r=>/Grands projets d’Orion sont ouverts/.test(r.title||''));T.ok(it.length===1&&it[0].push,'notif d’explication envoyée une fois');
