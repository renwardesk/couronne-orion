// node run.js scenario1 scenario2 ...
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const names=process.argv.slice(2);let tot=0;
for(const n of names){const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push('PAGEERR '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load|ERR_FAILED|net::/.test(m.text()))errs.push('CON '+m.text().slice(0,200))});
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('three.min.js'))return r.fulfill({body:fs.readFileSync(process.env.THREE_JS||__dirname+'/three.min.js'),contentType:'text/javascript'});if(u.startsWith('http://localhost'))return r.continue();return r.abort()});
 await pg.goto('http://localhost:8777/index.html');await pg.waitForTimeout(1200);
 await pg.evaluate(fs.readFileSync(__dirname+'/setup.js','utf8'));await pg.evaluate(fs.readFileSync(__dirname+'/harness.js','utf8'));
 await pg.evaluate(()=>{S.got={f:1,e:1,p:1,pl:1};S.players.u1.kind='player';S.players.u2={...S.players.u2,kind:'player',rare:{ir:500,xe:300,am:0},cmds:[]};S.players.u3={kind:'player',uid:'u3',name:'Scorpius',color:'#e8a33a',seen:Date.now()-1e6,rare:{ir:0,xe:0,am:0},cmds:[]};S.planets[window.__P1].shipQ=[];S.planets[window.__P1].lv.bay=12;T.sync()});
 const code=fs.readFileSync(__dirname+'/sc_'+n+'.js','utf8');
 let out;try{out=await pg.evaluate(`(async()=>{T.L('### ${n}');try{${code}}catch(e){T.fails++;T.L('  ✘ EXCEPTION '+(e&&e.stack||e).toString().slice(0,400))}return {log:T.log.join('\\n'),fails:T.fails}})()`)}catch(e){out={log:'### '+n+' CRASH '+e.message,fails:1}}if(!out)out={log:'### '+n+' : page rechargée pendant le test (résultat perdu)',fails:1};
 console.log(out.log);if(errs.length)console.log('  erreurs page : '+errs.slice(0,5).join(' | '));tot+=out.fails+(errs.length?1:0);await pg.close()}
console.log('\nÉCHECS : '+tot);await b.close()})();
