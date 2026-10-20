// chaque onglet s'affiche sans erreur
const tabs=[...new Set([...document.querySelectorAll('[data-act="tab"]')].map(b=>b.dataset.t))];T.L('onglets',tabs.join(','));
for(const t of tabs){try{S.tab=t;render();T.ok(document.body.innerText.length>50,'onglet '+t)}catch(e){T.ok(false,'onglet '+t+' : '+e.message)}}
for(const lt of ['combat','rally','spy','other']){S.tab='log';S.logTab=lt;try{render();T.ok(true,'journal '+lt)}catch(e){T.ok(false,'journal '+lt+' '+e.message)}}
for(const nt of ['conquest','battle']){S.tab='news';S.newsTab=nt;try{render();T.ok(true,'actus '+nt)}catch(e){T.ok(false,'actus '+nt)}}
// fenêtre d'envoi pour chaque type de cible
const P1=window.__P1;const cibles={pirates:Object.keys(PLANETS).find(p=>!PLANETS[p].deep&&galOf(p)===0&&!S.planets[p]&&!isBody(p)&&!PLANETS[p].raid&&!PLANETS[p].comet&&!PLANETS[p].sig),satellite:Object.keys(PLANETS).find(p=>isBody(p)&&!PLANETS[p].deep&&!S.planets[p]),epave:Object.keys(PLANETS).find(p=>PLANETS[p].type==='wreck'),raid:Object.keys(RAIDS).find(k=>RAIDS[k].gal===0),comete:Object.keys(PLANETS).find(p=>PLANETS[p].comet),propre:myPlanets().map(p=>p.pid).find(p=>p!==P1)};
S.tab='planet';render();for(const[k,pid]of Object.entries(cibles)){if(!pid){T.L('   (pas de cible '+k+')');continue}try{openSend(pid);S.modal.ships.fighter=5;renderModal();T.ok(!!document.querySelector('[data-act="mgo"]'),'fenêtre d’envoi : '+k);S.modal=null;renderModal()}catch(e){T.ok(false,'fenêtre '+k+' : '+e.message)}}
