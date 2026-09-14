const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  tag: { type: String, required: true },
  handle: { type: String, required: true },
  url: { type: String },
  image: { type: String },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);
