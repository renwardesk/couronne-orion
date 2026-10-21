const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const pg=await b.newPage({viewport:{width:360,height:740},hasTouch:true,isMobile:true});const errs=[];
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.goto('http://localhost:8777/index.html');await pg.waitForTimeout(1200);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));await pg.evaluate(fs.readFileSync(__dirname+'/harness.js','utf8'));
 const r=await pg.evaluate(async()=>{const o=[];const ok=(c,m)=>o.push((c?'✔ ':'✘ ')+m);S.got={f:1,e:1,p:1,pl:1};const P1=window.__P1;S.planets[P1].shipQ=[];S.planets[P1].lv.bay=12;T.sync();const tu=document.getElementById('tut');if(tu)tu.innerHTML='';
  // chantier sans ressources : jauge désactivée
  const p=S.planets[P1];const r0={...p.res};p.res={m:0,c:0,f:0};T.sync();S.tab='yard';S.sel=P1;render();const q=document.querySelector('[data-qr="y"][data-t="fighter"]');ok(q&&q.disabled,'sans ressources : jauge grisée');p.res=r0;T.sync();render();
  // pas de rafraîchissement pendant le glissement
  const g=document.querySelector('[data-qr="y"][data-t="fighter"]');g.focus();g.value=5;g.dispatchEvent(new Event('input',{bubbles:true}));render();ok(document.querySelector('[data-qr="y"][data-t="fighter"]')===g,'pendant le glissement, l’écran ne se redessine pas sous le doigt');g.dispatchEvent(new Event('change',{bubbles:true}));ok(document.activeElement!==g,'au relâcher, la jauge rend la main (le rafraîchissement reprend)');ok(S.qty.fighter===5,'quantité 5 gardée');
  // fenêtre : changement de mission avec une valeur trop haute
  const tg=Object.keys(PLANETS).find(x=>!PLANETS[x].deep&&!PLANETS[x].raid&&!PLANETS[x].sig&&!PLANETS[x].comet&&!S.planets[x]&&galOf(x)===0&&worth(view(x).garrison||{})>0);openSend(tg,'attack');
  const m=document.querySelector('[data-qr="m"][data-t="fighter"]');m.value=m.max;m.dispatchEvent(new Event('input',{bubbles:true}));m.dispatchEvent(new Event('change',{bubbles:true}));
  S.modal.mission='spy';renderModal();ok(!document.querySelector('[data-qr="m"][data-t="fighter"]'),'en espionnage, pas de jauge pour les chasseurs (non utilisables)');
  S.modal.mission='attack';renderModal();const m2=document.querySelector('[data-qr="m"][data-t="fighter"]');ok(+m2.value===S.modal.ships.fighter,'la jauge reflète la valeur gardée');
  // case chiffrée -> jauge
  const box=document.querySelector('[data-qin="m"][data-t="cruiser"]');box.value=7;box.dispatchEvent(new Event('change',{bubbles:true}));await sleep(400);ok(+document.querySelector('[data-qr="m"][data-t="cruiser"]').value===7,'taper un chiffre déplace la jauge');
  // envoi réel avec valeur de jauge
  const mg=document.querySelector('[data-act="mgo"]');mg.click();await sleep(600);ok(Object.values(S.fleets).some(f=>f.owner==='u1'&&f.to===tg&&f.ships.cruiser===7),'flotte partie avec les valeurs choisies');
  // flotte en position (FLT) : pas de jauge
  return o});
 console.log(r.join('\n'));
 // vrai glissement au doigt (souris) sur la jauge du chantier
 await pg.evaluate(()=>{S.tab='yard';render()});const el=await pg.$('[data-qr="y"][data-t="cruiser"]');await el.scrollIntoViewIfNeeded();const bb=await el.boundingBox();
 await pg.mouse.move(bb.x+10,bb.y+bb.height/2);await pg.mouse.down();for(let i=1;i<=10;i++)await pg.mouse.move(bb.x+10+i*(bb.width*.8-10)/10,bb.y+bb.height/2);await pg.mouse.up();await pg.waitForTimeout(400);
 console.log(await pg.evaluate(()=>{const g=document.querySelector('[data-qr="y"][data-t="cruiser"]');return `glissement : qty ${S.qty.cruiser} / max ${g.max} · case ${document.querySelector('[data-qin="y"][data-t="cruiser"]').value}`}));
 console.log(errs.length?'ERREURS '+errs.join(' | '):'aucune erreur JS');await b.close()})();
