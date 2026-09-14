# 🚀 Deployment Guide

## Frontend Deployment (Vercel)
The React application is optimized for deployment on Vercel.
1. Connect the GitHub repository to Vercel.
2. Set the framework preset to `Vite`.
3. Add the Frontend Environment Variables in the Vercel dashboard.
4. Deploy. Vercel will run `npm run build` and serve the `dist/` directory.

## Backend Deployment (Render / Railway / Vercel)
The Node.js Express server can be deployed on platforms like Render or Railway.
1. Connect the repository to your hosting provider.
2. Set the root directory to `server/` (if applicable) or use the build command: `cd server && npm install`.
3. Start command: `node index.js`.
4. **Crucial**: Add all Backend Environment Variables.
5. **Firebase Credentials**: Store the `FIREBASE_SERVICE_ACCOUNT` as a stringified JSON in the environment variables to initialize Firebase Admin securely.

## Database
- MongoDB Atlas is used for production. Ensure the IP Access List in MongoDB Atlas allows connections from your Backend hosting provider (or set to `0.0.0.0/0` for serverless environments).
