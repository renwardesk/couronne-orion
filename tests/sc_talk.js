// Les Seigneurs lisent l'onglet Univers et répondent ; les provocations créent une rancune
await T.tick(2);await sleep(50);
const add=(id,text,ago)=>db.collection('chat').doc(id).set({kind:'chat',ch:'u',uid:'u1',name:'ren',text,at:Date.now()-ago});
const R=id=>(S.chat||[]).find(x=>x.id==='u-r-'+id);
await add('m1','Kael tu es vraiment nul',200e3);await add('m2','on fait quoi ce soir',200e3);await add('m3','Draxen, on arrive !',200e3);await add('m4','Ysmera ?',5e3);await sleep(30);
await botTalkTick(Date.now());await sleep(60);
T.ok(R('m1')&&R('m1').uid==='orion-1'&&R('m1').re==='u1','« Kael … nul » → Kael répond');T.L('   «',R('m1')&&R('m1').text,'»');
T.ok(!R('m2'),'message sans lien avec les Seigneurs → pas de réponse');
T.ok(R('m3')&&R('m3').uid==='orion-3'&&TALK_LINES['orion-3'].threat.some(l=>l.replace(/\{p\}/g,'ren')===R('m3').text),'menace à Draxen → réplique de menace');T.L('   «',R('m3')&&R('m3').text,'»');
T.ok(!R('m4'),'réponse différée (1 à 3 min), pas instantanée');
const n0=(S.chat||[]).length;await botTalkTick(Date.now());await sleep(40);T.ok((S.chat||[]).length===n0,'pas de double réponse');
T.ok((grudgeOf('orion-1').u1||{}).n===1,'une insulte = 1 point de rancune');
for(const i of [1,2,3]){await add('y'+i,'Ysmera tu es minable '+i,(200-i)*1e3);await sleep(20);await botTalkTick(Date.now());await sleep(40);for(const x of S.chat)if(x.uid==='orion-2')x.at-=11*60e3}
T.ok((grudgeOf('orion-2').u1||{}).n===3,'3 provocations = rancune 3');T.ok(R('y3')&&TALK_LINES['orion-2'].grudge.some(l=>l.replace(/\{p\}/g,'ren')===R('y3').text),'3e provocation : « tu es sur ma liste »');T.L('   «',R('y3')&&R('y3').text,'»');
await add('g1','Les seigneurs vont tomber',200e3);await sleep(20);await botTalkTick(Date.now());await sleep(40);T.ok(R('g1')&&isBot(R('g1').uid),'« les seigneurs » sans nom → un seigneur répond');
for(const x of S.chat)if(isBot(x.uid))x.at-=4*60e3;await add('p1','bonjour Ysmera',200e3);await sleep(20);await botTalkTick(Date.now());await sleep(40);T.ok(R('p1')&&R('p1').uid==='orion-2','salutation → réponse');
T.ok(talkParse('J’ai pas peur de toi Kael').kind==='fear'&&talkParse('mdr Draxen').kind==='laugh'&&talkParse('Paix, Kael').kind==='peace','détection des intentions');
