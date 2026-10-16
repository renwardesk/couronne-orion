// Service worker : réseau d'abord, sans passer par le cache HTTP du navigateur (les mises à jour arrivent tout de suite), cache en secours hors connexion.
const CACHE='orion-v15';
const SHELL=['./','./index.html','./manifest.webmanifest','./supabase-config.js','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.endsWith('version.json'))return;
  e.respondWith(fetch(e.request.url,{cache:'no-cache',credentials:'same-origin'}).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
