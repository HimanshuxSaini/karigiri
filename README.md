<div align="center">
  <img src="https://karigiri.com/favicon.png" alt="Karigiri Logo" width="100" />

  # 🧶 Karigiri - Artisanal E-commerce Platform

  <p align="center">
    <strong>Premium handcrafted woolen products, crochet bouquets, and artisanal crafts.</strong>
  </p>

  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#environment-variables">Env Variables</a> •
    <a href="#project-structure">Project Structure</a>
  </p>
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>

<br />

> **Karigiri** is a premium, mobile-first e-commerce experience dedicated to bringing the finest handcrafted woolen products and artisanal crafts directly to your doorstep. From master artisans in Sonipat, Haryana, to the world.

## ✨ Features

- **🛍️ Modern Shop Interface**: Elegant, smooth filtering by categories, price range, and subcategories, fully synced with URL state.
- **🔍 Robust Search**: High-performance search across product names, brands, categories, and subcategories.
- **📱 Mobile-First Design**: App-like navigation with bottom nav, horizontal scrolling categories, and responsive layouts.
- **✨ Premium UI/UX**: Smooth micro-interactions powered by Framer Motion, glassmorphism, and a carefully curated aesthetic.
- **🛡️ Secure Authentication**: Powered by Firebase Auth for seamless login and session management.
- **🛒 Real-time Cart & Wishlist**: Instantly synchronized cart and wishlist state using Zustand.
- **⚙️ Admin Dashboard**: Comprehensive internal tools for managing products, orders, categories, and promotional reels.
- **💬 Custom Orders**: Integrated WhatsApp ordering for bespoke artisanal requests and support.

## 🚀 Tech Stack

### Frontend
- **Framework**: [React.js](https://reactjs.org/) (v19) powered by [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid transitions
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router](https://reactrouter.com/) (v7)

### Backend & Infrastructure
- **Server**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (interfacing via Firebase Firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth)
- **Storage**: [Firebase Storage](https://firebase.google.com/products/storage)
- **Hosting**: Configured for Vercel & Firebase Hosting

## 📦 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/your-username/karigiri.git
cd karigiri

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 2. Environment Variables
You need to set up Firebase and backend API keys. 

Create a `.env` file in the **root** of the project:
```env
VITE_API_URL=http://localhost:5000  # Or your deployed backend URL
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT=your_service_account_json_string
```
*(See `.env.example` if available)*

### 3. Run Development Servers

**Run the Backend:**
```bash
# In the server/ directory
npm run dev
# or simply node index.js if you don't have nodemon
```

**Run the Frontend:**
```bash
# In the root directory
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📂 Project Structure

```text
karigiri/
├── src/
│   ├── components/       # Reusable UI components (Buttons, Nav, Cards)
│   ├── pages/            # Top-level route components (Home, Shop, Cart)
│   ├── store/            # Zustand global state (Cart, Wishlist, Auth)
│   ├── hooks/            # Custom React hooks (useCartSync, etc.)
│   ├── utils/            # Helper functions
│   ├── firebase/         # Firebase initialization and config
│   └── main.jsx          # Entry point
├── server/
│   ├── index.js          # Express server entry
│   ├── controllers/      # API controllers
│   └── routes/           # Express routes
├── public/               # Static assets
└── tailwind.config.js    # Tailwind theme configuration
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License
This project is private and proprietary. All rights reserved. © Karigiri
