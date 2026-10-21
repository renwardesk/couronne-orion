const P1=window.__P1;S.tab='yard';S.sel=P1;render();
const r=document.querySelector('[data-qr="y"][data-t="fighter"]');T.ok(!!r,'jauge présente au chantier');
r.value=Math.floor(+r.max/2);r.dispatchEvent(new Event('input',{bubbles:true}));T.ok(S.qty.fighter===Math.floor(+r.max/2),'la jauge règle la quantité ('+S.qty.fighter+')');
T.ok(+document.querySelector('[data-qin="y"][data-t="fighter"]').value===S.qty.fighter,'la case chiffrée suit la jauge');
T.ok(+r.max===maxBuild(view(P1),'fighter'),'le bout de la jauge = le maximum constructible');
const tg=Object.keys(PLANETS).find(p=>!PLANETS[p].deep&&!PLANETS[p].raid&&!PLANETS[p].sig&&!PLANETS[p].comet&&!S.planets[p]&&galOf(p)===0&&worth(view(p).garrison||{})>0);
for(const mis of ['attack','rally','spy','reinforce']){openSend(mis==='reinforce'?P1:tg,mis);if(mis==='reinforce'){S.modal.mission='attack'}renderModal();const m=[...document.querySelectorAll('[data-qr="m"]')];T.ok(m.length>0,'jauges dans la fenêtre d’envoi ('+mis+') : '+m.length);
 const c=m[0];c.value=c.max;c.dispatchEvent(new Event('input',{bubbles:true}));c.dispatchEvent(new Event('change',{bubbles:true}));T.ok(S.modal.ships[c.dataset.t]===+c.max&&+c.max===view(S.modal.from).ships[c.dataset.t],'jauge au bout = tout le stock ('+c.dataset.t+' '+c.max+')');S.modal=null;renderModal()}
