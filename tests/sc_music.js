// musiques d'événement : thème joué pendant l'événement, retour à l'ambiance de base ensuite
SFX.on=true;ambient(true);await sleep(300);T.ok(MUS.playing&&!MUS.ev,'ambiance de base au départ');
S.events['orion-pact']={kind:'event',id:'orion-pact',at:Date.now(),fl:{x:{uid:'u1',pid:window.__P1}}};EVK.t=0;mSchedule();await sleep(200);T.ok(MUS.ev==='pact','coalition en cours : thème de la coalition');
let er=null;try{for(const k of['pact','void','crown']){MUS.ev=null;S.events['orion-pact']=k==='pact'?S.events['orion-pact']:null;S.events.invasion=k==='void'?{phase:'live'}:null;S.events.crusade=k==='crown'?{phase:2}:null;EVK.t=0;mSchedule();await sleep(150);if(MUS.ev!==k)er='thème '+k+' non choisi ('+MUS.ev+')'}}catch(e){er=e.message}
T.ok(!er,'les trois thèmes se jouent sans erreur'+(er?' : '+er:''));
S.events.crusade={phase:2};S.events.invasion={phase:'live'};EVK.t=0;MUS.ev=null;mSchedule();T.ok(MUS.ev==='crown','priorité : croisade > invasion > coalition');
S.events.crusade={phase:4};S.events.invasion={phase:'wait'};S.events['orion-pact']={fl:{},done:true};EVK.t=0;mSchedule();await sleep(100);T.ok(MUS.ev===null,'fin des événements : retour à l’ambiance de base');
ambient(false);
