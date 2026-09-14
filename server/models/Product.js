const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  images: [{ type: String }],
  brand: { type: String, default: 'PrathamKarigiri' },
  category: { type: String },
  subCategory: { type: String },
  sizeType: { type: String, default: 'none' },
  sizes: [{ type: String }],
  sizePrices: { type: Map, of: Number },
  deliveryCharge: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number, default: 0 },
  badge: { type: String, default: 'none' },
  isReturnable: { type: Boolean, default: false },
  returnDays: { type: Number, default: 7 },
  public_id: { type: String },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
