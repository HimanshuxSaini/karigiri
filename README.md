# Karigiri - Artisanal E-commerce Platform

Karigiri is a premium e-commerce platform dedicated to handcrafted woolen products and artisanal crafts. It features a modern, mobile-first shopping experience with real-time inventory management and seamless navigation.

## Tech Stack
- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Firebase Firestore)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage

## Key Features
- **Modern Shop Interface**: Filter by categories, price range, and subcategories with URL-synced state.
- **Robust Search**: Search across product names, brands, categories, and subcategories.
- **Mobile First Design**: Optimized for mobile with horizontal scrolling categories and app-like navigation.
- **Admin Dashboard**: Comprehensive management for products, orders, and reels.
- **Custom Orders**: Specialized messaging for handcrafted artisanal requests via WhatsApp.

## Getting Started

### Frontend
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`

### Backend
1. Navigate to server: `cd server`
2. Install dependencies: `npm install`
3. Set up environment variables in `.env` (Firebase credentials)
4. Start server: `node index.js`

## Environment Variables
Required variables in `.env`:
- `VITE_API_URL`: Backend API endpoint
- `VITE_FIREBASE_API_KEY`: Firebase API Key
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Auth Domain
- `VITE_FIREBASE_PROJECT_ID`: Firebase Project ID
- `FIREBASE_SERVICE_ACCOUNT`: Service account JSON for admin SDK
