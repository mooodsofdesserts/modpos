self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('message', e => {
  if (e.data?.type === 'NOTIFY') {
    self.registration.showNotification(e.data.title || 'MOD POS', {
      body: e.data.body || '',
      icon: '/modpos/icon.svg',
      badge: '/modpos/icon.svg',
      tag: e.data.tag || 'modpos',
      renotify: true,
      requireInteraction: false,
    });
  }
  if (e.data?.type === 'SCHEDULE_REMINDER') {
    // Store pending task info in case SW needs to show reminder
    self._pendingTasks = e.data.tasks || [];
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(cs => {
      const c = cs.find(w => w.url.includes('/modpos/'));
      if (c) { c.focus(); return; }
      return clients.openWindow('/modpos/');
    })
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'MOD POS', {
      body: data.body || '',
      icon: '/modpos/icon.svg',
      badge: '/modpos/icon.svg',
      tag: data.tag || 'modpos',
      data: data,
    })
  );
});
