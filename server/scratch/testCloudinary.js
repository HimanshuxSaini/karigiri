const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '..', '..', '.env');
require('dotenv').config({ path: envPath });

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  try {
    console.log('Testing Cloudinary Config...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    
    // Test with a small image or just a ping
    const result = await cloudinary.api.ping();
    console.log('Cloudinary Ping Result:', result);
    
    console.log('✅ Cloudinary is working correctly!');
  } catch (error) {
    console.error('❌ Cloudinary Test Failed:');
    console.error(error);
  }
}

testUpload();
