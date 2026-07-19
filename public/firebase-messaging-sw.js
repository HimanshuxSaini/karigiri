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

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    image: payload.notification.image,
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
