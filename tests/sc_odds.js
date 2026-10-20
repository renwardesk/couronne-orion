const P1=window.__P1,me='u1';
// une horde avec commandant (élite) : les chances affichées dans l'onglet Flotte doivent suivre la fenêtre d'envoi
const tg=Object.keys(RAIDS).filter(k=>RAIDS[k].gal===0&&!RAIDS[k].mid&&!RAIDS[k].guard&&!RAIDS[k].boss&&!raidState(k).done&&raidCmd(k)&&raidCmd(k).L>=3).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
T.ok(!!tg,'cible élite trouvée');T.L('cible',tg,PLANETS[tg].name,raidCmdTxt(tg));
const gar=raidGarrison(tg,null,Date.now());S.reports.unshift({id:'x',to:[me],at:Date.now(),title:'Rapport d’espionnage',intel:{pid:tg,at:Date.now(),ships:gar}});
const ships={fighter:Math.round((gar.fighter||0)*1.1),cruiser:Math.round((gar.cruiser||0)*1.1),battleship:Math.round((gar.battleship||0)*1.1)};
const R={fid:'fx',owner:me,cmd:'a',to:tg,from:P1,ships,phase:'rally',rallyUntil:Date.now()+9e5};
const pct=h=>[...h.matchAll(/<b>(\d+) %<\/b>/g)].map(m=>+m[1]);
const real=withCtx('raid',()=>winChance({...ships,flag:1},gar,rallyMods(me,'a',rallyBonus(me,'a')),raidMods(tg)));
const shown=pct(rallyOddsHtml(R))[0];
T.L('   simulation réelle',real,'% · onglet Flotte',shown,'%');
const old=winChance({...ships,flag:1},gar,rallyMods(me,'a',rallyBonus(me,'a')),null);T.L('   ancien calcul (sans le commandant de la horde)',old,'%');
T.ok(Math.abs(real-shown)<=12,'chances de l’onglet Flotte cohérentes avec le vrai combat');
