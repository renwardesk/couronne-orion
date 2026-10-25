// Discussions enrichies : sujets, suite de conversation, souvenirs de combat, intervention d'un 2e seigneur, messages spontanés
await T.tick(2);await sleep(50);
const add=(id,text,ago,uid='u1')=>db.collection('chat').doc(id).set({kind:'chat',ch:'u',uid,name:pname(uid),text,at:Date.now()-ago});
const R=id=>(S.chat||[]).find(x=>x.id==='u-r-'+id),K=(t,k)=>talkParse(t).kind===k;
for(const [t,k] of [['Pourquoi vous voulez nous attaquer','why'],['Kael voryn c’est quoi ton problème avec moi','why'],['Ysmera veux tu faire une alliance avec moi','ally'],['Salope va','insult'],['Draxen t’es qui ?','who'],['longue vie à Scorpius','brag'],['On va égorger vos femmes','threat'],['Kael quelle est ta faiblesse','weak']])if(!K(t,k))T.L('   ≠',t,talkParse(t).kind);
T.ok(K('Pourquoi vous voulez nous attaquer','why')&&K('Kael voryn c’est quoi ton problème avec moi','why')&&K('Ysmera veux tu faire une alliance avec moi','ally')&&K('Salope va','insult')&&K('Draxen t’es qui ?','who')&&K('longue vie à Scorpius','brag')&&K('On va égorger vos femmes','threat')&&K('Kael quelle est ta faiblesse','weak'),'intentions des vrais messages reconnues');
await add('a1','Ysmera veux tu faire une alliance avec moi',200e3);await sleep(20);await botTalkTick(Date.now());await sleep(40);
T.ok(R('a1')&&R('a1').uid==='orion-2'&&TALK_LINES['orion-2'].ally.some(l=>l.replace(/\{p\}/g,'ren')===R('a1').text),'alliance → réponse d’alliance');T.L('   «',R('a1')&&R('a1').text,'»');
await add('a2','Pourquoi dis tu ça ?',150e3+30e3);for(const x of S.chat)if(x.id==='u-r-a1')x.at=Date.now()-185e3;await sleep(20);await botTalkTick(Date.now());await sleep(40);
T.ok(R('a2')&&R('a2').uid==='orion-2','suite de conversation sans nommer → même seigneur');T.L('   «',R('a2')&&R('a2').text,'»');
for(const x of S.chat)if(isBot(x.uid))x.at=Date.now()-195e3;await add('a3','Quand mes chasseurs survoleront vos planètes ni vieillard ni nourrissons seront épargnés',190e3,'u2');await sleep(20);await botTalkTick(Date.now());await sleep(40);
T.ok(R('a3')&&isBot(R('a3').uid),'menace adressée à « vos » juste après un seigneur → réponse');T.L('   «',R('a3')&&R('a3').text,'»');
await add('a4','tu viens ce soir pour le rally ?',190e3,'u2');await sleep(20);await botTalkTick(Date.now());await sleep(40);T.ok(!R('a4'),'discussion entre joueurs → pas de réponse');
const pid=botPlanets('orion-3')[0].pid;S.events['nw-x']={kind:'event',id:'nw-x',news:true,at:Date.now()-3600e3,pid,pv:{att:['u1'],def:['orion-3'],win:'def'}};
await add('m1','Draxen tu es nul',190e3);await add('m2','Draxen tu es une larve',190e3);await add('m3','Draxen minable',190e3);await sleep(20);await botTalkTick(Date.now());await sleep(40);
const txt=['m1','m2','m3'].map(R).filter(Boolean).map(x=>x.text);T.L('   «',txt.join(' » « '),'»');T.ok(txt.some(t=>t.includes(uplName(pid))),'souvenir du combat perdu par le joueur cité');T.ok(new Set(txt).size===txt.length,'pas deux fois la même phrase');
const r=R('a1');r.at=Date.now()-70e3;let ban=null;for(let i=0;i<60&&!ban;i++){const id='u-r-zz'+i;await db.collection('chat').doc(id).set({kind:'chat',ch:'u',uid:'orion-1',name:'Kael Voryn',text:'x',at:Date.now()-70e3,re:'u1'});await sleep(5);await botTalkTick(Date.now());await sleep(10);ban=(S.chat||[]).find(x=>x.id==='u-c-zz'+i)}
T.ok(ban&&isBot(ban.uid)&&ban.uid!=='orion-1'&&ban.text.includes('Kael Voryn'),'un autre seigneur s’en mêle parfois');T.L('   «',ban&&ban.text,'»');
for(const x of S.chat)if(isBot(x.uid))x.at-=5*HR;const n0=(S.chat||[]).filter(x=>x.id.startsWith('u-i-')).length;T.setNow&&0;
const t0=Date.now();Date.now=(()=>{const f=Date.now.bind(Date);return()=>f()+11*3600e3})();await botTalkTick(Date.now());await sleep(40);
const I=(S.chat||[]).filter(x=>x.id.startsWith('u-i-'));T.ok(I.length>n0,'messages spontanés des seigneurs');T.L('   «',I.map(x=>x.text).join(' » « '),'»');
