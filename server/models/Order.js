const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: String, // Firebase UID
    required: true
  },
  email: {
    type: String,
    required: false
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      size: { type: String, default: 'One Size' },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false // Optional if product is deleted
      }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    state: { type: String, required: false },
    country: { type: String, required: false },
    phone: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'COD'
  },
  subtotal: {
    type: Number,
    required: false
  },
  couponCode: {
    type: String,
    required: false
  },
  couponDiscount: {
    type: Number,
    required: false,
    default: 0
  },
  deliveryCharges: {
    type: Number,
    required: false,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    default: 'Processing',
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
