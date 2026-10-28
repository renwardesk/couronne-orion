// Seigneurs Déchus et Croisade impériale
const P1=window.__P1;await T.tick(2);await sleep(50);
const b=BOTS[0],seat=b.seat;T.ok(S.planets[seat]&&S.planets[seat].owner===b.uid,'Kael tient le Bastion');
// sceau : Citadelle et Trône fermés avant la Croisade
S.planets[P1].ships={...S.planets[P1].ships,fighter:3000};S.planets[P1].res.f=1e8;T.sync();
let t=await T.send({from:P1,to:'o0-1',mission:'attack',ships:{fighter:100}});T.ok(t.some(x=>/Scellée par l’Empereur/.test(x)),'Citadelle scellée avant la Croisade');
// un joueur prend le Bastion
const sp=S.planets[seat];S.planets[seat]={...sp,owner:'u1',ships:{...zeroShips(),fighter:200}};T.sync();
const mine=botPlanets(b.uid);T.L('   colonies de Kael',mine.length);
S.players[b.uid].bot={...S.players[b.uid].bot,next:Date.now()-1};T.sync();BOT_T=0;T.adv(31e3);await T.tick(2);await sleep(50);
let st=S.players[b.uid].bot;T.ok(st.fallen&&st.fallen.by==='u1','Kael devient un Déchu');
T.ok(S.reports.some(r=>/devient un Déchu/.test(r.title||'')&&r.push),'annonce à tous');
T.ok((S.chat||[]).some(m=>m.uid==='orion-1'&&m.ch==='u')&&(S.chat||[]).some(m=>m.uid==='vorgath'),'Kael et l’Empereur réagissent dans l’Univers');
// raid de vengeance
for(const p of botPlanets(b.uid))if(!isBody(p.pid))p.ships={...p.ships,fighter:20000,cruiser:6000,battleship:2000};
S.players[b.uid].bot={...S.players[b.uid].bot,fallen:{...st.fallen,raidAt:Date.now()-1},next:Date.now()-1};T.sync();BOT_T=0;T.adv(31e3);await T.tick(2);await sleep(50);
const rf=Object.values(S.fleets).find(f=>f.owner===b.uid&&(f.mission==='attack'||f.mission==='colonize')&&f.phase==='out');
T.ok(rf&&S.planets[rf.to].owner==='u1','raid de vengeance contre le conquérant'+(rf?' ('+rf.mission+' sur '+plName(rf.to)+')':''));
T.ok(rf&&rf.to===seat&&rf.mission==='colonize','il tente d’abord de reprendre sa forteresse');
T.ok(S.reports.some(r=>/le Déchu tente de reprendre/.test(r.title||'')&&r.to.includes('u1')),'le joueur est prévenu');
if(rf){delete S.fleets[rf.fid];T.sync()}
// exil : plus aucune planète
for(const p of botPlanets(b.uid))S.planets[p.pid]={...S.planets[p.pid],owner:'u2'};S.players[b.uid].bot={...S.players[b.uid].bot,next:Date.now()-1};T.sync();
const g0=(S.players.u1.chests||{}).g||0;BOT_T=0;T.adv(31e3);await T.tick(2);await sleep(50);
T.ok(S.players[b.uid].bot.exiled&&((S.players.u1.chests||{}).g||0)===g0+1,'exil : coffre d’or pour chaque empire');
BOT_T=0;T.adv(31e3);await T.tick(2);T.ok(S.reports.filter(r=>/est exilé d’Orion/.test(r.title||'')).length===1,'une seule fois');
// Croisade : les trois forteresses tenues par des joueurs
for(const s0 of CRU_SEATS)S.planets[s0]={...(S.planets[s0]||colonyPlanet(s0,'u1')),owner:s0==='o0-0'?'u1':'u2',ships:{...zeroShips(),fighter:30000,cruiser:9000,battleship:3000}};T.sync();
CRU_T=0;await T.tick(2);await sleep(50);let e=S.events.crusade;
T.ok(e&&e.phase===1,'la Croisade impériale démarre aussitôt');T.ok(S.reports.some(r=>/Croisade impériale commence/.test(r.title||'')&&r.push),'annonce à tous');
S.tab='news';render();T.ok(document.querySelector('.cru-alert'),'encart dans les Actus');
for(let w=0;w<3;w++){T.adv(Math.max(0,S.events.crusade.next-Date.now())+1000);CRU_T=0;await T.tick(2);await sleep(30)}
const W=Object.values(S.fleets).filter(f=>f.owner===NPC_EMP);T.L('   vagues',S.events.crusade.wave,'flottes impériales',W.length);
T.ok(S.events.crusade.wave===3&&W.length>=3,'trois vagues de légions sur les forteresses');
T.ok(S.reports.some(r=>/légions de Vorgath foncent/.test(r.title||'')),'le défenseur est prévenu');
T.adv(3*HR);for(let i=0;i<4;i++){await T.tick(2);await T.battleEnd()}CRU_T=0;await T.tick(2);await sleep(50);e=S.events.crusade;
const cit=S.planets[CRU_CIT];T.L('   phase',e.phase,'Citadelle',cit&&unitLine(cit.garrison||{}));
T.ok(e.phase===2&&cit&&count(cit.garrison)>0,'phase II : la Citadelle s’ouvre avec une forte garnison');
t=await T.send({from:P1,to:CRU_CIT,mission:'attack',ships:{fighter:10}});T.ok(!t.some(x=>/Scellée/.test(x)),'la Citadelle n’est plus scellée');
// garnison abattue (simulée) -> phase III
S.planets[CRU_CIT]={...S.planets[CRU_CIT],garrison:{}};T.sync();CRU_T=0;await T.tick(2);await sleep(30);e=S.events.crusade;
T.ok(e.phase===3&&S.planets[CRU_THR]&&count(S.planets[CRU_THR].garrison)>count(cit.garrison),'phase III : la garde du Trône, plus forte');
S.planets[CRU_THR]={...S.planets[CRU_THR],garrison:{}};T.sync();const g1=(S.players.u1.chests||{}).g||0;CRU_T=0;await T.tick(2);await sleep(50);e=S.events.crusade;
T.ok(e.phase===4&&((S.players.u1.chests||{}).g||0)===g1+1&&(S.players.u1.titles||[]).includes('Libérateur d’Orion'),'victoire : coffre d’or, Éclats et titre');
