const P1=window.__P1,me='u1';const wk=Object.keys(PLANETS).find(p=>PLANETS[p].type==='wreck'&&galPos(p)===0.5);
// 1) sentinelles vivantes : envoi refusé, rien payé
{S.players[me].rare={ir:200,xe:100,am:0};T.sync();const t0=await T.send({from:P1,to:wk,mission:'salvage',ships:{fighter:100}});T.ok(t0.some(x=>/Sentinelles/.test(x)),'refus tant que les sentinelles vivent : '+t0.join('|').slice(0,90));T.ok(S.players[me].rare.ir===200,'aucun minerai perdu')}
// 2) sentinelles vaincues
const sen=(SYSTEMS[PLANETS[wk].sys].packs||[])[0];S.events[sen]={kind:'event',id:sen,done:true,doneAt:Date.now(),at:Date.now(),raid:true};T.sync();T.L('   état sentinelles',JSON.stringify(raidState(sen)).slice(0,80));
S.planets[wk]={kind:'planet',pid:wk,owner:null,garrison:{},lb:Date.now()};T.sync();
S.players[me].rare={ir:200,xe:100,am:0};T.sync();
const jc=jumpCost(P1,wk,{fighter:100});T.L('coût du saut',JSON.stringify(jc));
let t=await T.send({from:P1,to:wk,mission:'salvage',ships:{fighter:100}});T.ok(!t.length,'récupération lancée '+t.join('|'));
T.ok(S.players[me].rare.ir===200-jc.ir&&S.players[me].rare.xe===100-jc.xe,'minerais du saut payés');
// sans assez de minerai
S.players[me].rare={ir:10,xe:0,am:0};T.sync();t=await T.send({from:P1,to:wk,mission:'salvage',ships:{fighter:100}});T.ok(t.some(x=>/il te manque/.test(x)),'refus clair si manque de minerai : '+t.join('|').slice(0,120));
T.ok(S.players[me].rare.ir===10,'rien débité après le refus');
const f=T.fleetsOf(me).find(x=>x.mission==='salvage');T.adv(f.arrive-Date.now()+500);await T.tick();
T.L('   rapports',S.reports.slice(0,4).map(x=>x.title+' :: '+(x.lines||[]).join(' / ').slice(0,160)).join(' || '));const r=T.lastRep(me,/Récupération/);T.ok(!!r,'rapport de récupération : '+(r&&r.lines[0]));
const f2=S.fleets[f.fid];T.L('   flotte',f2&&f2.phase,JSON.stringify(f2&&f2.rareCargo));if(f2&&f2.phase==='hold'){await sendBack(f2,db.doc('fleets/'+f2.fid),'')}
await T.runToEnd();T.ok(!T.fleetsOf(me).length,'flotte rentrée');T.ok(S.players[me].rare.ir>10,'minerais rares rapportés ('+JSON.stringify(S.players[me].rare)+')');
