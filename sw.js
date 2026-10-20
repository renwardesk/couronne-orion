// Service worker : réseau d'abord, sans passer par le cache HTTP du navigateur (les mises à jour arrivent tout de suite), cache en secours hors connexion.
const CACHE='orion-v179';
const SHELL=['./','./index.html','./manifest.webmanifest','./supabase-config.js','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.endsWith('version.json'))return;
  e.respondWith(fetch(e.request.url,{cache:'no-cache',credentials:'same-origin'}).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
// Notifications d'attaque envoyées par Supabase, même appli fermée
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data&&e.data.text()}}
  e.waitUntil(Promise.all([self.registration.showNotification(d.title||'Couronne d’Orion',{body:d.body||'',tag:d.tag||'orion',icon:'icons/icon-192.png',badge:'icons/icon-192.png',data:{url:'./'}}),
    self.navigator&&self.navigator.setAppBadge?self.navigator.setAppBadge(1).catch(()=>{}):Promise.resolve()]))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus'in c)return c.focus()}return self.clients.openWindow('./')}))});
