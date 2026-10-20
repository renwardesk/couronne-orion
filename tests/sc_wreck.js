// épaves : saut moitié prix en mission Récupérer, minerais rares proportionnels à la soute
const P1=window.__P1,me='u1';const wk=Object.keys(PLANETS).find(p=>PLANETS[p].type==='wreck'&&galPos(p)===0.5);
const sen=(SYSTEMS[PLANETS[wk].sys].packs||[])[0];S.events[sen]={kind:'event',id:sen,done:true,doneAt:Date.now(),at:Date.now(),raid:true};S.planets[wk]={kind:'planet',pid:wk,owner:null,garrison:{},lb:Date.now()};
S.planets[P1].ships.fighter=400;S.players[me].rare={ir:1000,xe:1000,am:0};T.sync();
const jS=jumpCost(P1,wk,{fighter:100},'salvage'),jA=jumpCost(P1,wk,{fighter:100},'attack');T.L('saut 100 chasseurs : récupérer',JSON.stringify(jS),'· attaque',JSON.stringify(jA));
T.ok(jS.ir*2>=jA.ir&&jS.ir<jA.ir,'saut moitié prix pour récupérer');
// fenêtre d'envoi affiche le coût réduit
openSend(wk,'salvage');S.modal.mission='salvage';S.modal.ships.fighter=100;renderModal();const txt=document.getElementById('modal').innerText;T.ok(txt.includes(fmt(jS.ir)+' iridium'),'coût réduit affiché dans la fenêtre');S.modal=null;renderModal();
let t=await T.send({from:P1,to:wk,mission:'salvage',ships:{fighter:300}});T.ok(!t.length,'récupération à 300 chasseurs '+t.join('|'));
const j3=jumpCost(P1,wk,{fighter:300},'salvage');T.ok(S.players[me].rare.ir===1000-j3.ir,'payé '+j3.ir+' iridium');
const f=T.fleetsOf(me).find(x=>x.mission==='salvage');T.adv(f.arrive-Date.now()+500);await T.tick();
const f2=S.fleets[f.fid];T.L('   minerais rapportés',JSON.stringify(f2&&f2.rareCargo),'soute',cargoCap({fighter:300}));
T.ok(f2&&f2.rareCargo&&f2.rareCargo.ir>j3.ir,'l’expédition rapporte plus d’iridium qu’elle n’en coûte ('+(f2&&f2.rareCargo.ir)+' > '+j3.ir+')');
