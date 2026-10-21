const P1=window.__P1,me='u1';
const sen=(SYSTEMS[PLANETS['wk0-1'].sys].packs||[])[0];T.L('sentinelle',sen,raidState(sen).done);
// on tue les sentinelles et on met l'épave dans l'état réel (équipage vaincu, doc sans propriétaire)
S.events[sen]={kind:'raid',pid:sen,done:true,doneAt:Date.now(),back:Date.now()+9e8,remaining:{}};
S.planets['wk0-1']={lb:Date.now()-3600e3,pid:'wk0-1',kind:'planet',owner:null,garrison:{}};S.players.u1.rare={ir:5000,xe:5000,am:100};S.players.u1.unl=9;T.sync();
T.L('vue',JSON.stringify(view('wk0-1')).slice(0,200),'raidState done',raidState(sen).done);
openSend('wk0-1','colonize');T.L('mission par défaut',S.modal.mission,'chips',[...document.querySelectorAll('[data-act="mmis"]')].map(b=>b.dataset.m+(b.disabled?'(off)':'')).join(','));
S.modal.mission='colonize';S.modal.ships={...zeroShips(),colony:1,fighter:20};renderModal();
T.L('bouton',document.querySelector('[data-act="mgo"]')&&document.querySelector('[data-act="mgo"]').outerHTML.slice(0,150));
const t=await T.send({from:P1,to:'wk0-1',mission:'colonize',ships:{colony:1,fighter:20}});T.L('envoi',t.join('|'));
const f=T.fleetsOf(me).find(x=>x.to==='wk0-1');T.ok(!!f,'navire colon parti vers l’épave');
if(f){T.adv(f.arrive-Date.now()+500);await T.tick(3);T.L('rapports',S.reports.slice(0,3).map(r=>r.title).join(' | '));T.ok(S.planets['wk0-1']&&S.planets['wk0-1'].owner===me,'avant-poste installé sur l’épave')}
