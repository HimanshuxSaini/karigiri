const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

// Load env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Setup Firebase Admin
const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountVar) {
  console.error("FIREBASE_SERVICE_ACCOUNT is missing in .env");
  process.exit(1);
}
let credential;
try {
  const serviceAccount = JSON.parse(serviceAccountVar);
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  credential = admin.credential.cert(serviceAccount);
} catch (e) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT", e);
  process.exit(1);
}

admin.initializeApp({
  credential,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const db = admin.firestore();

// Models
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Coupon = require('./models/Coupon');
const Reel = require('./models/Reel');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    const idMappings = {
      products: {}, // old_id -> new_object_id
      users: {}     // uid -> uid (users use Firebase UID)
    };

    // 1. Migrate Products
    console.log("\n--- Migrating Products ---");
    const productsSnapshot = await db.collection('products').get();
    let pCount = 0;
    for (const doc of productsSnapshot.docs) {
      const data = doc.data();
      // Check if it already exists by name (simple check)
      let existing = await Product.findOne({ name: data.name });
      if (!existing) {
        // Convert map formats if needed
        let sizePricesMap = {};
        if (data.sizePrices) {
          for (const [k, v] of Object.entries(data.sizePrices)) {
            sizePricesMap[k] = Number(v);
          }
        }

        const newProduct = new Product({
          name: data.name,
          description: data.description || '',
          price: Number(data.price),
          image: data.image || '',
          images: data.images || [],
          brand: data.brand || 'PrathamKarigiri',
          category: data.category || '',
          subCategory: data.subCategory || '',
          sizeType: data.sizeType || 'none',
          sizes: data.sizes || [],
          sizePrices: sizePricesMap,
          deliveryCharge: Number(data.deliveryCharge) || 0,
          inStock: data.inStock !== false,
          stockCount: Number(data.stockCount) || 10, // Default to 10 if missing
          badge: data.badge || 'none',
          isReturnable: data.isReturnable || false,
          returnDays: Number(data.returnDays) || 7,
          isArchived: data.isArchived || false,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
        });
        await newProduct.save();
        idMappings.products[doc.id] = newProduct._id.toString();
        pCount++;
        process.stdout.write('.');
      } else {
        idMappings.products[doc.id] = existing._id.toString();
      }
    }
    console.log(`\nMigrated ${pCount} new products. Total in map: ${Object.keys(idMappings.products).length}`);

    // 2. Migrate Users
    console.log("\n--- Migrating Users ---");
    const usersSnapshot = await db.collection('users').get();
    let uCount = 0;
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      if (!data.uid && !data.id) continue;
      
      const uid = data.uid || data.id || doc.id;
      let existing = await User.findOne({ uid: uid });
      
      if (!existing) {
        const addresses = [];
        if (data.shippingAddress) {
          addresses.push({
            line1: data.shippingAddress.address || data.shippingAddress.line1 || 'N/A',
            city: data.shippingAddress.city || 'N/A',
            state: data.shippingAddress.state || 'N/A',
            pincode: data.shippingAddress.pincode || data.shippingAddress.postalCode || 'N/A'
          });
        }
        
        const newUser = new User({
          uid: uid,
          email: data.email || `${uid}@karigiri.com`,
          displayName: data.displayName || data.name || '',
          phone: data.phone || '',
          role: data.role || 'customer',
          addresses: addresses,
          createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date()
        });
        await newUser.save();
        uCount++;
        process.stdout.write('.');
      }
    }
    console.log(`\nMigrated ${uCount} new users.`);

    // 3. Migrate Coupons
    console.log("\n--- Migrating Coupons ---");
    const couponsSnapshot = await db.collection('coupons').get();
    let cCount = 0;
    for (const doc of couponsSnapshot.docs) {
      const data = doc.data();
      let existing = await Coupon.findOne({ code: data.code });
      if (!existing && data.code) {
        const newCoupon = new Coupon({
          code: data.code,
          description: data.description || '',
          discountType: data.discountType || 'percentage',
          discountPercent: Number(data.discountPercent) || 0,
          discountAmount: Number(data.discountAmount) || 0,
          maxDiscount: Number(data.maxDiscount) || null,
          minOrderAmount: Number(data.minOrderAmount) || 0,
          validFrom: data.validFrom ? data.validFrom.toDate() : new Date(),
          validUntil: data.validUntil ? data.validUntil.toDate() : null,
          usageLimit: Number(data.usageLimit) || null,
          usedCount: Number(data.usedCount) || 0,
          isActive: data.isActive !== false,
          isAutomatic: data.isAutomatic || false,
          isFirstOrderOnly: data.isFirstOrderOnly || false,
          applicableCategories: data.applicableCategories || []
        });
        await newCoupon.save();
        cCount++;
        process.stdout.write('.');
      }
    }
    console.log(`\nMigrated ${cCount} new coupons.`);

    // 4. Migrate Orders
    console.log("\n--- Migrating Orders ---");
    const ordersSnapshot = await db.collection('orders').get();
    let oCount = 0;
    for (const doc of ordersSnapshot.docs) {
      const data = doc.data();
      
      // If we already have an order with this Razorpay ID, skip
      let existing = null;
      if (data.paymentDetails?.razorpay_payment_id) {
        existing = await Order.findOne({ 'paymentDetails.razorpay_payment_id': data.paymentDetails.razorpay_payment_id });
      }
      
      if (!existing) {
        const mappedItems = (data.orderItems || data.items || []).map(item => {
          let oldProductId = item.product || item.id || '';
          let newProductId = idMappings.products[oldProductId];
          return {
            product: newProductId || null,
            title: item.title || item.name || '',
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            image: item.image || ''
          };
        });

        // Parse status history
        const statusHistory = (data.statusHistory || []).map(h => ({
          status: h.status,
          comment: h.comment || '',
          timestamp: h.timestamp ? (h.timestamp.toDate ? h.timestamp.toDate() : new Date(h.timestamp)) : new Date()
        }));
        if (statusHistory.length === 0) {
          statusHistory.push({ status: data.status || 'Pending', timestamp: new Date() });
        }

        const newOrder = new Order({
          user: data.userId || data.user || '',
          email: data.email || data.userEmail || 'unknown@karigiri.com',
          phone: data.phone || data.userPhone || '0000000000',
          name: data.name || data.shippingAddress?.name || 'Unknown',
          shippingAddress: {
            line1: data.shippingAddress?.address || data.shippingAddress?.street || data.shippingAddress?.line1 || 'N/A',
            line2: data.shippingAddress?.line2 || '',
            city: data.shippingAddress?.city || 'N/A',
            state: data.shippingAddress?.state || 'N/A',
            pincode: data.shippingAddress?.pincode || data.shippingAddress?.postalCode || 'N/A'
          },
          paymentMethod: data.paymentMethod || 'WhatsApp / QR Code',
          paymentDetails: data.paymentDetails || {},
          orderItems: mappedItems,
          subtotal: Number(data.subtotal) || 0,
          deliveryCharge: Number(data.deliveryCharge) || 0,
          discount: Number(data.discount) || 0,
          totalAmount: Number(data.totalAmount) || Number(data.totalPrice) || 0,
          appliedCoupon: data.appliedCoupon || null,
          status: data.status || 'Pending',
          statusHistory: statusHistory,
          createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
          updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)) : new Date()
        });
        await newOrder.save();
        oCount++;
        process.stdout.write('.');
      }
    }
    console.log(`\nMigrated ${oCount} new orders.`);

    // 5. Migrate Reels
    console.log("\n--- Migrating Reels ---");
    const reelsSnapshot = await db.collection('reels').get();
    let rCount = 0;
    for (const doc of reelsSnapshot.docs) {
      const data = doc.data();
      let existing = await Reel.findOne({ videoUrl: data.videoUrl });
      if (!existing && data.videoUrl) {
        const newReel = new Reel({
          title: data.title || '',
          description: data.description || '',
          videoUrl: data.videoUrl,
          thumbnailUrl: data.thumbnailUrl || '',
          public_id: data.public_id || '',
          isActive: data.isActive !== false,
          linkedProduct: idMappings.products[data.linkedProductId] || idMappings.products[data.linkedProduct] || null,
          likes: Number(data.likes) || 0,
          shares: Number(data.shares) || 0,
          views: Number(data.views) || 0,
          createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date()
        });
        await newReel.save();
        rCount++;
        process.stdout.write('.');
      }
    }
    console.log(`\nMigrated ${rCount} new reels.`);

    console.log("\nMigration completed successfully!");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
