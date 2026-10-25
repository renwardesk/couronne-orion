// banc d'essai : base simulée en mémoire + horloge avançable, chargé dans la page du jeu
(()=>{const _dn=Date.now.bind(Date);let OFF=0;Date.now=()=>_dn()+OFF;
const T=window.T={log:[],fails:0,toasts:[],STORE:new Map()};
const L=(...a)=>T.log.push(a.join(' '));T.L=L;
T.ok=(c,msg)=>{if(c)L('  ✔ '+msg);else{T.fails++;L('  ✘ '+msg)}};
toast=(m)=>{T.toasts.push(m)};window.confirm=()=>true;window.alert=()=>{};
const ST=T.STORE,cp=x=>x==null?x:JSON.parse(JSON.stringify(x));
const mirror=(path,d)=>{const [c,id]=path.split('/');const tgt={fleets:S.fleets,planets:S.planets,players:S.players,events:S.events}[c];if(tgt){if(d)tgt[id]=cp(d);else delete tgt[id]}if(c==='reports'&&d)S.reports.unshift({id,...cp(d)});if(c==='chat'){S.chat=(S.chat||[]).filter(m=>m.id!==id);if(d)S.chat.push({id,...cp(d)});S.chat.sort((a,b)=>a.at-b.at);try{chatUpdate()}catch(e){}}};
const LEASE=new Map();
const ref=path=>({id:path.split('/').pop(),path,async get(){await sleep(1);const d=ST.get(path);return{exists:!!d,data:()=>cp(d)}},async set(d){suspGuard&&0;await sleep(1);ST.set(path,cp(d));mirror(path,d)},async delete(){await sleep(1);ST.delete(path);mirror(path,null)},async update(d){const c=ST.get(path)||{};await this.set({...c,...d})},
  async acquire({holder,ttlMs}){const l=LEASE.get(path),n=Date.now();if(l&&l.h!==holder&&l.exp>n)return{acquired:false};LEASE.set(path,{h:holder,exp:n+ttlMs});return{acquired:true}},collection:p=>colr(path+'/'+p),onSnapshot(){return()=>{}}});
const colr=c=>({doc:id=>ref(c+'/'+(id||newId())),add:async d=>{const r=ref(c+'/'+newId());await r.set(d);return r},where:()=>colr(c),orderBy:()=>colr(c),limit:()=>colr(c),async get(){const docs=[...ST.entries()].filter(([p])=>p.startsWith(c+'/')).map(([p,d])=>({id:p.split('/').pop(),exists:true,data:()=>cp(d)}));return{docs,size:docs.length,empty:!docs.length}},onSnapshot(){return()=>{}}});
db={doc:ref,collection:colr};
T.adv=ms=>{OFF+=ms};
T.sync=()=>{for(const[k,v]of Object.entries(S.planets))ST.set('planets/'+k,cp(v));for(const[k,v]of Object.entries(S.players))ST.set('players/'+k,cp({kind:'player',...v}));for(const[k,v]of Object.entries(S.fleets))ST.set('fleets/'+k,cp(v));for(const[k,v]of Object.entries(S.events))if(v&&v.kind)ST.set('events/'+k,cp(v))};
T.tick=async(n=3)=>{for(let i=0;i<n;i++){await resolveDue()}};
T.send=async(o)=>{S.modal={from:o.from,to:o.to,mission:o.mission,ships:{...zeroShips(),...o.ships},cmd:o.cmd||null,...(o.extra||{})};S.launching=false;T.toasts=[];await launch();const t=T.toasts.filter(m=>!/^Flotte lancée|^Ralliement ouvert|^Soutien|en route|lancée\.|envoyée/.test(m));return t};
T.fleetsOf=u=>Object.values(S.fleets).filter(f=>f.owner===u);
T.totShips=u=>{const t={};for(const p of Object.values(S.planets))if(p.owner===u)for(const k in p.ships||{})t[k]=(t[k]||0)+(p.ships[k]||0);for(const f of Object.values(S.fleets))if(f.owner===u)for(const k in f.ships||{})if(k!=='flag')t[k]=(t[k]||0)+(f.ships[k]||0);return t};
T.lastRep=(u,re)=>S.reports.find(r=>(r.to||[]).includes(u)&&(!re||re.test(r.title||'')));
T.battleEnd=async()=>{for(let i=0;i<400;i++){const live=Object.values(S.events).filter(e=>e&&e.battle&&!e.done);if(!live.length)return i;for(const e of live){const s=ST.get('events/'+e.id);if(s){s.next=Date.now()-1;ST.set('events/'+e.id,s);S.events[e.id]=cp(s)}}T.adv(5000);await battleTicks()}return -1};
T.runToEnd=async(maxH=48)=>{for(let h=0;h<maxH*6;h++){const live=Object.values(S.fleets).some(f=>f.owner!==NPC&&['out','back','rally','rwait'].includes(f.phase));const bt=Object.values(S.events).some(e=>e&&e.battle&&!e.done);if(!live&&!bt)return h;T.adv(10*60e3);for(const e of Object.values(S.events))if(e&&e.battle&&!e.done){const s=ST.get('events/'+e.id);if(s){s.next=Date.now()-1;ST.set('events/'+e.id,s);S.events[e.id]=cp(s)}}await T.tick(2)}return -1};
})();
