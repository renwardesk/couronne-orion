// commandants v2 : double bonus, rareté Cosmique, annonces, colis de bienvenue des nouveaux
await T.tick(2);await sleep(50);
T.ok(RAR.k&&RAR.k.n==='Cosmique'&&RAR.k.sp===.2,'rareté Cosmique');
T.ok(Math.abs(CHEST.g.p.k-.01)<1e-9&&Math.abs(CHEST.s.p.k-.003)<1e-9&&Math.abs(Object.values(CHEST.g.p).reduce((a,b)=>a+b,0)-1)<1e-9&&Math.abs(Object.values(CHEST.s.p).reduce((a,b)=>a+b,0)-1)<1e-9,'cosmique : 1 % (or), 0,3 % (argent), totaux = 100 %');
{let n=0;for(let i=0;i<200000;i++)if(rollRar(CHEST.g.p,Math.random())==='k')n++;T.ok(n>1500&&n<2500,'tirage cosmique dans l’or ≈ 1 % ('+(n/2000).toFixed(2)+' %)')}
T.ok(rollRar(CHEST.g.p,.9999)==='k'&&rollRar(CHEST.g.p,.98)==='l','bornes du tirage');
const K=CMDDB.filter(x=>x[2]==='k'),D=CMDDB.filter(x=>x[5]&&x[2]!=='k');T.ok(K.length===5&&D.length===15,'5 cosmiques, 15 commandants à double bonus');
T.ok(CMDDB.every(x=>SPEC[x[3]]&&(!x[5]||SPEC[x[5]])),'uniquement des spécialités existantes');
T.ok(D.every(x=>x[6]+x[7]>1.05&&x[6]+x[7]<=1.25&&x[6]<1&&x[7]<1),'double bonus : chaque part plus faible qu’un bonus seul, total ≤ 125 %');
T.ok(new Set(CMDDB.map(x=>x[0])).size===CMDDB.length,'identifiants uniques');T.ok(CMDDB.filter(x=>x[2]==='l'||x[2]==='k').every(x=>LTAL[x[0]]),'chaque légendaire et cosmique a un talent unique');
{const miss=CMDDB.filter(x=>!FLAGM[x[0]]).map(x=>x[0]);T.ok(!miss.length,'chaque commandant a son vaisseau amiral'+(miss.length?' (manque '+miss.join(',')+' sur '+Object.keys(FLAGM).length+')':''))}
// effets en combat
const MX=cmdNext(CMD_LMAX-1)+10;await withPlayer('u1',d=>{d.cmds=[{id:'a',key:'c1',xp:0},{id:'b',key:'c19',xp:0},{id:'k',key:'k1',xp:0},{id:'k3',key:'k3',xp:0},{id:'l12',key:'l12',xp:MX}]});await sleep(30);
const m0=modsOf('u1'),A=forceMods('u1','a'),B=forceMods('u1','b'),Kx=forceMods('u1','k');
T.ok(Math.abs(A.fighter.att/m0.fighter.att-1.04)<1e-6&&Math.abs(A.fighter.hp/m0.fighter.hp-1)<1e-6,'simple : Assaut +4 % (inchangé)');
T.ok(spV(cmdById('u1','b'),'att')===3&&spV(cmdById('u1','b'),'hp')===2,'double : Harlan att 3 % + PV 2 %');
T.ok(Math.abs(B.fighter.att/m0.fighter.att-1.03)<1e-6&&Math.abs(B.fighter.hp/m0.fighter.hp-1.02)<1e-6,'double : les deux bonus s’appliquent au combat');
T.ok(spV(cmdById('u1','k'),'att')===20&&spV(cmdById('u1','k'),'gard')===20&&Math.abs(Kx.fighter.att/m0.fighter.att-1.2)<1e-6,'cosmique : deux spécialités à +20 %');
T.ok(Math.abs(Kx.flag.att/m0.flag.att-2.5*1.2)<1e-6,'vaisseau amiral cosmique ×2,5');
T.ok(Math.abs(cmdSpeed('u1','k3')-1.2)<1e-6&&Math.abs(cmdSpeed('u1','a')-1)<1e-6,'Elyra : vitesse +20 %');
{const g=cmdById('u1','k'),p=S.planets[window.__P1];await withPlayer('u1',d=>{const x=d.cmds.find(c=>c.id==='k');x.base=window.__P1;x.guard=true});await sleep(20);const dm=defMods(p,p.ships,[]),pm=planetMods(p);T.ok(dm.fighter.att>pm.fighter.att*1.19,'Aurel en garde : bonus Gardien des défenseurs')}
T.ok(spV(cmdById('u1','l12'),'amb')===Math.round(16*2*.7)&&spV(cmdById('u1','l12'),'att')===Math.round(16*2*.5),'légendaire double au niveau 10 : 22 % + 16 %');
T.ok(cmdScore(cmdById('u1','k'),'def')>cmdScore(cmdById('u1','a'),'def'),'le conseil ★ tient compte de la 2e spécialité');
// affichage
S.tab='cmds';S.cmdOpen='k';render();await sleep(50);{const t=document.body.innerText;T.ok(/Assaut \+ Gardien/.test(t)&&/Cosmique/.test(t),'fiche : rareté Cosmique et deux spécialités')}
T.ok(/<circle cx="20" cy="19" r="18.2"/.test(cmdBadge('k1',40)),'insigne cosmique (double anneau)');S.tab='planet';render();
// tirage d'un cosmique : annonce + réaction
await withPlayer('u1',d=>{d.cmds=[];d.chests={g:1}});await sleep(20);const R0=Math.random;Math.random=()=>.99995;try{await openChest('g')}finally{Math.random=R0}await sleep(9500);
T.ok(S.chestShow&&CMDK[S.chestShow.k].r==='k'&&document.querySelector('.cfx.cos'),'coffre : effet cosmique ('+(S.chestShow&&CMDK[S.chestShow.k].n)+')');
T.ok((S.chat||[]).some(m=>/^u-cos-/.test(m.id)&&m.uid==='univers'),'annonce dans l’Univers');for(let w=0;w<40&&!(S.chat||[]).some(m=>/^u-cosmic-cos-/.test(m.id));w++)await sleep(500);T.L('   AI.on',AI.on(),'chat',(S.chat||[]).filter(m=>/cos/.test(m.id)).map(m=>m.id+':'+m.uid).join(','),'lords',BOTS.filter(b=>S.players[b.uid]).length);T.ok((S.chat||[]).some(m=>/^u-cosmic-cos-/.test(m.id)&&isBot(m.uid)),'un Seigneur réagit');
T.ok(S.reports.some(r=>/a choisi de servir/.test(r.title||'')&&!r.to.includes('u1')),'les autres empires sont prévenus');
document.querySelector('[data-act="cfxx"]')&&document.querySelector('[data-act="cfxx"]').click();
// annonce de la mise à jour, une seule fois
await cmdV2Intro();await sleep(50);await cmdV2Intro();await sleep(50);
T.ok(S.reports.filter(r=>/Nouveaux commandants et rareté Cosmique/.test(r.title||'')).length===1,'annonce de la mise à jour, une seule fois');
T.ok((S.chat||[]).some(m=>m.id==='u-cmdv2'),'récit dans l’Univers');T.ok((S.chat||[]).some(m=>/^u-cosmicnews-cmdv2/.test(m.id)&&isBot(m.uid)),'les Seigneurs réagissent');
// nouveau joueur : colis de bienvenue + menace de l'Empereur
{const ME0=ME;ME='u9';let inp=document.getElementById('pseudo');if(!inp){inp=document.createElement('input');inp.id='pseudo';document.body.appendChild(inp)}inp.value='Zéphyr';S.joinColor='#12ab34';
try{await join();await sleep(25000)}finally{ME=ME0}
const pl=S.players.u9,cap=Object.values(S.planets).find(p=>p.owner==='u9'&&p.capital);T.ok(!!cap,'nouvel empire fondé');
T.ok(cap&&cap.ships.fighter>=1000&&cap.ships.cruiser===300&&cap.ships.battleship===100,'colis : 1 000 chasseurs, 300 croiseurs, 100 cuirassés');
T.ok(cap&&bayCap(cap)>=placesOf(cap.ships)+200,'les hangars logent la flotte ('+placesOf(cap.ships)+' / '+bayCap(cap)+')');
T.ok(pl&&slotsOf('u9')===7&&(pl.cmds||[]).map(c=>c.key).sort().join()==='c3,r13','7 emplacements, Pilote Talia et Capitaine Ysmé');
T.ok(S.reports.some(r=>/Colis de bienvenue/.test(r.title||'')&&r.to.join()==='u9'),'rapport du colis');
T.ok(S.reports.some(r=>/L’Empereur Vorgath t’a remarqué/.test(r.title||'')&&r.to.join()==='u9'),'menace de l’Empereur (rapport)');T.ok((S.chat||[]).some(m=>m.id==='u-ne-u9'&&m.uid==='vorgath'),'menace de l’Empereur dans l’Univers')}
// espionnage : l'indication de sondes tient compte du commandant Fantôme choisi
{await withPlayer('u1',d=>{d.cmds=[{id:'oe',key:'k5',xp:0}]});await sleep(20);const h={lv:3,n:51};const r=spyNeedCmd(h,'oe');T.ok(r.n===31&&r.n0===51&&r.red===40,'L’Œil d’Orion : 51 sondes → 31 (−40 %)');T.ok(spyNeedCmd(h,null).n===51,'sans commandant : inchangé');T.ok(/au lieu de 51/.test(spyHintHtml(r)),'indication affichée')}
