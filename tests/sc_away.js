const me='u1',P1=window.__P1,now=Date.now(),h=HR;
const mk=(dt,title,lines,extra)=>({id:'r'+Math.random(),kind:'report',to:[me],at:now-dt,title,lines,...(extra||{})});
const reps=[mk(9*h,'Les Pillards du Néant foncent sur Ansolris II',['Une flotte pillarde arrive à 21:01.'],{tone:'loss'}),
 ...[1,2,3,4].map(i=>mk(8*h-i*60e3,'Combat en plein espace sur la route de Ansolris II',[`Intercepteurs : ${i*80} chasseurs — pertes : tout.`],{tone:'info'})),
 mk(7.5*h,'Pillards du Néant remporte la grande bataille de Ansolris II',['Butin : 20 971 métal.'],{tone:'loss',battle:{pid:P1},loser:me,push:true}),
 mk(7.4*h,'Pillards du Néant a pillé Ansolris II',['Ressources volées : 20 971 métal, 19 605 cristal.'],{tone:'loss'}),
 mk(5*h,'🔭 Les sondes de Kael Voryn au-dessus de Ansolris I',['Un Seigneur d’Orion étudie tes défenses.'],{tone:'info'}),
 mk(3*h,'Pirates chassés de Mibelnex III',['Butin · 1620 points de combat.'],{tone:'win',battle:{pid:P1}}),
 mk(2*h,'🎖 Tes gains · Mibelnex III',['+1 620 points de combat.'],{tone:'win'}),
 mk(1*h,'🪐 Nouvelle colonie : Mibelnex III',['Le vaisseau colon s’est posé.'],{tone:'win',push:true})];
S.reports=[...reps.reverse(),...S.reports];S.awayFrom=now-10*h;S.awayDone=false;S.tab='planet';S.sel=P1;render();
const a=document.querySelector('.away');T.ok(!!a,'résumé « pendant ton absence » affiché');T.L('   ',a&&a.textContent.replace(/\s+/g,' ').slice(0,400));
T.ok(a&&/1 victoire/.test(a.textContent)&&/1 défaite/.test(a.textContent)&&/1 planète gagnée/.test(a.textContent),'bilan des combats et conquêtes');
document.querySelector('[data-act="awayx"]').click();await sleep(30);T.ok(!document.querySelector('.away'),'OK : le résumé se ferme');
S.awayFrom=now-30*60e3;S.awayDone=false;render();T.ok(!document.querySelector('.away'),'pas de résumé après une courte absence (< 2 h)');
S.tab='log';S.logTab='other';render();const g=[...document.querySelectorAll('.rep')].find(x=>/plein espace/.test(x.textContent));
S.logTab='combat';render();const g2=[...document.querySelectorAll('.rep')].find(x=>/plein espace/.test(x.textContent));const G=g||g2;
T.ok(G&&/×4/.test(G.textContent)&&G.querySelector('details'),'les 4 interceptions regroupées en une entrée (×4)');
