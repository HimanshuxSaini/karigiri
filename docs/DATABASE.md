# 🗄️ Database Schema & Models

The application uses MongoDB as the primary database, utilizing Mongoose as the ODM.

## Core Models

### 1. Product (`models/Product.js`)
Stores inventory details.
- **Fields**: `name`, `description`, `price`, `images`, `brand`, `category`, `subCategory`, `sizes`, `stockCount`, `inStock`.
- **Logic**: Handles size-specific pricing and stock tracking.

### 2. Order (`models/Order.js`)
Stores customer purchases and transaction states.
- **Fields**: `user` (Firebase UID), `email`, `shippingAddress`, `paymentMethod`, `paymentDetails` (Razorpay data), `orderItems`, `totalAmount`, `status` (Pending, Processing, Shipped, Delivered, Cancelled).

### 3. User (`models/User.js`)
Stores user preferences and roles.
- **Fields**: `firebaseUid`, `email`, `phone`, `role` (user, admin), `addresses`, `wishlist`.

### 4. Coupon (`models/Coupon.js`)
Manages discount codes.
- **Fields**: `code`, `discountPercentage`, `maxDiscount`, `minOrderValue`, `expiryDate`, `isActive`.

### 5. Review (`models/Review.js`)
Stores product reviews from users.
- **Fields**: `productId`, `userId`, `rating`, `comment`.

### 6. FCMToken (`models/FCMToken.js`)
Stores Firebase Cloud Messaging tokens for Push Notifications.
- **Fields**: `token`, `lastActive`.
