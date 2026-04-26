const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Use absolute path for .env to ensure it's always found
const envPath = path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

const otpRoutes = require('./routes/otpRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Explicit CORS configuration
app.use(cors({
  origin: '*', // Allow all for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/otp', otpRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'Karigiri API is running' });
});

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    let credential;

    if (serviceAccountVar) {
      // Support JSON string from environment variable (Best for Render/Vercel)
      credential = admin.credential.cert(JSON.parse(serviceAccountVar));
    } else if (serviceAccountPath) {
      // Support local file path
      const fullPath = path.resolve(__dirname, '..', serviceAccountPath);
      if (fs.existsSync(fullPath)) {
        credential = admin.credential.cert(fullPath);
      }
    }

    if (credential) {
      admin.initializeApp({
        credential,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
      });
      console.log('Firebase Admin: ✅ Initialized');
    } else {
      console.warn('Firebase Admin: ⚠️ Not initialized (No credentials found)');
    }
  }
} catch (error) {
  console.error('Firebase Initialization Error:', error.message);
}

const PORT = process.env.PORT || 5001;

// Start Server with detailed error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=========================================`);
  console.log(`🚀 SERVER RUNNING ON PORT: ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`=========================================\n`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`❌ PORT ${PORT} IS ALREADY IN USE!`);
    console.error(`Please close any other terminals or use a different port in .env`);
  } else {
    console.error('Server error:', e);
  }
});

// Prevent process from exiting
setInterval(() => {
  // Just a heartbeat
}, 1000 * 60);

process.on('uncaughtException', (err) => {
  console.error('CAUGHT EXCEPTION (Server remains alive):', err.message);
});
