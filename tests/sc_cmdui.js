// interface des commandants : filtres, tri par rôle, commandant conseillé, alerte Gardien
const P1=window.__P1;
await withPlayer('u1',d=>{d.cmds=['c1','c9','c12','c16','r3','r13','r14','r5','e3','e9','l2'].map((k,i)=>({id:'k'+k,key:k,xp:2000+i*1500}))});await sleep(30);
const far=Object.keys(PLANETS).filter(k=>!S.planets[k]&&!PLANETS[k].core&&!PLANETS[k].raid&&!PLANETS[k].comet&&!PLANETS[k].sig&&!PLANETS[k].deep&&!isBody(k)&&galOf(k)===galOf(P1)).sort((a,b)=>dist(a,P1)-dist(b,P1))[2];
S.planets[far]={...colonyPlanet(far,'u1'),ships:{fighter:100}};T.sync();
await withPlayer('u1',d=>{d.cmds.find(c=>c.key==='r13').base=far;d.cmds.find(c=>c.key==='c16').inj=Date.now()+3*HR});await sleep(30);
S.tab='cmds';S.cmdF=null;render();await sleep(30);
const txt=()=>document.querySelector('main').textContent;
T.ok(document.querySelectorAll('.crole').length===4&&/Attaque/.test(txt())&&/Défense/.test(txt())&&/Chasse/.test(txt())&&/Utiles/.test(txt()),'commandants rangés par rôle (4 familles)');
T.ok(document.querySelectorAll('[data-act="cmdf"]').length>=7&&document.getElementById('cmdfpl'),'filtres : état, tri, planète');
document.querySelector('[data-act="cmdf"][data-v="hurt"]').click();await sleep(30);T.ok(document.querySelectorAll('.cmdt').length===1,'filtre « Blessés » : 1 commandant');
document.querySelector('[data-act="cmdf"][data-v="free"]').click();await sleep(30);T.ok(document.querySelectorAll('.cmdt').length===10,'filtre « Libres » : 10');
S.cmdF={st:'all',pl:far,sort:'lv'};render();await sleep(30);T.ok(document.querySelectorAll('.cmdt').length===1&&!document.querySelector('.crole'),'filtre planète + tri par niveau');
S.cmdF=null;
// fenêtre d'envoi : conseil selon la mission
const raid=Object.keys(RAIDS).find(k=>PLANETS[k]&&galOf(k)===galOf(P1)&&!PLANETS[k].deep);
S.modal={from:P1,to:raid,mission:'attack',ships:{...zeroShips(),fighter:50},cmd:null};renderModal();await sleep(30);
let best=document.querySelector('.cmdchips .chip.cbest');T.ok(best&&/Grand Veneur|Corsaire Morvan|Traqueur/.test(best.textContent)&&/contre les Écumeurs/.test(document.querySelector('.cbestl').textContent),'contre les Écumeurs : chasseur de pirates conseillé ('+(best&&best.textContent.trim())+')');
S.modal={from:P1,to:P1,mission:'reinforce',ships:{...zeroShips(),fighter:50},cmd:null};renderModal();await sleep(30);
best=document.querySelector('.cmdchips .chip.cbest');T.ok(best&&/Muraille|Garde|Major|Bastion/.test(best.textContent),'en renfort : défenseur conseillé ('+(best&&best.textContent.trim())+')');
S.modal={from:P1,to:far,mission:'attack',ships:{...zeroShips(),battleship:500,fighter:10},cmd:null};const op=far;S.planets[far].owner='u2';T.sync();renderModal();await sleep(30);
best=document.querySelector('.cmdchips .chip.cbest');T.ok(best&&/Kaelor|Maître Roderic/.test(best.textContent),'flotte de cuirassés contre un empire : amiral de ligne ('+(best&&best.textContent.trim())+')');
document.querySelector('.cbestl [data-act="mcmd"]').click();await sleep(30);T.ok(S.modal.cmd===best.dataset.c,'« Le prendre » choisit le conseillé');
S.modal=null;renderModal();S.planets[far].owner='u1';T.sync();
// alerte Gardien : planète attaquée sans Gardien, Gardien libre ailleurs
await withPlayer('u1',d=>{for(const c of d.cmds)if(['r13','e9'].includes(c.key))c.base=far});await sleep(30);
await locked('fleets/atkx',async(d,ref)=>{await ref.set({kind:'fleet',fid:'atkx',owner:'u2',from:far,to:P1,mission:'attack',ships:{fighter:10},cargo:{m:0,c:0,f:0},depart:Date.now(),arrive:Date.now()+20*HR,phase:'out',spied:[]})});
S.tab='fleets';render();await sleep(30);const g=document.querySelector('.gtip');
T.ok(g&&/Aucun Gardien/.test(g.textContent)&&g.querySelector('[data-act="cmdgo"]'),'planète attaquée : Gardien libre proposé');
g.querySelector('[data-act="cmdgo"]').click();await sleep(80);T.ok(cmdsOf('u1').some(c=>['r13','e9'].includes(c.key)&&c.move&&c.move.to===P1),'« Envoyer » déplace le Gardien vers la planète attaquée');
