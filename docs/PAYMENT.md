# 💳 Payment Integration

Online payments are securely processed using **Razorpay**.

## Workflow
1. **Order Initialization**:
   - The frontend sends the cart total and user details to `/api/payment/create-razorpay-order`.
   - The backend validates the amount (checking cart prices against DB to prevent tampering) and calls Razorpay API to create an order.
   - The backend returns the `razorpay_order_id` to the frontend.

2. **Client Checkout**:
   - The frontend initializes the Razorpay Checkout modal with the `order_id` and the Razorpay public key.
   - The user completes the payment on the Razorpay modal.
   - Razorpay returns `razorpay_payment_id` and `razorpay_signature` to the frontend on success.

3. **Order Verification & Creation**:
   - The frontend sends the signature and payment ID to the backend via `/api/orders`.
   - The backend creates an HMAC SHA256 hash using the Razorpay Secret and compares it with the signature.
   - If signatures match, the payment is verified, and the Order is saved in MongoDB with status `Pending`.
