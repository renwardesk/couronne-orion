// pas de cumul : un repaire ne s'installe jamais sur une planète tenue par les Pillards
const s=SYSTEMS.find(x=>x.lair&&!x.deep&&x.gal===0&&x.planets.length>=3&&x.planets.every(p=>!S.planets[p]));const order=[...s.planets].sort((a,b)=>hash(a+'lair')-hash(b+'lair'));
T.L('   docs',JSON.stringify(order.map(p=>S.planets[p]?{o:S.planets[p].owner,pill:S.planets[p].pill,pb:S.planets[p].pbase}:null)),'le',JSON.stringify(S.events[s.lair]||null));S.events[s.lair]={kind:'event',id:s.lair,founded:Date.now()-3600e3,remaining:{fighter:50}};T.sync();
const L0=lairInfoAt(s);T.ok(L0&&L0.pid===order[0],'repaire sur la 1re planète libre ('+(L0&&L0.pid)+')');
S.planets[order[0]]={kind:'planet',pid:order[0],owner:null,garrison:{fighter:300,cruiser:100},pill:true};T.sync();
const L1=lairInfoAt(s);T.ok(L1&&L1.pid!==order[0],'planète prise par les Pillards : le repaire va ailleurs ('+(L1&&L1.pid)+')');
for(const p of order.slice(1))S.planets[p]={kind:'planet',pid:p,owner:null,garrison:{fighter:10},pill:true,pbase:'x'};T.sync();
T.ok(!lairInfoAt(s),'toutes les planètes libres tenues par les Pillards : pas de repaire');
T.ok(raidState(s.lair).absent,'le repaire est absent (rien à attaquer en double)');
S.planets[order[0]]={kind:'planet',pid:order[0],owner:null,garrison:{}};T.sync();T.ok((lairInfoAt(s)||{}).pid===order[0],'Pillards vaincus : le repaire peut revenir sur la planète libérée');
for(const p of order)delete S.planets[p];delete S.events[s.lair];T.sync();
