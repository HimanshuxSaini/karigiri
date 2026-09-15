const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  items: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
