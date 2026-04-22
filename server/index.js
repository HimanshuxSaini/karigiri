const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Use absolute path for .env to ensure it's always found
const envPath = path.resolve(__dirname, '..', '.env');
require('dotenv').config({ path: envPath });

console.log('--- SERVER STARTING UP ---');
console.log('Target Port:', process.env.PORT || 5001);
console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Found' : '❌ MISSING');
console.log('---------------------------');

const otpRoutes = require('./routes/otpRoutes');

const app = express();

// Explicit CORS configuration
app.use(cors({
  origin: '*', // Allow all for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/otp', otpRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'active', message: 'Karigiri API is running' });
});

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const fullPath = serviceAccountPath ? path.resolve(__dirname, '..', serviceAccountPath) : null;

if (fullPath && fs.existsSync(fullPath)) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(fullPath),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      });
      console.log('Firebase Admin: ✅ Initialized');
    }
  } catch (error) {
    console.error('Firebase Error:', error.message);
  }
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
