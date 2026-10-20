const P1=window.__P1,me='u1';
// cible : planète pirate proche dans Orion
const tg=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&!isBody(p)&&worth(view(p).garrison||{})>0&&worth(view(p).garrison)<worth({fighter:60})).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
T.L('cible',tg,PLANETS[tg].name,'garnison',unitLine(view(tg).garrison));
const p0=settle(S.planets[P1],Date.now()),f0=p0.res.f,ships0=T.totShips(me),cp0=S.players[me].cp||0,xp0=(S.players[me].cmds.find(c=>c.id==='a')||{}).xp;
const tt=await T.send({from:P1,to:tg,mission:'attack',ships:{fighter:80,cruiser:20},cmd:'a'});
T.ok(!tt.length,'envoi accepté '+(tt[0]||''));
const fl=T.fleetsOf(me).find(f=>f.to===tg);T.ok(fl&&fl.phase==='out','flotte en route');
const p1=settle(S.planets[P1],Date.now());T.ok(p1.ships.fighter===p0.ships.fighter-80&&p1.ships.cruiser===p0.ships.cruiser-20,'vaisseaux retirés de la planète');
T.ok(p1.res.f<f0,'hélium consommé ('+Math.round(f0-p1.res.f)+')');
T.ok(fl&&fl.ships.flag===1,'vaisseau amiral avec le commandant');
T.adv(fl.arrive-Date.now()+1000);await T.tick();
const rep=T.lastRep(me,/Pirates|pirates/);T.ok(!!rep,'rapport de combat : '+(rep&&rep.title));
if(rep)T.L('   ',(rep.lines||[]).join(' / ').slice(0,300));
const cp1=S.players[me].cp||0,xp1=(S.players[me].cmds.find(c=>c.id==='a')||{}).xp;
T.ok(cp1>cp0,'points de combat gagnés : '+cp0+' → '+cp1);T.ok(xp1>xp0,'XP commandant : '+xp0+' → '+xp1);
const f2=S.fleets[fl.fid];T.ok(f2&&f2.phase==='back','flotte sur le retour (autoBack) : '+(f2&&f2.phase));
const cargo=f2&&f2.cargo;T.L('   cargaison',JSON.stringify(cargo));
const pv=S.planets[tg];T.ok(pv&&!pv.owner&&isEmpty(pv.garrison||{}),'orbite libérée');
// retour
T.adv(f2.back-Date.now()+1000);await T.tick();
T.ok(!S.fleets[fl.fid],'flotte rentrée');
const p2=settle(S.planets[P1],Date.now());
const lost=rep&&rep.lines.join(' ');
const s1=T.totShips(me);T.L('   vaisseaux avant',JSON.stringify(ships0),'après',JSON.stringify(s1));
T.ok(s1.fighter<=ships0.fighter&&s1.cruiser<=ships0.cruiser&&(ships0.fighter-s1.fighter)<=80,'aucune duplication de vaisseaux');
T.ok(p2.res.m>=p1.res.m+(cargo?cargo.m:0)-1,'butin déposé sur la planète');
T.ok(!S.players[me].cmds.find(c=>c.id==='a').move,'commandant revenu');
