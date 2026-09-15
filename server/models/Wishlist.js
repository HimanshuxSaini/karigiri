const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  items: { type: [mongoose.Schema.Types.Mixed], default: [] } // Array of full objects
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
