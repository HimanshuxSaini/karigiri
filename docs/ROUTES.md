# 🛣️ Route Definitions

Overview of the main backend express routes.

## Auth & Users (`/api/users`)
- `GET /profile` - Get current user profile.
- `PUT /profile` - Update user details.

## Products (`/api/products`)
- `GET /` - Fetch all products (supports filtering, sorting, pagination).
- `GET /:id` - Get single product details.
- `POST /` (Admin) - Create new product.
- `PUT /:id` (Admin) - Update product.
- `DELETE /:id` (Admin) - Archive/Delete product.

## Orders (`/api/orders`)
- `POST /` - Create a new order.
- `GET /my-orders` - Fetch logged-in user's orders.
- `GET /` (Admin) - Fetch all orders.
- `PUT /:id/status` (Admin) - Update order shipping status.

## Payments (`/api/payment`)
- `POST /create-razorpay-order` - Initialize Razorpay transaction.

## Coupons (`/api/coupons`)
- `POST /validate` - Validate a discount code.
- `POST /` (Admin) - Create a coupon.
