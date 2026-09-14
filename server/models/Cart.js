const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  items: [{
    product: { type: String, required: true }, // Not ObjectId because frontend passes string ID
    quantity: { type: Number, required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
