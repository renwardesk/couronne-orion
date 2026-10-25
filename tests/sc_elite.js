// Éveil des commandants : étoiles après le niveau 10, talent à ★3, Élite à ★5
const MX=cmdNext(CMD_LMAX-1)+10;
await withPlayer('u1',d=>{d.cmds=CMDDB.filter(x=>!x[4]).map(([k])=>({id:'id-'+k,key:k,xp:MX}));d.chests={g:12};d.frag=0});await sleep(30);
const L=cmdById('u1','id-l4'),v0=cmdSpecVal(L);T.ok(cmdSt(L)===0&&!cmdTal(L),'au départ : 0 étoile, pas de talent');
let log=[];for(let i=0;i<12;i++){await openChest('g');await sleep(20);log.push(S.chestShow&&S.chestShow.aw?S.chestShow.aw.st:'x')}
T.L('   étoiles après chaque coffre :',log.join(' '));
const all=cmdsOf('u1'),tot=all.reduce((s,c)=>s+cmdSt(c)*10+(c.aw||0),0);T.ok(all.some(c=>cmdSt(c)>=1)&&(S.players.u1.frag||0)===0,'doublons au max → étoiles, plus d’Éclats');
await withPlayer('u1',d=>{const c=d.cmds.find(x=>x.key==='l4');c.st=3;c.aw=0;const k=d.cmds.find(x=>x.key==='c1');k.st=3});await sleep(30);
const L3=cmdById('u1','id-l4'),v3=cmdSpecVal(L3);T.ok(v3>v0&&Math.abs(v3/v0-1.18)<.03,'★3 légendaire : bonus principal +18 % ('+v0+' → '+v3+')');
const t=cmdTal(L3);T.ok(t&&t.n==='Vétéran immortel'&&t.fx.inj===75,'talent unique d’Orion l’Ancien : '+fxTxt(t.fx));
const tc=cmdTal(cmdById('u1','id-c1'));T.ok(tc&&tc.fx.hp===3,'talent générique d’un commun (Assaut → +3 % PV)');
const m0=modsOf('u1'),m1=forceMods('u1','id-c1');T.ok(Math.abs(m1.fighter.hp/m0.fighter.hp-(1+.015*10)*1.03)<.002,'le talent s’applique au combat');
await killCmd('u1','id-l4');await sleep(30);const h=(cmdById('u1','id-l4').inj-Date.now())/HR;T.ok(h>1.5&&h<2.5,'blessure 8 h → 2 h ('+h.toFixed(1)+' h)');
await withPlayer('u1',d=>{const c=d.cmds.find(x=>x.key==='l9');c.st=5});await sleep(30);
T.ok(Math.abs(pillShare('u1','id-l9')-.65)<.001,'Calyx Élite : pille 65 % des stocks');T.ok(cmdInfo(cmdById('u1','id-l9')).n.endsWith('✦'),'nom marqué ✦ en Élite');
S.tab='cmds';S.cmdOpen='id-l9';render();await sleep(50);T.ok(document.querySelector('.cmdc.elite .elb')&&document.querySelector('.awk .tal.on'),'fiche : étoiles, talent, badge Élite');
S.tab='planet';render();await withPlayer('u1',d=>{d.cmds=[{id:'z',key:'l2',xp:MX,st:5}];d.chests={g:3};d.frag=0});await sleep(20);await openChest('g');await sleep(20);
T.ok(S.chestShow.frag>0||!S.chestShow.dup,'★5 : un doublon redonne des Éclats');
await eliteIntro();await sleep(30);T.ok(S.reports.filter(r=>/éveil des commandants/.test(r.title||'')).length===1,'notif d’explication envoyée une fois');await eliteIntro();await sleep(20);T.ok(S.reports.filter(r=>/éveil des commandants/.test(r.title||'')).length===1,'… et une seule');
