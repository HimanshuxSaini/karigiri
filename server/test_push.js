const admin = require('firebase-admin');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const FCMToken = require('./models/FCMToken');

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
  }
} catch(e) {
  console.log('Error parsing JSON:', e);
}
const { cert } = require('firebase-admin/app');
const credential = admin.credential ? admin.credential.cert(serviceAccount) : cert(serviceAccount);
admin.initializeApp({
  credential
});

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const tokensDocs = await FCMToken.find({});
    console.log('Tokens found:', tokensDocs.length);
    if(tokensDocs.length > 0) {
      const tokens = tokensDocs.map(d => d.token);
      const { getMessaging } = require('firebase-admin/messaging');
      const res = await getMessaging().sendEachForMulticast({
        notification: { title: 'Test Admin Push', body: 'Test notification check' },
        data: {
          title: 'Test Admin Push',
          body: 'Test notification check',
          url: 'https://prathamkarigiri.in',
          icon: 'https://prathamkarigiri.in/pwa-192x192.png'
        },
        android: {
          priority: 'high',
          notification: {
            title: 'Test Admin Push',
            body: 'Test notification check',
            sound: 'default',
            icon: 'https://prathamkarigiri.in/pwa-192x192.png'
          }
        },
        webpush: {
          headers: { Urgency: 'high' },
          notification: {
            title: 'Test Admin Push',
            body: 'Test notification check',
            icon: 'https://prathamkarigiri.in/pwa-192x192.png',
            badge: 'https://prathamkarigiri.in/pwa-192x192.png'
          },
          fcmOptions: {
            link: 'https://prathamkarigiri.in'
          }
        },
        tokens: tokens
      });
      console.log('Firebase response: successCount =', res.successCount, 'failureCount =', res.failureCount);
      res.responses.forEach((r, idx) => {
        if (!r.success) {
          console.log(`Failed token [${idx}]:`, r.error?.code, r.error?.message);
        } else {
          console.log(`Success token [${idx}]:`, r.messageId);
        }
      });
    }
    await mongoose.disconnect();
  } catch(e) {
    console.error('Firebase error:', e);
  }
  process.exit();
}
run();
