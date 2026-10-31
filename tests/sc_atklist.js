// fenêtre d'envoi : les planètes attaquées sont marquées dans la liste de départ
const P1=window.__P1,me='u1';await T.tick(2);
const P2=Object.keys(PLANETS).filter(k=>!S.planets[k]&&!PLANETS[k].raid&&!PLANETS[k].core&&!PLANETS[k].comet&&!PLANETS[k].sig&&!PLANETS[k].deep&&!isBody(k)&&galOf(k)===galOf(P1)).sort((a,b)=>dist(a,P1)-dist(b,P1))[2];
S.planets[P2]={...S.planets[P1],pid:P2,owner:me,capital:false,bq:[],shipQ:[],ships:{...zeroShips(),fighter:50},lv:{...S.planets[P1].lv}};S.planets[P1].ships.fighter=500;
S.fleets.zz={kind:'fleet',fid:'zz',owner:'u2',from:P2,to:P1,mission:'attack',phase:'out',ships:{fighter:100},depart:Date.now(),arrive:Date.now()+3600e3};T.sync();
S.modal={from:P1,to:P2,mission:'reinforce',ships:{...zeroShips(),fighter:10},cmd:null};renderModal();
const op=[...document.querySelectorAll('#mfrom option')];const a=op.find(o=>o.value===P1),b=op.find(o=>o.value===P2);
T.ok(a&&/^⚔/.test(a.textContent)&&/ATTAQUÉE impact/.test(a.textContent),'planète attaquée marquée : '+(a&&a.textContent));
T.ok(b&&!/⚔|ATTAQUÉE/.test(b.textContent),'planète tranquille non marquée');
T.ok(/est attaquée/.test((document.querySelector('.atkwarn')||{}).textContent||''),'avertissement si on part d’une planète attaquée');
