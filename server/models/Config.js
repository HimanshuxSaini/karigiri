const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. 'reelsConfig', 'automaticCoupons', 'heroSlides'
  data: { type: mongoose.Schema.Types.Mixed, required: true } // Flexible payload
}, { timestamps: true });

module.exports = mongoose.model('Config', configSchema);
