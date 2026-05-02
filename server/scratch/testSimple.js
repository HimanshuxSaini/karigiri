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

async function testSimpleUpload() {
  try {
    console.log('Testing Simple Upload (No Folder)...');
    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    console.log('Upload Result:', result);
    console.log('✅ Simple Upload works!');
  } catch (error) {
    console.error('❌ Simple Upload Failed:');
    console.error(JSON.stringify(error, null, 2));
  }
}

testSimpleUpload();
