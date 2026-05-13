const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dns = require('dns');

// Force IPv4 globally to prevent ENETUNREACH errors on cloud providers like Render
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Load environment variables only locally
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const otpRoutes = require('./routes/otpRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const couponRoutes = require('./routes/couponRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');

const app = express();

// Security & Performance Middlewares
const helmet = require('helmet');
const compression = require('compression');

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP if it interferes with external assets like Cloudinary
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Explicit CORS configuration - More restrictive for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isVercel = origin.endsWith('.vercel.app');
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    
    if (isVercel || isLocal || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/otp', otpRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sale', saleRoutes);


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
    } else {
      // Support local file path or Render secret path
      const pathsToTry = [
        serviceAccountPath ? path.resolve(__dirname, '..', serviceAccountPath) : null,
        '/etc/secrets/serviceAccountKey.json',
        './serviceAccountKey.json'
      ].filter(Boolean);

      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          credential = admin.credential.cert(p);
          console.log(`Firebase Admin: Using credentials from ${p}`);
          break;
        }
      }
    }

    if (credential) {
      admin.initializeApp({
        credential,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET
      });
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      console.error('❌ Firebase Admin: No credentials found! Admin routes will fail.');
    }
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error);
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  if (err.stack) console.error(err.stack);

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    error: err
  });
});

// Export for Vercel / Serverless
module.exports = app;

// Start Server locally
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
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
}

// Prevent process from exiting
process.on('uncaughtException', (err) => {
  console.error('CAUGHT EXCEPTION (Server remains alive):', err.message);
});
