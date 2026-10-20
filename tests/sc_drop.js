// choisir la planète qui reçoit le butin
const P1=window.__P1,me='u1';const P2=myPlanets().map(p=>p.pid).find(p=>p!==P1&&!isBody(p));
const tg=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&galOf(p)===0&&!S.planets[p]&&!isBody(p)&&worth(view(p).garrison||{})>0&&worth(view(p).garrison)<worth({fighter:40})).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
// la fenêtre propose le choix
S.tab='planet';render();openSend(tg);S.modal.mission='attack';S.modal.ships.fighter=50;renderModal();await sleep(30);const sel=document.getElementById('mdrop');T.ok(!!sel&&sel.options.length>=2,'sélecteur « Butin livré à » présent ('+(sel&&sel.options.length)+' planètes)');
T.ok(sel&&sel.value===P1,'par défaut : la planète de départ');sel.value=P2;sel.onchange();T.ok(S.modal.drop===P2,'choix enregistré');S.modal=null;renderModal();
const m2=settle(S.planets[P2],Date.now()).res.m;
let t=await T.send({from:P1,to:tg,mission:'attack',ships:{fighter:60,cruiser:20},extra:{drop:P2}});T.ok(!t.length,'attaque lancée '+t.join('|'));
const f=T.fleetsOf(me).find(x=>x.to===tg);T.ok(f.drop===P2,'destination du butin sur la flotte');
T.adv(f.arrive-Date.now()+500);await T.tick();const cg=(S.fleets[f.fid]||{}).cargo||{m:0};const fb=S.fleets[f.fid];T.adv(fb.back-Date.now()-200);for(const q of [P1,P2]){const z=settle(S.planets[q],Date.now());z.res.m=0;S.planets[q]=z}T.sync();const tA=Date.now(),a1=0,a2=0;T.adv(400);await T.tick();const dt=(Date.now()-tA)/60000;
const s1=settle(S.planets[P1],Date.now()),s2=settle(S.planets[P2],Date.now());const r=T.lastRep(me,/Pirates chassés/);
const g2=s2.res.m-a2-rates(s2).m*dt,g1=s1.res.m-a1-rates(s1).m*dt;T.ok(Math.abs(g2-cg.m)<3&&Math.abs(g1)<3,'butin ('+Math.round(cg.m)+' métal) livré à '+plName(P2)+' : +'+Math.round(g2)+', planète de départ : +'+Math.round(g1));
T.ok(!Object.values(S.fleets).length,'flotte rentrée');T.L('   chasseurs sur P1',s1.ships.fighter,'sur P2',s2.ships.fighter);
// planète de départ = avant-poste : le butin va à la capitale au lieu d'être perdu
const ob=Object.keys(PLANETS).filter(p=>isBody(p)&&!PLANETS[p].deep&&galOf(p)===0&&!S.planets[p]).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
const o=colonyPlanet(ob,me);o.lv.dock=2;S.planets[ob]=o;T.sync();const c0=settle(S.planets[P1],Date.now()).res.m;
await locked('fleets/xo',async(d,ref)=>{await ref.set({kind:'fleet',fid:'xo',owner:me,from:ob,to:tg,home:ob,mission:'attack',ships:{fighter:10},cargo:{m:1000,c:0,f:0},phase:'back',depart:Date.now()-1e5,arrive:Date.now()-5e4,back:Date.now()-1000})});
await T.tick();T.L('   capitale',(capitalOf(me)||{}).pid,'P1',P1,'delta',Math.round(settle(S.planets[P1],Date.now()).res.m-c0),'flotte',JSON.stringify(S.fleets.xo||'livrée'),'cap',capOf(S.planets[P1]));T.ok(Math.abs(settle(S.planets[P1],Date.now()).res.m-c0-1000)<60,'cargaison d’une flotte d’avant-poste livrée à la capitale');
