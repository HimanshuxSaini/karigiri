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
      // Only take the single most recent active token to test:
      const latestToken = tokensDocs.sort((a,b) => new Date(b.lastActive || 0) - new Date(a.lastActive || 0))[0].token;
      console.log('Sending test to single latest token:', latestToken.substring(0, 25));
      const testImageUrl = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80';
      const { getMessaging } = require('firebase-admin/messaging');
      const res = await getMessaging().sendEachForMulticast({
        notification: { 
          title: 'Pratham Karigiri Test', 
          body: 'Single notification with photo banner test',
          imageUrl: testImageUrl
        },
        data: {
          title: 'Pratham Karigiri Test',
          body: 'Single notification with photo banner test',
          url: 'https://prathamkarigiri.in',
          icon: 'https://prathamkarigiri.in/pwa-192x192.png',
          image: testImageUrl,
          imageUrl: testImageUrl
        },
        android: {
          priority: 'high',
          notification: {
            title: 'Pratham Karigiri Test',
            body: 'Single notification with photo banner test',
            sound: 'default',
            icon: 'https://prathamkarigiri.in/pwa-192x192.png',
            imageUrl: testImageUrl
          }
        },
        webpush: {
          headers: { Urgency: 'high' },
          notification: {
            title: 'Pratham Karigiri Test',
            body: 'Single notification with photo banner test',
            icon: 'https://prathamkarigiri.in/pwa-192x192.png',
            badge: 'https://prathamkarigiri.in/pwa-192x192.png',
            image: testImageUrl,
            tag: 'karigiri-test-single'
          },
          fcmOptions: {
            link: 'https://prathamkarigiri.in'
          }
        },
        tokens: [latestToken]
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
