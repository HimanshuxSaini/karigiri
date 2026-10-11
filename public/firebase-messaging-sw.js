importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBVGT2PYr79SpTwkjAbVmXFhDHv3iaxtpg",
  authDomain: "loom-luxe-91fb-9e5e9468b3f6.firebaseapp.com",
  projectId: "loom-luxe-91fb-9e5e9468b3f6",
  storageBucket: "loom-luxe-91fb-9e5e9468b3f6.firebasestorage.app",
  messagingSenderId: "911944665074",
  appId: "1:911944665074:web:2ad0e2bde00473f942cd6b"
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const title = payload?.notification?.title || payload?.data?.title || 'Pratham Karigiri';
  const body = payload?.notification?.body || payload?.data?.body || '';
  const icon = payload?.notification?.icon || payload?.data?.icon || '/pwa-192x192.png';
  const image = payload?.notification?.image || payload?.notification?.imageUrl || payload?.data?.image || payload?.data?.imageUrl || undefined;
  const link = payload?.fcmOptions?.link || payload?.data?.url || '/';

  const notificationOptions = {
    body: body,
    icon: icon,
    badge: '/pwa-192x192.png',
    data: {
      url: link
    },
    tag: payload?.data?.tag || payload?.messageId || 'karigiri-notification',
    renotify: true
  };

  if (image) {
    notificationOptions.image = image;
  }

  return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then((focusedClient) => {
            if (focusedClient && 'navigate' in focusedClient && urlToOpen) {
              return focusedClient.navigate(urlToOpen);
            }
          });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
