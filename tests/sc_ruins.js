// une colonie prise par les Pillards garde ses bâtiments ; celui qui la reprend les retrouve
const P1=window.__P1,me='u1';
const col=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].comet&&!PLANETS[p].sig&&!PLANETS[p].raid&&!PLANETS[p].core&&galOf(p)===0&&!S.planets[p]&&!isBody(p)&&(lairInfoAt(SYSTEMS[PLANETS[p].sys])||{}).pid!==p).sort((a,b)=>dist(a,P1)-dist(b,P1))[0];
const c=colonyPlanet(col,me);c.lv={...c.lv,mine:9,crys:7,fuel:5,store:8,yard:6,bay:7,def:0};c.ships=zeroShips();S.planets[col]=c;S.players[me].slots=15;T.sync();
const lv0={...c.lv};
// attaque pillarde qui conquiert
const fid='plT';S.fleets[fid]={kind:'fleet',fid,owner:NPC,npc:true,from:col,to:col,mission:'attack',ships:{fighter:300,cruiser:100},cargo:{m:0,c:0,f:0},depart:Date.now(),arrive:Date.now()+1000,phase:'out',conquer:true,spied:[]};T.sync();
T.adv(2000);await T.tick(3);await T.battleEnd();await T.tick(2);
const d=S.planets[col];T.ok(d&&!d.owner&&d.pill,'colonie prise par les Pillards');T.ok(d&&d.lv&&d.lv.mine===9&&d.lv.store===8,'bâtiments gardés dans les ruines ('+JSON.stringify(d&&d.lv)+')');
// reconquête avec un colon
const hp=S.planets[P1];hp.ships={...hp.ships,fighter:2000,cruiser:800,battleship:300,colony:2};hp.lv.bay=20;hp.res={m:9e6,c:9e6,f:9e6};T.sync();
const t=await T.send({from:P1,to:col,mission:'colonize',ships:{fighter:1500,cruiser:600,battleship:200,colony:1}});T.L('   envoi',t.join('|'));
await T.runToEnd(30);const n=S.planets[col];T.ok(n&&n.owner===me,'planète reprise');
T.ok(n&&Object.keys(lv0).every(k=>(n.lv[k]||0)===(lv0[k]||0)),'les bâtiments sont revenus ('+JSON.stringify(n&&n.lv)+')');
T.ok(S.reports.some(r=>/bâtiments sont conservés/.test((r.lines||[]).join(' '))),'le rapport de perte l’annonce');
