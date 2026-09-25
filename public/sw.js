const CACHE='rums-plaza-v1';
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['/'])));});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('/'))));
});
self.addEventListener('push',event=>{
  let data={};try{data=event.data?event.data.json():{};}catch{data={body:event.data?.text()||'New activity on RUMS Plaza'};}
  event.waitUntil(self.registration.showNotification(data.title||'RUMS Plaza',{body:data.body||'You have new activity.',tag:data.tag||undefined,data:{url:data.url||'/'}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{const target=event.notification.data?.url||'/';const existing=list.find(c=>c.url.includes(self.location.origin));if(existing){existing.focus();existing.navigate(target);return;}return clients.openWindow(target);}));
});
