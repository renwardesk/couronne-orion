// Discussions des Seigneurs (v3) : regroupement, rythme, cohérence, relations, surnoms, mémoire, disputes, chapitres
await T.tick(2);await sleep(50);
const add=(id,text,ago,uid='u1')=>db.collection('chat').doc(id).set({kind:'chat',ch:'u',uid,name:pname(uid),text,at:Date.now()-ago});
const R=id=>(S.chat||[]).find(x=>x.id==='u-r-'+id),L=()=>(S.chat||[]).filter(x=>isBot(x.uid)||x.uid==='vorgath'),age=ms=>{for(const x of S.chat)x.at-=ms};
const run=async(n=4)=>{for(let i=0;i<n;i++){await botTalkTick(Date.now());await sleep(25);age(16e3)}};
const K=t=>talkParse(t).kind;
for(const [t,k] of [['Kael le vaurien ne m’adresse pas la parole je ne traite pas avec les lâches','insult'],['Wlh j’suis dsl','sorry'],['Bon chien ysmera','insult'],['Ysmera la pale a peur ? Tu portes bien ton nom tu es tout pale face à ma grandeur','fear'],['Voila écoute ton maitre','brag'],['Pourquoi vous voulez nous attaquer','why'],['Ysmera veux tu faire une alliance avec moi','ally'],['Draxen tu veux quoi au final ?','want'],['Kael combien de vaisseaux tu as ?','count'],['bonne nuit les seigneurs','bye'],['Draxen je me rends','surrender'],['Ahahahhahahaha','laugh']])T.ok(K(t)===k,`« ${t} » → ${k}${K(t)!==k?' (obtenu '+K(t)+')':''}`);
T.ok(talkParse('On rigole frérot').team&&talkParse('Mdrrr On rigolait').team,'blagues entre joueurs reconnues');
// 1. trois messages d'affilée → une seule réponse
await add('b1','Voila écoute ton maitre',50e3,'u2');await add('b2','Bon chien ysmera',45e3,'u2');await add('b3','Ysmera la pale a peur ? tu es tout pale face à ma grandeur',30e3,'u2');await sleep(20);await run(3);
const rb=L().filter(x=>x.re==='u2');T.ok(rb.length===1&&rb[0].uid==='orion-2'&&rb[0].id==='u-r-b3','3 messages d’affilée → 1 seule réponse d’Ysmera, au dernier');T.L('   «',rb[0]&&rb[0].text,'»');
// 2. les joueurs plaisantent entre eux juste après → silence
await add('j1','Mdrrr On rigolait',40e3,'u1');await add('j2','On rigole frérot',35e3,'u2');await add('j3','T’es la tu prends à coeur les choses',30e3,'u2');await sleep(20);await run(3);
T.ok(L().filter(x=>/^u-r-j/.test(x.id)).length===0,'blagues entre joueurs → aucun seigneur ne répond');
// 3. suite de conversation : excuse après une réponse de Kael
await add('k1','Kael t’es un vaurien',60e3,'u3');await sleep(20);await run(2);T.ok(R('k1')&&R('k1').uid==='orion-1','Kael répond à l’insulte');
await add('k2','Wlh j’suis dsl',30e3,'u3');await sleep(20);await run(2);T.ok(R('k2')&&R('k2').uid==='orion-1'&&TALK_LINES['orion-1'].sorry.some(l=>R('k2').text.startsWith(l.split('{')[0].slice(0,15))),'excuse sans le nommer → Kael accepte/refuse les excuses');T.L('   «',R('k2')&&R('k2').text,'»');
// 4. rythme : deux joueurs en même temps → réponses espacées
await add('p1','Draxen viens te battre',40e3,'u1');await add('p2','Kael tu es une larve',40e3,'u2');await sleep(20);await botTalkTick(Date.now());await sleep(20);await botTalkTick(Date.now());await sleep(20);
T.ok([R('p1'),R('p2')].filter(Boolean).length===1,'jamais deux seigneurs dans la même seconde');await run(2);T.ok(R('p1')&&R('p2'),'… le second répond juste après');
// 5. délai de frappe et messages trop vieux
await add('t1','Draxen ?',3e3,'u1');await add('t2','Kael ?',5*60e3,'u2');await sleep(20);await botTalkTick(Date.now());await sleep(20);T.ok(!R('t1')&&!R('t2'),'pas de réponse instantanée ni aux vieux messages');
// 6. écho : message libre
await add('e1','Ysmera ton armada ressemble à une collection de casseroles rouillées',40e3,'u3');await sleep(20);await run(2);T.ok(R('e1')&&/«|»|casseroles|collection|rouillées|armada/.test(R('e1').text),'message libre → réponse qui reprend un mot');T.L('   «',R('e1')&&R('e1').text,'»');
// 7. relations, surnom, carte
age(5*60e3);for(let i=0;i<4;i++){await add('i'+i,'Ysmera tu es une ordure '+i,40e3,'u1');await sleep(20);await run(2);age(5*60e3)}
T.ok(relOf('orion-2','u1').v<=-20&&relStance('orion-2','u1')!=='neutre','insultes → la relation se dégrade ('+relOf('orion-2','u1').v+', '+relStance('orion-2','u1')+')');
T.ok(relOf('orion-2','u1').nick==='Langue de vipère','4 insultes → surnom « Langue de vipère »');
const q=((S.events['orion-talkq']||{}).q||[]);for(const i of q)i.at=Date.now()-1;await run(2);T.ok((S.chat||[]).some(x=>x.uid==='orion-2'&&x.text.includes('Langue de vipère')),'le surnom est annoncé dans l’Univers');
S.tab='players';render();await sleep(30);T.ok(document.querySelector('.relrow')&&/Langue de vipère/.test(document.body.innerHTML),'carte « Ce que les Seigneurs pensent de toi »');
// 8. combats → mémoire, surnom de victoire, dispute
const bp=botPlanets('orion-1')[0].pid;for(const x of S.chat)x.at-=30*60e3;
await univBattle({title:'x',loser:'orion-1',battle:{pid:bp,def:'orion-1',att:[{uid:'u2'}],planet:true}});await sleep(40);
T.ok((relOf('orion-1','u2').mem||[]).some(m=>m.k==='pw')&&/^Tempête de /.test(relOf('orion-1','u2').nick||''),'victoire contre Kael → souvenir et surnom « '+relOf('orion-1','u2').nick+' »');
const dq=((S.events['orion-talkq']||{}).q||[]).filter(i=>i.id.startsWith('u-d-'));T.L('   dispute programmée :',dq.length,'messages');
T.ok(sagaOf().flags&&sagaOf().flags.blood,'premier sang noté pour l’histoire');
// 9. chapitres
await sagaTick(Date.now());await sleep(40);T.ok(sagaOf().ch===1&&(S.chat||[]).some(x=>x.uid==='vorgath'&&/Chapitre I /.test(x.text)),'chapitre I : l’Empereur parle');T.ok(S.reports.some(r=>/Chapitre I de l’histoire/.test(r.title||'')),'notif du chapitre à tous');
for(const i of ((S.events['orion-talkq']||{}).q||[]))i.at=Date.now()-1;await run(2);T.ok(BOTS.every(b=>(S.chat||[]).some(x=>x.id==='u-s-1-'+b.uid)),'les trois seigneurs réagissent au chapitre');
const dd=(S.chat||[]).filter(x=>x.id.startsWith('u-d-'));T.ok(dd.length>=2,'les seigneurs se disputent ('+dd.length+' messages)');T.L('   ',dd.map(x=>pname(x.uid)+' : '+x.text).join(' | '));
await sagaTick(Date.now());T.ok(sagaOf().ch===1,'pas de chapitre suivant sans condition');
S.chat.push({id:'mx',ch:'u',uid:'u3',text:'x',at:Date.now()});const mm=relOf('orion-1','u2').mem;mm[0].at-=3*864e5;T.ok((talkMemory('orion-1','u2',Date.now())||{}).old,'souvenir ancien (plusieurs jours)');
