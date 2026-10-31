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
