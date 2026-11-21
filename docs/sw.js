// 指針帳 service worker: offline cache + daily reminder
const VERSION='7f624285e4';            // replaced by build.py on every build, so each release installs a new worker
const CACHE='shishincho-'+VERSION;
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=='shishincho-meta').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url); if(url.origin!==location.origin)return;
  const isPage=req.mode==='navigate'||url.pathname.endsWith('.html')||url.pathname.endsWith('/');
  if(isPage){ // network first: always show the newest version when online
    e.respondWith(fetch(req,{cache:'no-store'}).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));}return res;})
      .catch(()=>caches.match('./index.html')));
    return;}
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return res;})));
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
