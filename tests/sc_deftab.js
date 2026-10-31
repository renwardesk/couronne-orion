// Flottes : onglet Défense, un sous-onglet par joueur attaqué (moi + appels à l'aide), avec le nombre d'attaques
const P1=window.__P1,now=Date.now();
const P3=Object.keys(PLANETS).find(k=>!S.planets[k]&&!PLANETS[k].core&&!PLANETS[k].raid&&!PLANETS[k].comet&&!PLANETS[k].sig&&!isBody(k)&&galOf(k)===galOf(P1));
S.planets[P3]={...S.planets[P1],pid:P3,owner:'u3',capital:false,ships:{...zeroShips(),fighter:400},lv:{...S.planets[P1].lv},bq:[],shipQ:[]};
for(const i of [1,2,3])S.fleets['dA'+i]={fid:'dA'+i,owner:'u2',from:'x',to:P3,mission:'attack',phase:'out',depart:now,arrive:now+9e5+i*6e4,ships:{fighter:500},cargo:{m:0,c:0,f:0},spied:['u3']};
for(const i of [1,2])S.fleets['dM'+i]={fid:'dM'+i,owner:'u2',from:'x',to:P1,mission:'attack',phase:'out',depart:now,arrive:now+8e5+i*6e4,ships:{fighter:200},cargo:{m:0,c:0,f:0}};
S.players.u3={...S.players.u3,help:{pid:P3,fid:'dA1',arrive:now+9e5+6e4,at:now}};S.fltTab=null;S.defSub=null;S.tab='fleets';T.sync();render();
const tx=()=>document.body.innerText;
const tab=[...document.querySelectorAll('[data-act="flttab"]')].find(b=>b.dataset.t==='def');
T.ok(tab&&/Défense\s*5/.test(tab.textContent)&&tab.getAttribute('aria-pressed')==='true','onglet Défense ouvert d’office, 5 attaques ('+(tab&&tab.textContent)+')');
const subs=[...document.querySelectorAll('[data-act="defsub"]')].map(b=>b.textContent.replace(/\s+/g,' ').trim());
T.ok(subs.length===2&&/Toi 2/.test(subs[0])&&/Scorpius 3/.test(subs[1]),'sous-onglets Toi (2) et Scorpius (3) : '+subs.join(' | '));
T.ok(/attaques arrivent sur tes planètes/i.test(tx())&&!/Appel à l’aide de/i.test(tx()),'sous-onglet Toi : mes attaques seulement '+/attaques arrivent sur tes planètes/i.test(tx())+' '+(tx().match(/.{60}Appel à l’aide de.{40}/)||[''])[0]);
document.querySelector('[data-act="defsub"][data-t="u3"]').click();await sleep(100);
T.ok((tx().match(/Attaque attendue/g)||[]).length===3&&/Appel à l’aide de Scorpius/i.test(tx())&&!/arrivent sur tes planètes/i.test(tx()),'sous-onglet Scorpius : son appel seulement');
document.querySelector('[data-act="flttab"][data-t="vol"]').click();await sleep(100);
T.ok(document.querySelector('.defban')&&/2 attaques sur tes planètes/.test(document.querySelector('.defban').textContent)&&!/arrivent sur tes planètes/i.test(tx()),'autre onglet : simple bandeau vers Défense');
