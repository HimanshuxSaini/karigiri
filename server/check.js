const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

// Load env just in case
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const initFirebase = () => {
  if (admin.apps.length) return admin.firestore();
  
  const serviceAccountPath = path.resolve(__dirname, '..', 'serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath)
    });
    console.log('✅ Initialized using serviceAccountKey.json');
  } else {
    throw new Error('Could not find serviceAccountKey.json at ' + serviceAccountPath);
  }
  
  return admin.firestore();
};

const runMigration = async () => {
  try {
    const db = initFirebase();
    const productsRef = db.collection('products');
    
    // Query for old category spelling
    const snapshot = await productsRef.where('category', '==', 'Bookey').get();
    
    console.log(`Found ${snapshot.size} products with category "Bookey".`);
    
    if (snapshot.empty) {
      console.log('No updates needed.');
      process.exit(0);
    }

    let count = 0;
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { 
        category: 'Bouquet',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      count++;
    });

    await batch.commit();
    console.log(`Successfully updated ${count} products from "Bookey" to "Bouquet".`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
