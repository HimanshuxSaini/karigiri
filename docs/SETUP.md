# ⚙️ Local Setup Guide

Follow these steps to run PrathamKarigiri locally on your machine.

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas cluster)
- Firebase Project (Authentication & Storage enabled)
- Razorpay Account (For test API keys)

## 1. Environment Variables
Create a `.env` file in the root directory and add the following keys:
```env
# General
NODE_ENV=development
PORT=5000

# Frontend Variables (Vite)
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id

# Backend Variables
MONGO_URI=your_mongodb_connection_string
FIREBASE_SERVICE_ACCOUNT='{ "type": "service_account", ... }'
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 2. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

## 3. Run Development Servers
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```
The app will be accessible at `http://localhost:5173`.
