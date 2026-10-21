const P1=window.__P1;S.tab='yard';S.sel=P1;render();
const r=document.querySelector('[data-qr="y"][data-t="fighter"]');T.ok(!!r,'jauge présente au chantier');
r.value=Math.floor(+r.max/2);r.dispatchEvent(new Event('input',{bubbles:true}));T.ok(S.qty.fighter===Math.floor(+r.max/2),'la jauge règle la quantité ('+S.qty.fighter+')');
T.ok(+document.querySelector('[data-qin="y"][data-t="fighter"]').value===S.qty.fighter,'la case chiffrée suit la jauge');
T.ok(+r.max===maxBuild(view(P1),'fighter'),'le bout de la jauge = le maximum constructible');
const tg=Object.keys(PLANETS).find(p=>!PLANETS[p].deep&&!PLANETS[p].raid&&!PLANETS[p].sig&&!PLANETS[p].comet&&!S.planets[p]&&galOf(p)===0&&worth(view(p).garrison||{})>0);
for(const mis of ['attack','rally','spy','reinforce']){openSend(mis==='reinforce'?P1:tg,mis);if(mis==='reinforce'){S.modal.mission='attack'}renderModal();const m=[...document.querySelectorAll('[data-qr="m"]')];T.ok(m.length>0,'jauges dans la fenêtre d’envoi ('+mis+') : '+m.length);
 const c=m[0];c.value=c.max;c.dispatchEvent(new Event('input',{bubbles:true}));c.dispatchEvent(new Event('change',{bubbles:true}));T.ok(S.modal.ships[c.dataset.t]===+c.max&&+c.max===view(S.modal.from).ships[c.dataset.t],'jauge au bout = tout le stock ('+c.dataset.t+' '+c.max+')');S.modal=null;renderModal()}
// Empire : pourcentage du maximum de chaque planète + bouton Max
{const z=Object.keys(PLANETS).filter(p=>!PLANETS[p].deep&&!PLANETS[p].raid&&!PLANETS[p].sig&&!PLANETS[p].comet&&!S.planets[p]&&!isBody(p)&&galOf(p)===0).slice(5,7);
 z.forEach((q,i)=>{const h=homePlanet(q,'u1');h.capital=false;h.lv={...h.lv,yard:4,bay:9};h.res=i?{m:4000,c:1500,f:900}:{m:40000,c:15000,f:9000};h.shipQ=[];S.planets[q]=h});T.sync();
 S.tab='empire';S.empT='fighter';S.empP=50;render();const e=document.querySelector('[data-qr="e"]');T.ok(!!e&&e.max==='100','jauge Empire en pourcentage');
 const pl=empShipPlan().filter(x=>!x.why);T.ok(pl.length>=2,'au moins 2 chantiers prêts');T.L('   50 % :',pl.map(x=>plName(x.pid)+' '+x.n+'/'+x.mx).join(' · '));
 T.ok(pl.every(x=>x.n===Math.max(1,Math.floor(x.mx/2))),'chaque planète produit la moitié de SON maximum');
 e.value=20;e.dispatchEvent(new Event('input',{bubbles:true}));T.ok(document.getElementById('empp').textContent==='20 %','le pourcentage affiché suit la jauge');
 document.querySelector('[data-act="empmax"]').click();await sleep(50);T.ok(S.empP===100,'bouton Max = 100 %');
 const before=empShipPlan().filter(x=>!x.why);await empShipAll();
 const ok=before.every(x=>{const q=S.planets[x.pid];const it=(q.shipQ||[]).slice(-1)[0];return it&&it.n===x.mx});T.ok(ok,'Max : chaque chantier lance son maximum ('+before.map(x=>x.mx).join(', ')+')');
 T.ok(empShipPlan().filter(x=>before.some(b=>b.pid===x.pid&&b.mx<999)).every(x=>x.why),'ensuite plus rien de possible sur ces planètes (ressources ou hangars au bout ; 999 = plafond d’un lot)');
 for(const q of z)delete S.planets[q];S.tab='planet';T.sync()}
