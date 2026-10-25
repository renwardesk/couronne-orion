const P1=window.__P1,me='u1';
S.tab='empire';const p=S.planets[P1];p.lv.store=30;p.res={m:5e6,c:4e6,f:3e6};T.sync();
const other=Object.keys(PLANETS).find(x=>!S.planets[x]&&!isBody(x)&&galOf(x)===0&&!PLANETS[x].raid&&!PLANETS[x].sig&&!PLANETS[x].comet&&!PLANETS[x].core&&!PLANETS[x].deep);const o=colonyPlanet(other,me);S.planets[other]=o;T.sync();
render();T.ok(/Grands projets d’Orion/.test(document.body.textContent)&&document.querySelectorAll('[data-act="pjgive"]').length===3,'section des grands projets dans l’Empire (3 chantiers)');
// contribution 50 %
S.pjSrc=P1;S.pjPct=50;S.pjRare=false;const t0=eta=etaOf(P1,other,{fighter:1});await projGive('balises');await sleep(50);
const e=projEv('balises');T.ok(e&&e.got.m===2.5e6&&e.got.c===2e6&&e.got.f===1.5e6,'50 % des stocks envoyés ('+JSON.stringify(e&&e.got)+')');
T.ok(Math.round(settle(S.planets[P1],Date.now()).res.m)<=2.5e6+5000,'ressources retirées de la planète');T.ok(e.by[me]>0,'contribution comptée');
// presque fini puis achèvement
S.events['proj-balises']={...e,got:{m:24e6-10,c:20e6-10,f:16e6-10,ir:40000-5}};S.players[me].rare={ir:500,xe:0,am:0};S.pjRare=true;T.sync();
await projGive('balises');await sleep(80);const e2=projEv('balises');T.ok(e2.done&&e2.top===me,'projet achevé, plus gros contributeur désigné');
T.ok(S.reports.some(r=>/Réseau de balises est achevé/.test(r.title||'')&&r.push),'notif à tous');T.ok(/Bâtisseur des Balises/.test(titlesHtml(me)),'titre affiché');
T.ok(Math.abs(etaOf(P1,other,{fighter:1})/t0-.9)<.02,'balises : trajets −10 %');
// bouclier
T.ok(pillK()===1,'bouclier pas encore construit');S.events['proj-bouclier']={kind:'event',id:'proj-bouclier',got:{},by:{},done:true};T.sync();T.ok(pillK()===.8,'bouclier : Pillards −20 %');
// portail
S.events['proj-portail']={kind:'event',id:'proj-portail',got:{},by:{},done:true};T.sync();CST.t=0;T.ok(!portalOpen()&&unlockedOf(me)===0,'portail achevé mais Cœur non repris : fermé');
for(const pid of ['o0-0','o0-1','o0-4'])S.planets[pid]={...colonyPlanet(pid,me),owner:me};T.sync();CST.t=0;T.ok(portalOpen()&&unlockedOf(me)>=1,'3 planètes du Cœur : Céphéide ouverte');
for(const pid of ['o0-0','o0-1','o0-4'])delete S.planets[pid];T.sync();CST.t=0;
// sabotage
S.events['proj-bouclier']={kind:'event',id:'proj-bouclier',got:{m:1e6},by:{},sab:0};T.sync();const rnd0=Math.random;Math.random=()=>0;await projSabotage(BOTS[0],Date.now());Math.random=rnd0;await sleep(30);
T.ok(projEv('bouclier').got.m===970000&&S.reports.some(r=>/a saboté le Bouclier/.test(r.title||'')),'sabotage : −3 % et rapport');
