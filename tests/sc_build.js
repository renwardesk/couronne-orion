const P1=window.__P1,me='u1';const p0=settle(S.planets[P1],Date.now());p0.bq=[];p0.res={m:200000,c:200000,f:200000};p0.lv.store=12;S.planets[P1]=p0;T.sync();
const L0=p0.lv.mine,c=bCost('mine',L0);T.L('mine',L0,'→',L0+1,'coût',JSON.stringify(c),'rare',JSON.stringify(bRare('mine',L0)));
S.players[me].rare={ir:5000,xe:5000,am:500};T.sync();
await upgrade(P1,'mine');T.ok(!T.toasts.filter(t=>!/lanc|ajout|construction/i.test(t)).length,'construction lancée '+T.toasts.join('|'));
let p=settle(S.planets[P1],Date.now());T.ok(p.bq.length===1&&p.bq[0].paid&&p.bq[0].paid.m===c.m,'file : 1 chantier, coût payé mémorisé');
T.ok(Math.abs((200000-p.res.m)-c.m)<5,'métal débité = coût ('+Math.round(200000-p.res.m)+' / '+c.m+')');
// 2e niveau en file puis annulation du 2e
await upgrade(P1,'mine');p=settle(S.planets[P1],Date.now());const c2=bCost('mine',L0+1);T.ok(p.bq.length===2&&p.bq[1].paid.m===c2.m,'2e niveau en file au coût du niveau suivant');
const before=p.res.m;await cancelBuild(P1,1);p=settle(S.planets[P1],Date.now());T.ok(Math.abs(p.res.m-before-c2.m)<5,'annulation : remboursé '+Math.round(p.res.m-before)+' / '+c2.m);
// ancien chantier sans "paid" -> remboursé à l'ancien barème
p.bq.push({k:'crys',start:p.bq[0].until,until:p.bq[0].until+5000});S.planets[P1]=p;T.sync();const b2=settle(S.planets[P1],Date.now()).res.c;await cancelBuild(P1,1);p=settle(S.planets[P1],Date.now());
T.ok(Math.abs(p.res.c-b2-bCostOld('crys',p.lv.crys).c)<5,'ancien chantier : remboursé au prix d’avant ('+Math.round(p.res.c-b2)+')');
// fin du chantier
T.adv(p.bq[0].until-Date.now()+2000);await T.tick(1);p=settle(S.planets[P1],Date.now());T.ok(p.lv.mine===L0+1&&!p.bq.length,'niveau atteint : mine '+p.lv.mine);
// production horaire et plafond
const r=rates(p);const cap=capOf(p);const m0=p.res.m;T.adv(3600e3);p=settle(S.planets[P1],Date.now());T.ok(Math.abs(p.res.m-Math.min(cap,m0+r.m*60))<r.m+2,'production 1 h : +'+Math.round(p.res.m-m0)+' (attendu '+Math.round(r.m*60)+')');
p.res.m=cap-10;S.planets[P1]=p;T.sync();T.adv(3600e3);p=settle(S.planets[P1],Date.now());T.ok(p.res.m<=cap+1,'plafond des entrepôts respecté ('+Math.round(p.res.m)+' / '+cap+')');
// chantier naval
const fb=p.ships.fighter;await buildShips(P1,'fighter',10);p=settle(S.planets[P1],Date.now());T.ok((p.shipQ||[]).length===1,'production de 10 chasseurs en file');
T.adv(3*3600e3);p=settle(S.planets[P1],Date.now());T.ok(p.ships.fighter===fb+10,'10 chasseurs livrés ('+(p.ships.fighter-fb)+')');
T.L('   toasts:',T.toasts.join(' | '),' bay',bayUse(view(P1),me),'/',bayCap(S.planets[P1]));
