// 指針帳 service worker: offline cache + daily reminder
const CACHE='shishincho-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=='shishincho-meta').map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
    if(res.ok&&new URL(e.request.url).origin===location.origin){const cp=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}
    return res;}).catch(()=>caches.match('./index.html'))));
});
const pad=n=>String(n).padStart(2,'0');
const todayKey=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};
async function maybeRemind(){
  const c=await caches.open('shishincho-meta');const r=await c.match('/__meta');if(!r)return;
  const m=await r.json();if(!m.on)return;
  const t=todayKey();if(m.done===t||m.notified===t)return;
  const [h,mi]=(m.time||'21:00').split(':').map(Number);const now=new Date();
  if(now.getHours()*60+now.getMinutes()<h*60+mi)return;
  await self.registration.showNotification(m.title,{body:m.body,icon:'icon-192.png',badge:'icon-192.png',tag:'daily'});
  m.notified=t;await c.put('/__meta',new Response(JSON.stringify(m),{headers:{'Content-Type':'application/json'}}));
}
self.addEventListener('periodicsync',e=>{if(e.tag==='daily-reminder')e.waitUntil(maybeRemind());});
// Server push (optional): send any payload and the app shows today's reminder.
self.addEventListener('push',e=>{e.waitUntil(maybeRemind());});
self.addEventListener('notificationclick',e=>{e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window'}).then(ws=>{for(const w of ws){if('focus' in w)return w.focus();}return self.clients.openWindow('./');}));});
