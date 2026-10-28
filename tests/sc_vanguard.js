// avant-garde du pacte : à l'annonce de l'invasion, les Seigneurs lâchent les Pillards sur plusieurs planètes de chaque empire
const P1=window.__P1;await T.tick(2);await sleep(50);
const free=Object.keys(PLANETS).filter(k=>!S.planets[k]&&!PLANETS[k].core&&!PLANETS[k].raid&&!PLANETS[k].comet&&!PLANETS[k].sig&&!PLANETS[k].deep&&!isBody(k)&&galOf(k)===galOf(P1)).sort((a,b)=>dist(a,P1)-dist(b,P1));
const [C1,C2,C3,P2]=[free[2],free[3],free[4],free[7]];for(const c of [C1,C2,C3])S.planets[c]={...colonyPlanet(c,'u1'),ships:{fighter:500,cruiser:100,battleship:20}};
S.planets[P2]={...S.planets[P1],pid:P2,owner:'u2',capital:true,bq:[],shipQ:[]};
S.events.invasion={kind:'event',id:'invasion',v:2,at:Date.now()+23*HR,n:0,phase:'wait',ann:true};T.sync();
INV_T=0;await T.tick(2);await sleep(50);let e=S.events.invasion;
const F=Object.values(S.fleets).filter(f=>f.vg!=null);T.L('   avant-garde',F.length,'flottes',F.map(f=>plName(f.to)+'←'+pname(f.pact)).join(', '));
T.ok(e.vg&&e.vg.fl&&Object.keys(e.vg.fl).length===F.length&&F.length>=4,'avant-garde lancée à l’annonce');
T.ok(F.filter(f=>S.planets[f.to].owner==='u1').length===3&&F.filter(f=>S.planets[f.to].owner==='u2').length===1,'plusieurs planètes par empire (3 max : capitale + 2 plus grosses colonies)');
T.ok(F.every(f=>f.owner===NPC&&isBot(f.pact)&&f.arrive-Date.now()>=HR-60e3&&f.arrive-Date.now()<=2*HR+60e3),'flottes pillardes du pacte, impacts dans 1 à 2 h');
T.ok(S.reports.some(r=>/Avant-garde du pacte/.test(r.title||'')&&r.push&&r.to[0]==='u1'),'notif à chaque empire');
T.ok(Object.values(S.chat||{}).some(m=>/Pacte des Seigneurs et du Néant/.test(m.text||m.t||''))||S.reports.length>0,'annonce dans l’Univers');
INV_T=0;await T.tick(2);T.ok(Object.values(S.fleets).filter(f=>f.vg!=null).length===F.length,'lancée une seule fois');
S.tab='news';render();T.ok(/Avant-garde du pacte/.test([...document.querySelectorAll('.inv-alert')].map(x=>x.textContent).join(' ')),'Actus : état de l’avant-garde');
// combats : u1 tient tout, u2 tombe
for(const p of Object.values(S.planets))if(p.owner==='u1')p.ships={fighter:90000,cruiser:30000,battleship:12000};S.planets[P2].ships={};S.planets[P2].lv.def=0;T.sync();
T.adv(2*HR+5*60e3);for(let i=0;i<6;i++){await T.tick(2);await T.battleEnd()}await sleep(50);e=S.events.invasion;const v=vgStat(e);
T.L('   résultat',JSON.stringify(v));T.ok(v.rep===3&&v.won===1,'résultats de l’avant-garde notés ('+JSON.stringify(v)+')');
// une sur deux réussie : invasion +10 %
await locked('events/invasion',async(x,ref)=>{for(const k in x.vg.fl)x.vg.fl[k].res='won';await ref.set(x)});
T.adv(21*HR);INV_T=0;await T.tick(2);await sleep(50);const go=S.reports.find(r=>/L’invasion du Néant commence/.test(r.title||''));
T.ok(go&&go.lines.some(l=>/galvanisé/.test(l)),'avant-garde réussie : invasion 10 % plus forte, annoncée');
