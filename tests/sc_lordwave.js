// fin de la trêve des Seigneurs : légions impériales, 1re vague immédiate, attaques de nuit reportées au matin
const P1=window.__P1,me='u1';
await T.tick(2);await sleep(50);for(let i=0;i<3;i++){T.adv(60e3);await T.tick(1);await sleep(30)}
T.ok(BOT_ECO===2,'tribut impérial ×2');
// joueurs : flotte moyenne connue, planète de ren faible
const hp=S.planets[P1];hp.ships={fighter:30,cruiser:5,battleship:0,probe:0,colony:0};hp.lv.def=1;hp.lv.shld=0;hp.lv.mines=0;
const L0=S.events['orion-lords'];L0.boost1=1;L0.boost2=Date.now();L0.created=Date.now()-BOT_PEACE+5*60e3;
for(const b of BOTS){const x=S.players[b.uid];x.bot={...x.bot,next:0,atkAt:Date.now()+15*HR,w1:0};}
T.sync();await T.tick(1);
const seat0={};for(const b of BOTS)seat0[b.uid]=playerPower(b.uid);
const lp=livePW();T.L('   flotte moyenne (livePW)',Math.round(lp));
// avant la fin : rien
BOT_T=0;await T.tick(2);T.ok(!S.events['orion-lords'].boost3,'pas de légions avant la fin de la trêve');
T.ok(!Object.values(S.fleets).some(f=>isBot(f.owner)&&f.mission==='attack'),'pas d’attaque avant la fin de la trêve');
// fin de la trêve
T.adv(6*60e3);for(let i=0;i<4;i++){BOT_T=0;await T.tick(2);await sleep(20);T.adv(10*60e3)}
T.ok(!!S.events['orion-lords'].boost3,'légions impériales envoyées à la fin de la trêve');
const add=worth(botArmy(lp*BOT_LEGK));for(const b of BOTS){const w=playerPower(b.uid);T.L('   ',b.name,'flotte',Math.round(seat0[b.uid]),'→',Math.round(w),'(+'+Math.round(add)+' attendus)');T.ok(w>=seat0[b.uid]+add*.9,b.name+' : légions sur sa forteresse')}
T.ok(Object.values(S.chat||{}).some(m=>m&&/légions ont rejoint/.test(JSON.stringify(m))),'annonce de Vorgath');
const atk=Object.values(S.fleets).filter(f=>isBot(f.owner)&&f.mission==='attack');T.L('   1re vague',atk.map(f=>pname(f.owner)+' → '+plName(f.to)+' '+unitLine(f.ships)).join(' | '));
T.ok(new Set(atk.map(f=>f.owner)).size===3,'1re vague : les 3 seigneurs attaquent tout de suite (malgré atkAt dans 15 h)');
T.ok(BOTS.every(b=>S.players[b.uid].bot.w1),'1re vague marquée (une seule fois)');
T.ok(S.reports.some(r=>/Seigneur d’Orion/.test(r.ptitle||'')&&r.push),'notif d’attaque au joueur');
// pas de 2e vague au tour suivant
const n1=atk.length;for(const b of BOTS){const x=S.players[b.uid];x.bot={...x.bot,next:0}};T.sync();BOT_T=0;await T.tick(2);
T.ok(Object.values(S.fleets).filter(f=>isBot(f.owner)&&f.mission==='attack').length===n1,'pas de seconde vague immédiate');
await T.runToEnd(8);for(let i=0;i<3;i++){for(const b of BOTS){const x=S.players[b.uid];x.bot={...x.bot,next:0}};T.sync();BOT_T=0;T.adv(30*60e3);await T.tick(2)}await T.runToEnd(8);
T.ok(!Object.values(S.fleets).some(f=>isBot(f.owner)&&f.mission!=='reinforce'&&f.phase==='hold'),'les flottes des seigneurs rentrent après l’attaque : '+Object.values(S.fleets).filter(f=>isBot(f.owner)).map(f=>f.mission+':'+f.phase).join(','));
// nuit : attaque reportée au matin
window.NIGHT_OFF=false;const at=(h,m=0)=>{for(let d=0;d<3;d++){const base=Date.now()+d*864e5;const [hh,mm]=parisHM(base);const t=base-(base%60e3)+((h-hh)*60+(m-mm))*60e3;if(t>Date.now())return t}};
T.adv(at(2,0)-Date.now());S.planets[P1].ships={fighter:30,cruiser:5,battleship:0,probe:0,colony:0};
for(const b of BOTS){const x=S.players[b.uid];x.bot={...x.bot,next:0,atkAt:Date.now()-1}};T.sync();
const before=Object.values(S.fleets).filter(f=>isBot(f.owner)&&f.mission==='attack'&&f.phase==='out').length;
BOT_T=0;await T.tick(2);
T.ok(Object.values(S.fleets).filter(f=>isBot(f.owner)&&f.mission==='attack'&&f.phase==='out').length===before,'aucune attaque lancée la nuit');
const nx=BOTS.map(b=>S.players[b.uid].bot.atkAt);T.L('   now',clock(Date.now()),'next',BOTS.map(b=>clock(S.players[b.uid].bot.next)).join(','),'fleets',Object.values(S.fleets).filter(f=>isBot(f.owner)).map(f=>f.owner+':'+f.mission+':'+f.phase).join(','));T.L('   reportées à',nx.map(t=>clock(t)).join(', '));
T.ok(nx.some(t=>t>=at(9)-60e3&&t<=at(9)+31*60e3)&&nx.every(t=>!isNight(t)&&(t<=at(9)+31*60e3||t>=Date.now()+10*HR-60e3)),'attaques reportées à 9 h – 9 h 30 (ou dans 10 à 20 h si aucune cible)');
T.adv(at(9,31)-Date.now());for(const b of BOTS){const x=S.players[b.uid];x.bot={...x.bot,next:0}};T.sync();BOT_T=0;await T.tick(2);
T.ok(Object.values(S.fleets).filter(f=>isBot(f.owner)&&f.mission==='attack'&&f.phase==='out').length>before,'au matin, les attaques partent');
// vengeance de nuit reportée aussi
T.adv(at(1,0)-Date.now());const k=S.players['orion-1'];k.bot={...k.bot,next:0,atkAt:Date.now()+20*HR,rev:{uid:me,at:Date.now()-1,n:0}};T.sync();BOT_T=0;await T.tick(2);
const rv=S.players['orion-1'].bot.rev;T.ok(rv&&rv.uid===me&&!isNight(rv.at)&&rv.at>=at(9)-60e3,'vengeance de nuit reportée au matin ('+(rv&&clock(rv.at))+')');
window.NIGHT_OFF=true;
