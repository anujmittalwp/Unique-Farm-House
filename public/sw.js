self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'unregister') {
    self.registration.unregister();
  }
});

self.addEventListener('push', function(event) {
  if (event.data) {
    let payload = {};
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: 'New Notification', body: event.data.text() };
    }

    const title = payload.title || 'Farmhouse Update';
    const options = {
      body: payload.body || 'You have a new update.',
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: payload.url || '/',
      vibrate: [200, 100, 200]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url.includes(new URL(urlToOpen, self.location.origin).href) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
