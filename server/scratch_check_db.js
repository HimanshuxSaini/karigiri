const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkOrders() {
  console.log("--- CHECKING ALL ORDERS IN FIRESTORE ---");
  const snapshot = await db.collection('orders').get();
  console.log(`Total orders found in Firestore: ${snapshot.size}`);
  
  let count = 0;
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const isSusp = data.isDeletedByAdmin === true || (data.status && data.status.includes('Suspicious'));
    
    console.log(`\n[${++count}] Order ID: ${doc.id}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   isDeletedByAdmin: ${data.isDeletedByAdmin}`);
    console.log(`   Email: ${data.email}`);
    if (isSusp) {
      console.log(`   >>> MATCHES SUSPICIOUS / FAKE ORDER <<<`);
    }
  });
  
  console.log("\n--- DONE ---");
  process.exit(0);
}

checkOrders().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
