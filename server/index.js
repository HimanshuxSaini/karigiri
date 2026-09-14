const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dns = require('dns');

// Force IPv4 globally to prevent ENETUNREACH errors on cloud providers like Render...
// (Only in production, as it can break local MongoDB SRV resolution on Windows)
if (process.env.NODE_ENV === 'production' && dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Load environment variables only locally
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Initialize Firebase Admin
try {
  if (!(admin.apps?.length || (admin.getApps && admin.getApps().length))) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(decoded);
        credential = admin.credential ? admin.credential.cert(serviceAccount) : admin.cert(serviceAccount);
        console.log('✅ Firebase Admin: Initialized using Base64 environment variable.');
      } catch (e) {
        console.error('❌ Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', e.message);
      }
    } else if (serviceAccountVar) {
      // Support JSON string from environment variable (Best for Render/Vercel)
      try {
        let cleanVar = serviceAccountVar.trim();
        if (cleanVar.startsWith("'") && cleanVar.endsWith("'")) {
          cleanVar = cleanVar.slice(1, -1);
        }
        const serviceAccount = JSON.parse(cleanVar);
        // Fix for private key newlines in environment variables
        if (serviceAccount.private_key) {
          // 1. Replace literal \n with actual newline
          let key = serviceAccount.private_key.replace(/\\n/g, '\n');
          // 2. Remove any surrounding quotes
          key = key.replace(/^"|"$/g, '');
          // 3. Fix missing newlines between headers if copy-pasted with spaces
          if (!key.includes('\n') && key.includes('-----BEGIN PRIVATE KEY-----')) {
            key = key.replace('-----BEGIN PRIVATE KEY----- ', '-----BEGIN PRIVATE KEY-----\n');
            key = key.replace(' -----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
            key = key.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----'); // just in case
            
            // split and remove spaces from base64 body
            const parts = key.split('\n');
            if (parts.length >= 3) {
               parts[1] = parts[1].replace(/\s+/g, '');
               key = parts.join('\n');
            }
          }
          serviceAccount.private_key = key;
        }
        credential = admin.credential ? admin.credential.cert(serviceAccount) : admin.cert(serviceAccount);
      } catch (parseError) {
        console.error('❌ Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT JSON or initialize credential:', parseError.message);
        console.error('💡 Tip: Ensure your FIREBASE_SERVICE_ACCOUNT env variable is a valid JSON string and the private_key contains actual newlines or escaped \\n without corruption. Alternatively, use FIREBASE_SERVICE_ACCOUNT_BASE64.');
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
          credential = admin.credential ? admin.credential.cert(p) : admin.cert(p);
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

const otpRoutes = require('./routes/otpRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const couponRoutes = require('./routes/couponRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const seoRoutes = require('./routes/seoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Trust proxy to allow express-rate-limit to work behind Render/Vercel
app.set('trust proxy', 1);
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
// xss-clean is incompatible with Express 5+ because it tries to mutate read-only request properties.
// Validation and sanitization should be handled by express-validator on specific routes.

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
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

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
app.use('/api/users', generalLimiter, require('./routes/userRoutes'));
app.use('/api/reels', generalLimiter, require('./routes/reelRoutes'));
app.use('/api/reviews', generalLimiter, require('./routes/reviewRoutes'));
app.use('/api', generalLimiter, seoRoutes);
app.use('/api/notifications', generalLimiter, notificationRoutes);
app.use('/', generalLimiter, seoRoutes);


// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'PrathamKarigiri API is running' });
});

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
