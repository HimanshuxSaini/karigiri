const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  items: [{ type: String }] // Array of product IDs as strings
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
