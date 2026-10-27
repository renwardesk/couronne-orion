// déménagement : les colonies créées dans d'autres galaxies reviennent dans Orion (une seule fois)
const now=Date.now();
for(const b of BOTS){S.players[b.uid]={kind:'player',uid:b.uid,name:b.name,color:b.color,bot:{title:b.title,seat:b.seat,gal:1,next:now+9e8,expAt:now+9e8,spyAt:now+9e8,atkAt:now+9e8},slots:8,rare:{ir:0,xe:0,am:0},cmds:[],tech:{},loadout:{},nextRaid:9e15};
  S.planets[b.seat]=botPlanetDoc(b.seat,b.uid,{mine:5,crys:5,fuel:4,store:4,yard:6,bay:6,def:3},600,true);
  const far=Object.keys(PLANETS).filter(pid=>botFree(pid,1+BOTS.indexOf(b))).slice(0,2);for(const pid of far)S.planets[pid]={...botPlanetDoc(pid,b.uid,{mine:4,crys:4,fuel:3,store:3,yard:3,bay:5,def:2},200,false),lv:{mine:4,crys:4,fuel:3,store:3,yard:3,bay:5,def:2,acad:0,arsenal:0,cspy:0}}}
S.events['orion-lords']={kind:'event',id:'orion-lords',created:now,boost1:1};T.sync();
const before=BOTS.map(b=>botPlanets(b.uid).length),pw0=BOTS.map(b=>Math.round(playerPower(b.uid)));
await T.tick(2);await sleep(50);
T.ok(BOTS.every((b,i)=>botPlanets(b.uid).length===before[i]),'aucune colonie perdue ('+BOTS.map(b=>botPlanets(b.uid).length).join(',')+')');
T.ok(BOTS.every(b=>botPlanets(b.uid).every(p=>galOf(p.pid)===0)),'toutes les colonies sont dans Orion');
T.ok(BOTS.every(b=>botPlanets(b.uid).filter(p=>!PLANETS[p.pid].core).every(p=>sysSector(PLANETS[p.pid].sys)===b.sec)),'chacun dans son tiers');
T.ok(BOTS.every((b,i)=>Math.abs(playerPower(b.uid)-pw0[i])<1),'flottes et bâtiments conservés');
T.ok(BOTS.every(b=>botPlanets(b.uid).filter(p=>!PLANETS[p.pid].core).every(p=>p.lv.mine===4)),'niveaux des bâtiments conservés');
const r=S.reports.filter(x=>/rappellent leurs colons/.test(x.title||''));T.ok(r.length===1,'message aux joueurs');
await T.tick(2);T.ok(S.reports.filter(x=>/rappellent leurs colons/.test(x.title||'')).length===1,'déménagement fait une seule fois');
T.L('   ',BOTS.map(b=>b.name+' : '+botPlanets(b.uid).map(p=>PLANETS[p.pid].name).join(', ')).join(' | '));
// 2e renfort impérial : seulement pour des seigneurs déjà installés (> 2 jours), une seule fois
T.ok(S.events['orion-lords'].boost2&&BOTS.every((b,i)=>Math.abs(playerPower(b.uid)-pw0[i])<1),'partie neuve : pas de renfort rétroactif');
{const e=S.events['orion-lords'];delete e.boost2;e.created=Date.now()-4*864e5;e.kind='event';T.sync();T.adv(31e3);const p1=BOTS.map(b=>playerPower(b.uid)),d0=S.planets[BOTS[0].seat].lv.def;
await T.tick(2);await sleep(50);
T.ok(BOTS.every((b,i)=>playerPower(b.uid)>p1[i]*1.25&&playerPower(b.uid)<p1[i]*1.45),'renfort impérial : flottes ×1,35 ('+BOTS.map((b,i)=>Math.round(p1[i])+'→'+Math.round(playerPower(b.uid))).join(', ')+')');
T.ok(S.planets[BOTS[0].seat].lv.def===d0+1,'défenses +1');
T.ok(S.reports.filter(x=>/renforce les Seigneurs/.test(x.title||'')).length===1&&S.chat&&Object.values(S.chat).some(m=>m.uid==='vorgath'),'annonce de l’Empereur');
const p2=BOTS.map(b=>playerPower(b.uid));T.adv(31e3);await T.tick(2);T.ok(BOTS.every((b,i)=>Math.abs(playerPower(b.uid)-p2[i])<1),'une seule fois')}
// aide impériale après une planète perdue : une fois toutes les 12 h
{const b=BOTS[1],s0=playerPower(b.uid);await imperialAid(b.uid,'Test');await sleep(30);const s1=playerPower(b.uid);
T.ok(s1>s0,'aide impériale : renforts sur la forteresse ('+Math.round(s0)+'→'+Math.round(s1)+')');
await imperialAid(b.uid,'Test');await sleep(30);T.ok(Math.abs(playerPower(b.uid)-s1)<1,'pas deux fois en 12 h');
T.adv(13*3600e3);await imperialAid(b.uid,'Test');await sleep(30);T.ok(playerPower(b.uid)>s1,'de nouveau après 12 h')}
// sondes annoncées par l'IA dans l'Univers : elles partent vraiment vers ce joueur
{const b=BOTS[2],seat=S.planets[b.seat];seat.ships.probe=20;const pl=S.players[b.uid];pl.bot={...pl.bot,spyOn:{uid:'u1',at:Date.now()},next:Date.now()-1,spyAt:Date.now()+9e8};T.sync();
T.adv(31e3);await T.tick(3);await sleep(50);
const f=Object.values(S.fleets).find(x=>x.owner===b.uid&&x.mission==='spy');
T.ok(f&&S.planets[f.to]&&S.planets[f.to].owner==='u1','sondes de '+b.name+' lancées vers le joueur visé');
T.ok(!S.players[b.uid].bot.spyOn,'demande effacée après envoi')}
