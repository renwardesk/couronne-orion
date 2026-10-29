// fin de combat de boss interrompue (appareil coupé) : un autre client reprend sans payer deux fois
const P1=window.__P1,me='u1';await T.tick(2);
await withPlayer(me,d=>{d.cmds=[{id:'A',key:'l4',xp:102996,st:5,aw:0},{id:'B',key:'r5',xp:18944,st:2,aw:1}];d.chests={};d.frag=0;d.ins=0});
const P2=Object.keys(S.planets).find(k=>S.planets[k].owner===me&&k!==P1)||P1,now=Date.now(),R=RAIDS['btL'],K=LEGK.find(k=>CMDK[k].n===btName('btL'));
const mk=(fid,from,ships,cmd)=>({kind:'fleet',fid,owner:me,from,home:from,to:'btL',mission:'attack',ships,cargo:{m:0,c:0,f:0},depart:now-3*HR,arrive:now-10*60e3,phase:'battle',bt:'bt-btL',cmd,rb:.2,autoBack:true,spied:[]});
S.fleets.F1=mk('F1',P1,{flag:1,cruiser:2357,fighter:4968,battleship:948},'A');S.fleets.F2=mk('F2',P2,{flag:1,cruiser:366,fighter:1790,battleship:64},'B');
S.events['bt-btL']={kind:'event',id:'bt-btL',battle:true,raid:true,pid:'btL',btn:btName('btL'),owner:null,start:now-11*60e3,rounds:12,maxR:45,done:true,won:true,doneAt:now-1000,fin:now-500,next:now,hw:37390,kA:37390,kD:8084,dmg:.24,tur:0,dal:[],home:{cruiser:0,fighter:0,battleship:0},iA:{flag:2,cruiser:2723,fighter:6758,battleship:1012},iD:{cruiser:3595,fighter:10458,battleship:1046},
 att:[{w:25802,rb:.2,cmd:'A',fid:'F1',owner:me,ships:{flag:1,cruiser:1701,fighter:3638,battleship:705},ships0:{flag:1,cruiser:2357,fighter:4968,battleship:948}},{w:4052,rb:.2,cmd:'B',fid:'F2',owner:me,ships:{flag:0,cruiser:257,fighter:1306,battleship:42},ships0:{flag:1,cruiser:366,fighter:1790,battleship:64}}],snaps:[{a:{flag:1,cruiser:1958,fighter:4944,battleship:747},d:{cruiser:0,fighter:0,battleship:0}}]};
T.sync();const m0=S.planets[P1].res.m;
// 1er client : coupé juste après avoir livré le butin et renvoyé les flottes
const aw=award;award=async()=>{throw new Error('coupure')};
try{await locked('events/bt-btL',async(ev,eref)=>{await bossFinish(ev,eref,R,{cruiser:0,fighter:0,battleship:0})})}catch(x){}
award=aw;await sleep(50);
const e1=S.events['bt-btL'],m1=S.planets[P1].res.m;T.ok(e1.pay&&e1.pay.st.goods&&e1.pay.st.fleets&&!e1.pay.st.award&&!e1.settled,'étapes notées : butin et flottes faits, gains non');
T.ok(m1>m0&&['F1','F2'].every(k=>!S.fleets[k]||S.fleets[k].phase!=='battle'),'butin livré, flottes libérées ('+Math.round(m1-m0)+' métal)');
T.ok(!cmdsOf(me).some(c=>c.key===K),'pas encore de légendaire');
// 2e client, plus tard
await T.tick(2);T.ok(!S.events['bt-btL'].settled,'pas de reprise avant 90 s');
T.adv(100e3);await T.tick(3);await sleep(100);
const e2=S.events['bt-btL'];T.ok(e2.settled,'reprise : paiement terminé');
T.ok(cmdsOf(me).some(c=>c.key===K),'légendaire recruté à la reprise ('+CMDK[K].n+')');
T.ok(Math.abs(S.planets[P1].res.m-m1)<5000,'butin pas versé deux fois');
T.ok((S.players[me].chests||{}).g>=1&&(S.players[me].ins||0)>0&&(S.players[me].frag||0)>0,'coffre, insignes et Éclats donnés');
T.ok(S.reports.some(r=>/abattu le capitaine légendaire/.test(r.title||''))&&S.reports.some(r=>/rejoint/.test(r.title||'')),'rapports de victoire envoyés');
T.adv(200e3);await T.tick(3);T.ok(cmdsOf(me).filter(c=>c.key===K).length===1&&S.reports.filter(r=>/abattu le capitaine légendaire/.test(r.title||'')).length===1,'rien n’est refait ensuite');
