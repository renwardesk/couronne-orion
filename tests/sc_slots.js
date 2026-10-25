// emplacements de planètes : 15 max, prix doublé à partir du 11e
T.ok(MAXP===20,'plafond 20 planètes');
const c=[9,10,11,12,13,14].map(n=>slotCost(n));T.L('   coûts 10e→15e',c.join(' · '));
T.ok(c[0]===Math.round(300*Math.pow(8,1.6)),'le 10e emplacement garde son ancien prix');
T.ok(Math.abs(c[1]-2*Math.round(300*Math.pow(9,1.6)))<=1,'le 11e coûte le double de la courbe');
S.players.u1.slots=10;S.players.u1.culture=c[1]-1;T.sync();T.toasts.length=0;await unlockSlot();T.ok(slotsOf('u1')===10,'pas assez de culture : refusé');
S.players.u1.culture=c[1]+5;T.sync();await unlockSlot();await sleep(50);T.ok(slotsOf('u1')===11&&Math.round(cultureNow('u1'))===5,'11e emplacement débloqué, culture payée');
S.players.u1.slots=20;S.players.u1.culture=9e9;T.sync();T.toasts.length=0;await unlockSlot();await sleep(50);T.ok(slotsOf('u1')===20&&T.toasts.some(x=>/maximum/.test(x)),'au-delà de 20 : refusé');
T.ok(Math.abs(slotCost(15)-3*Math.round(300*Math.pow(14,1.6)))<=2,'le 16e coûte le triple de la courbe ('+slotCost(15)+')');T.ok(BOT_MAXP===8,'Seigneurs toujours limités à 8 planètes');
S.players.u1.slots=6;S.players.u1.culture=50;T.sync();
