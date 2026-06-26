const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dns = require('dns');

// Force IPv4 globally to prevent ENETUNREACH errors on cloud providers like Render...
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
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Security & Performance Middlewares
const helmet = require('helmet');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');

// General API Rate Limiter (150 requests per 15 mins)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 150,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});

// Strict Rate Limiter for security-critical features (10 requests per 15 mins)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' }
});


app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP if it interferes with external assets like Cloudinary
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Explicit CORS configuration - Restrictive for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://karigiri.vercel.app',
  'https://prathamkarigiri.vercel.app',
  'https://pratham-karigiri.vercel.app',
  'https://prathamkarigiri.in',
  'https://www.prathamkarigiri.in',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) : [])
].filter(Boolean);

console.log('CORS Configuration: Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all local origins
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isAllowed = allowedOrigins.includes(origin) || isLocal || process.env.NODE_ENV !== 'production';

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`[CORS Error] Origin ${origin} not allowed. Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes

// Strict protection for high-value endpoints (OTP SMS/Email spam & Coupon brute-forcing)
app.use('/api/otp', strictLimiter, otpRoutes);
app.use('/api/coupons/validate', strictLimiter); // Apply strict limiter specifically to coupon validation endpoint

// Standard protection for general API paths
app.use('/api/upload', generalLimiter, uploadRoutes);
app.use('/api/coupons', generalLimiter, couponRoutes);
app.use('/api/products', generalLimiter, productRoutes);
app.use('/api/sale', generalLimiter, saleRoutes);
app.use('/api/orders', generalLimiter, require('./routes/orderRoutes'));
app.use('/api/payment', generalLimiter, require('./routes/paymentRoutes'));
app.use('/api/settings', generalLimiter, settingsRoutes);


// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'PrathamKarigiri API is running' });
});

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    let credential;

    if (serviceAccountVar) {
      // Support JSON string from environment variable (Best for Render/Vercel)
      try {
        const serviceAccount = JSON.parse(serviceAccountVar);
        // Fix for private key newlines in environment variables
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        credential = admin.credential.cert(serviceAccount);
      } catch (parseError) {
        console.error('❌ Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message);
      }
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
app.use((err, req, res, _next) => {
  console.error('SERVER ERROR:', err);
  if (err.stack) console.error(err.stack);

  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(status).json({
    message: err.message || 'Internal Server Error',
    // Prevent leaking internal system paths, dependencies, or Firebase details to clients in production
    ...(isProd ? {} : { error: err })
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
