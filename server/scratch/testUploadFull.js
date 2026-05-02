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

async function testFullUpload() {
  try {
    console.log('Testing Cloudinary Full Upload with Data URI...');
    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', {
      folder: 'karigiri_test'
    });
    console.log('Upload Result:', result);
    console.log('✅ Full Upload works!');
  } catch (error) {
    console.error('❌ Full Upload Failed:');
    console.error(JSON.stringify(error, null, 2));
  }
}

testFullUpload();
