# 🏛️ Architecture Overview

PrathamKarigiri is a full-stack e-commerce platform built using the MERN stack (MongoDB, Express, React, Node.js) with Firebase for Authentication and Storage.

## High-Level Architecture
- **Frontend**: A React.js Single Page Application (SPA) built with Vite. State management is handled by Zustand.
- **Backend**: Node.js & Express.js REST API providing business logic, payment processing, and admin functions.
- **Database**: MongoDB (NoSQL) via Mongoose for storing products, orders, coupons, tokens, and user preferences.
- **Authentication**: Firebase Authentication (Email/Password, Phone OTP) with Firebase Admin SDK validating tokens on the backend.
- **Storage**: Cloudinary for handling product images and reels.

## System Workflow
1. User interacts with the React Frontend.
2. Actions requiring data fetch or mutations hit the Express Backend via REST API calls.
3. Protected routes require a Bearer token (JWT) provided by Firebase Auth.
4. Express middleware verifies the JWT using Firebase Admin.
5. The backend communicates with MongoDB using Mongoose to persist or retrieve data.
6. Payments are processed securely via Razorpay integration on the backend.
