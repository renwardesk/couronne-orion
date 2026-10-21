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
// réapparition des sentinelles : 48 h
T.ok(respawnOf(RAIDS[sen])===48*HR,'sentinelles des épaves : retour en 48 h');
S.events[sen]={kind:'event',id:sen,done:true,doneAt:Date.now()-30*HR,remaining:{}};T.sync();T.ok(raidState(sen).done,'30 h après leur défaite, toujours absentes');
S.events[sen].doneAt=Date.now()-49*HR;T.sync();T.ok(!raidState(sen).done,'49 h après, de retour');
const gd=Object.values(RAIDS).find(r=>r.guard&&!(SYSTEMS[r.sys]&&SYSTEMS[r.sys].deep==='wreck'));if(gd)T.ok(respawnOf(gd)===24*HR,'les autres gardiens restent à 24 h');
// bouton Coloniser sur la carte
S.events[sen].doneAt=Date.now();S.planets['wk0-2']={pid:'wk0-2',kind:'planet',owner:null,garrison:{},lb:Date.now()};T.sync();const h=mpPopHtml('wk0-2');T.L('   popup',h.match(/data-m="[a-z]+"/g).join(' '));T.ok(/data-m="colonize"/.test(h)&&/data-m="salvage"/.test(h),'carte : Récupérer et Coloniser proposés sur une épave libre');
