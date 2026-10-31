// ralliement : durée d'attente exacte (heures + minutes)
const P1=window.__P1,me='u1';await T.tick(2);
const tg=Object.keys(PLANETS).find(k=>PLANETS[k].raid&&!PLANETS[k].deep&&galOf(k)===galOf(P1));
S.planets[P1].ships.fighter=500;T.sync();
S.modal={from:P1,to:tg,mission:'rally',ships:{...zeroShips(),fighter:100},cmd:null};renderModal();
const h=document.querySelector('[data-rwh]'),m=document.querySelector('[data-rwm]');T.ok(h&&m,'champs heures / minutes présents');
h.value='1';m.value='47';m.dispatchEvent(new Event('input',{bubbles:true}));m.dispatchEvent(new Event('change',{bubbles:true}));await sleep(300);
T.ok(S.modal.rw===107,'durée exacte 1 h 47 = 107 min ('+S.modal.rw+')');T.ok(/départ à/.test(document.querySelector('.rwx').textContent),'heure de départ affichée');
const h2=document.querySelector('[data-rwh]');T.ok(h2&&h2.value==='1'&&document.querySelector('[data-rwm]').value==='47','valeurs gardées après réaffichage');
h2.value='40';h2.dispatchEvent(new Event('input',{bubbles:true}));T.ok(S.modal.rw===RW_MAX,'plafonné à 12 h ('+S.modal.rw+')');
const t=await T.send({from:P1,to:tg,mission:'rally',ships:{fighter:100},cmd:'a',extra:{rw:107}});
const R=Object.values(S.fleets).find(x=>x.owner===me&&x.phase==='rally');T.ok(R&&Math.abs(R.rallyUntil-Date.now()-107*60000)<5000,'ralliement ouvert pour 107 min '+t.join('|'));
// bras droit : ses places s'ajoutent au ralliement, sans bonus ; il est occupé tant que le ralliement est ouvert
S.players[me].cmds=[...(S.players[me].cmds||[]).filter(c=>c.id!=='bA'&&c.id!=='bB'),{id:'bA',key:'l1',xp:0,base:P1},{id:'bB',key:'e1',xp:0,base:P1}];S.planets[P1].ships.fighter=900;T.sync();
const c1=rallyCap(me,'bA'),c2=rallyCap(me,'bB');T.ok(c1>=10000,'capacité doublée (légendaire niv. 0 : '+c1+')');
S.modal={from:P1,to:tg,mission:'rally',ships:{...zeroShips(),fighter:50},cmd:'bA'};renderModal();
await sleep(50);const sel=document.getElementById('mcmd2');T.ok(sel&&[...sel.options].some(o=>o.value==='bB')&&![...sel.options].some(o=>o.value==='bA'),'choix du bras droit (sans le commandant principal)');
sel.value='bB';sel.onchange();await sleep(50);T.ok(S.modal.cmd2==='bB'&&new RegExp(fmt(c1+c2)).test(document.querySelector('.modal')?document.querySelector('.modal').textContent:document.body.textContent),'places affichées = '+(c1+c2));
const t3=await T.send({from:P1,to:tg,mission:'rally',ships:{fighter:50},cmd:'bA',extra:{rw:30,cmd2:'bB'}});
const R2=Object.values(S.fleets).find(x=>x.owner===me&&x.phase==='rally'&&x.cmd==='bA');T.ok(R2&&R2.cmd2==='bB'&&R2.rcap===c1+c2&&Math.abs(R2.rb-rallyBonus(me,'bA'))<1e-9,'ralliement : capacité cumulée, bonus du seul commandant '+t3.join('|'));
T.ok(cmdBusy(me,'bB'),'bras droit occupé pendant le ralliement');
