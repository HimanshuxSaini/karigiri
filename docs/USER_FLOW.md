# 👤 User Flow

Typical customer journey through the PrathamKarigiri application.

## 1. Discovery
- User lands on the Homepage (`/`).
- Browses featured categories and promotional reels.
- Uses the global Search bar (powered by Fuse.js) to find specific items.

## 2. Product Selection
- User navigates to the Shop (`/shop`).
- Filters products by category, price, or brand.
- Clicks a product to view the Product Details Page (`/product/:id`).
- Selects required sizes or variations and adds to Cart.

## 3. Checkout Process
- User opens the Cart drawer/page.
- Proceeds to Checkout.
- If not logged in, prompted to Authenticate (Email/Google/OTP).
- Enters shipping address.
- Applies any valid discount coupons.

## 4. Payment & Confirmation
- Selects Payment Method (Razorpay/Online or COD).
- Completes payment gateway transaction.
- Order is placed. User sees the Success screen and receives an email/SMS notification.

## 5. Post-Purchase
- User can track order status in their Account dashboard (`/profile`).
- Admin processes the order, updating the status from 'Pending' to 'Shipped', and finally 'Delivered'.
