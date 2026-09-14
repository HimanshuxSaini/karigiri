# 📂 Project Structure

The repository is a monorepo containing both the frontend and backend applications.

## Root Directory
- `/src`: Frontend React source code.
- `/server`: Backend Node.js source code.
- `/public`: Static assets for the frontend.
- `/docs`: Project documentation.

## Frontend (`/src`)
- `assets/`: Images, icons, and global styles.
- `components/`: Reusable React components (UI elements, Layouts).
- `pages/`: Page-level components corresponding to React Router routes.
- `store/`: Zustand state management stores (cart, wishlist, auth).
- `services/`: API integration layer.
- `hooks/`: Custom React hooks.
- `firebase/`: Firebase configuration and initialization.
- `utils/`: Utility functions and constants.

## Backend (`/server`)
- `config/`: Environment and Database connection setup.
- `controllers/`: Core business logic for each API endpoint.
- `models/`: Mongoose schemas and models for MongoDB.
- `routes/`: Express route definitions grouping controllers.
- `middleware/`: Express middlewares (Auth verification, Rate limiting, Error handling).
- `utils/`: Backend utilities (Email, SMS, Payment helpers).
