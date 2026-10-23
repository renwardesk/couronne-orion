const P1=window.__P1,me='u1';
// renommer un commandant
const c=S.players[me].cmds[0];const old=cmdInfo(c).n;window.prompt=()=>'Capitaine Brume';await cmdRename(c.id);await sleep(50);
const c2=cmdById(me,c.id);T.ok(cmdInfo(c2).n==='Capitaine Brume'&&cmdInfo(c2).n0===old,'commandant renommé ('+old+' → '+cmdInfo(c2).n+')');
S.tab='cmds';S.cmdOpen=c.id;render();T.ok(/Capitaine Brume/.test(document.body.textContent)&&!!document.querySelector('[data-act="cmdren"]'),'nouveau nom et bouton ✎ sur la carte du commandant');
window.prompt=()=>'<b>x</b>';await cmdRename(c.id);await sleep(30);T.ok(!/[<>]/.test(cmdInfo(cmdById(me,c.id)).n),'pas de balises dans le nom');
window.prompt=()=>'';await cmdRename(c.id);await sleep(30);T.ok(cmdInfo(cmdById(me,c.id)).n===old,'nom vide : nom d’origine rétabli');
// chances d'un ralliement avant de choisir le commandant
const tg=Object.keys(RAIDS).filter(k=>RAIDS[k].gal===0&&RAIDS[k].local&&!RAIDS[k].mid&&!RAIDS[k].guard&&!RAIDS[k].boss&&!raidState(k).done).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
S.reports.unshift({id:'xi',to:[me],at:Date.now(),title:'Rapport d’espionnage',intel:{pid:tg,at:Date.now(),ships:raidGarrison(tg,null,Date.now())}});
openSend(tg,'rally');S.modal.ships={...zeroShips(),fighter:100,cruiser:30};S.modal.cmd=null;renderModal();T.ok(/Chance sans soutien ni commandant/.test(document.getElementById('modal').textContent),'ralliement : % affiché même sans commandant');S.modal=null;renderModal();
// Pillards : pas plus d'une attaque toutes les 18 h
S.players[me].nextRaid=Date.now()-1000;S.players[me].pillLast=Date.now()-2*HR;T.sync();PILL_T=0;await pillardTick();T.ok(!Object.values(S.fleets).some(f=>isNpc(f.owner)&&S.planets[f.to]&&S.planets[f.to].owner===me),'raid bloqué : dernière attaque il y a 2 h');
T.adv(17*HR);S.players[me].nextRaid=Date.now()-1000;T.sync();PILL_T=0;await pillardTick();const f=Object.values(S.fleets).find(x=>isNpc(x.owner)&&S.planets[x.to]&&S.planets[x.to].owner===me);T.ok(!!f,'raid autorisé 19 h après');
T.ok((S.players[me].pillLast||0)>Date.now()-60000,'heure de la dernière attaque retenue');
const w=S.reports.find(r=>/foncent sur/.test(r.title||''));T.ok(w&&/plus d’une fois toutes les 18 h/.test(w.lines.join(' ')),'le message l’explique');
T.ok(!pillReady(me),'les autres sources pillardes (expéditions, bases) sont aussi bloquées');
