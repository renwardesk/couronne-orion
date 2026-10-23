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
