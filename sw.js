/* Network first: the permanent Home Screen URL loads current code whenever online.
 * Bump RELEASE with the HTML/version.json on each release; do not interrupt battles. */
'use strict';
const RELEASE='2026.11.10-audio1',PREFIX='rus-game-',CACHE=PREFIX+RELEASE;
const CORE=['./','./index.html','./style.css','./game-data.js','./unit-renderer.js','./game.js','./pwa.js','./battle-audio.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable.png','./icons/apple-touch-icon.png'];
const SOUNDS=[...Array.from({length:10},(_,i)=>`./audio/sword-${String(i+1).padStart(2,'0')}.mp3`),...Array.from({length:4},(_,i)=>`./audio/cry-${String(i+1).padStart(2,'0')}.mp3`),'./audio/horse-neigh.mp3'];
CORE.push(...SOUNDS);
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(CORE.map(p=>new Request(new URL(p,self.registration.scope),{cache:'reload'})));
 // The first install can activate immediately; updates wait for a safe point in the app.
 if(!self.registration.active)await self.skipWaiting();
})()));
self.addEventListener('message',e=>{if(e.data?.type==='ACTIVATE_UPDATE')e.waitUntil(self.skipWaiting())});
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url),scope=new URL(self.registration.scope);
 if(e.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 if(url.pathname.endsWith('/version.json')){e.respondWith(fetch(new Request(e.request,{cache:'no-store'})));return}
 const relative='./'+url.pathname.slice(scope.pathname.length);
 if(e.request.mode!=='navigate'&&!CORE.includes(relative))return;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE),key=e.request.mode==='navigate'?new URL('index.html',scope).href:new URL(url.pathname,scope.origin).href;
  try{const response=await fetch(new Request(e.request,{cache:'no-store'}));if(!response.ok)throw new Error('HTTP '+response.status);await cache.put(key,response.clone());return response}
  catch{const stored=await cache.match(key);if(stored)return stored;return new Response('Игра пока не сохранена для работы без сети. Подключись к интернету и открой её снова.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
 })());
});
