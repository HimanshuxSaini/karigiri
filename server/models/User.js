const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' }
});

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true },
  displayName: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  permissions: [{ type: String }], // e.g., 'manage_products', 'manage_orders', 'superadmin'
  addresses: [addressSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
