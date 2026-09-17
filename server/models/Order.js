const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  title: String, // Store title and price statically at time of order
  price: Number,
  quantity: Number,
  image: String
});

const orderSchema = new mongoose.Schema({
  user: { type: String }, // Firebase UID (can be empty for guest checkout)
  email: { type: String, required: true },
  phone: { type: String, required: true },
  name: { type: String, required: true },
  shippingAddress: {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number }
  },
  paymentMethod: { type: String, required: true },
  paymentDetails: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    method: String,
    card_network: String,
    bank: String,
    wallet: String,
    upi_id: String,
    payment_time: Date,
    fee: Number,
    tax: Number
  },
  orderItems: [orderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  appliedCoupon: {
    code: String,
    discountAmount: Number
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Cancelled (Suspicious)'],
    default: 'Pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    comment: String
  }],
  deviceInfo: {
    ip: String,
    userAgent: String
  },
  refundDetails: {
    refund_id: String,
    amount: Number,
    status: String,
    timestamp: Date
  },
  cancellationReason: { type: String },
  expectedDeliveryDate: { type: Date },
  isDeletedByAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
