// Interception en plein espace : rapport complet (commandants, lieu, points, bataille rejouable)
const P1=window.__P1,now=Date.now();
S.planets[P1].ships.cruiser=200;T.sync();
const enemyFrom=Object.keys(PLANETS).find(p=>!S.planets[p]&&!isBody(p)&&galOf(p)===0&&!PLANETS[p].raid&&!PLANETS[p].core&&!PLANETS[p].deep);
S.players.u2.cmds=[{id:'z1',key:'r1',xp:3000}];
S.fleets.ea={kind:'fleet',fid:'ea',owner:'u2',from:enemyFrom,to:P1,mission:'attack',ships:{fighter:40,cruiser:10,flag:1},cmd:'z1',cargo:{m:0,c:0,f:0},depart:now-60e3,arrive:now+600e3,phase:'out',spied:[]};
S.fleets.ia={kind:'fleet',fid:'ia',owner:'u1',from:P1,to:P1,mission:'intercept',target:'ea',meet:[0,0,0],ships:{cruiser:120,flag:1},cmd:'a',cargo:{m:0,c:0,f:0},depart:now-30e3,arrive:now,phase:'out',spied:[]};T.sync();
await meetFight(S.fleets.ia,db.doc('fleets/ia'));await sleep(60);
const r=S.reports.find(x=>/plein espace|interceptée/.test(x.title||''));T.ok(r,'rapport d’interception');T.L('   ',r&&r.title);(r&&r.lines||[]).forEach(l=>T.L('    ·',l));
T.ok(r&&r.battle&&r.battle.rounds&&r.battle.rounds.length,'bataille rejouable jointe au rapport');
T.ok(r&&r.lines.some(l=>/Commandant des intercepteurs/.test(l))&&r.lines.some(l=>/Commandant adverse/.test(l)),'commandants des deux camps');
T.ok(r&&r.lines.some(l=>/Points de combat/.test(l))&&r.lines.some(l=>/Lieu/.test(l)),'lieu et points de combat');
S.tab='log';render();await sleep(40);const btn=document.querySelector(`[data-act="replay"][data-r="${r.id}"]`);T.ok(btn,'bouton « Voir la bataille »');if(btn){btn.click();await sleep(300);T.ok(!btel.hidden||/3D n’est pas disponible/.test(document.getElementById('toast').textContent),'le replay s’ouvre (ou message 3D indisponible sans WebGL)')}
