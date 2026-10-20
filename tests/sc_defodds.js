const P1=window.__P1,me='u1';
// un ralliement de u2 (chef + soutien) arrive sur ma planète : la « Chance de tenir » doit compter toute l'armée et le bonus de ralliement
const v=view(P1);S.planets[P1].ships={...zeroShips(),fighter:300,cruiser:80};T.sync();
const now=Date.now(),base={owner:'u2',from:'x',to:P1,mission:'attack',phase:'out',depart:now,arrive:now+6e5,cargo:{m:0,c:0,f:0},spied:[me]};
S.fleets.fL={...base,fid:'fL',ships:{fighter:200,cruiser:50},rb:.2};S.fleets.fS={...base,fid:'fS',mission:'rallysup',group:'fL',ships:{fighter:200,cruiser:50}};
const pct=h=>{const m=h.match(/Chance de tenir<\/span><b>(\d+) %/);return m?+m[1]:null};
const h=attackCards(P1),hold=pct(h);
const solo=100-winChance({fighter:200,cruiser:50},{...S.planets[P1].ships,turret:(S.planets[P1].lv.def||0)*4},forceMods('u2'),defMods(view(P1),{...view(P1).ships,turret:(S.planets[P1].lv.def||0)*4},[]));
T.L('   chance de tenir affichée',hold,'% · si on ne comptait que le chef',solo,'%');
T.ok(/ralliement : 2 flottes/.test(h),'l’encadré annonce les 2 flottes du ralliement');
T.ok(hold!=null&&hold<solo-15,'la chance de tenir compte toute l’armée du ralliement');
delete S.fleets.fL;delete S.fleets.fS;T.sync();
