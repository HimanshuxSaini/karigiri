import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkOrders() {
  console.log("--- CHECKING ALL ORDERS IN FIRESTORE ---");
  const snapshot = await db.collection('orders').get();
  console.log(`Total orders found in Firestore: ${snapshot.size}`);
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(`\nOrder ID: ${doc.id}`);
    console.log(`Status: ${data.status}`);
    console.log(`isDeletedByAdmin: ${data.isDeletedByAdmin}`);
    console.log(`Email: ${data.email}`);
  });
  
  console.log("\n--- DONE ---");
  process.exit(0);
}

checkOrders().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
