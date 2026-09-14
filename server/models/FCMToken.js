const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true,
    unique: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('FCMToken', fcmTokenSchema);
