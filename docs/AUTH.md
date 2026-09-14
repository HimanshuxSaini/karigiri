# 🔐 Authentication

Authentication is handled securely via **Firebase Authentication**.

## Client-Side Flow
1. User logs in via Email/Password, Google OAuth, or Phone OTP using Firebase UI/SDK.
2. Firebase issues a JWT (ID Token) to the client.
3. The React app stores this token in memory or secure storage.
4. Zustand `authStore` keeps track of the authenticated user state.
5. All Axios requests interceptors attach the ID Token to the `Authorization: Bearer` header.

## Server-Side Flow
1. Express middleware intercepts protected routes.
2. The middleware extracts the Bearer token.
3. `firebase-admin.auth().verifyIdToken(token)` validates the token.
4. If valid, the decoded user data (uid, email, phone) is attached to the `req.user` object.
5. The request proceeds to the controller.

## Role-Based Access Control (RBAC)
- **Admin Users**: Identified by specific UIDs or Custom Claims in Firebase, granting access to Admin Dashboard and destructive API routes.
