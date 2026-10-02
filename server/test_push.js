const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
  }
} catch(e) {
  console.log('Error parsing JSON:', e);
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function run() {
  try {
    const tokensDocs = await require('mongodb').MongoClient.connect(process.env.MONGO_URI).then(client => client.db().collection('fcmtokens').find({}).toArray());
    console.log('Tokens found:', tokensDocs.length);
    if(tokensDocs.length > 0) {
      const tokens = tokensDocs.map(d => d.token);
      const res = await admin.messaging().sendEachForMulticast({
        notification: { title: 'Test', body: 'Test' },
        tokens: tokens
      });
      console.log('Firebase response:', res);
    }
  } catch(e) {
    console.error('Firebase error:', e);
  }
  process.exit();
}
run();
