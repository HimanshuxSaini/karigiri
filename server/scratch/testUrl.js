const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '..', '..', '.env');
require('dotenv').config({ path: envPath });

const cloudinary = require('cloudinary').v2;

// If we set CLOUDINARY_URL env var, cloudinary.config() will pick it up automatically
process.env.CLOUDINARY_URL = `cloudinary://865767843174439:EEsxacp2x6SN5fd6riG5MTxzIKg@dajgztd4d`;

async function testUrlUpload() {
  try {
    console.log('Testing Upload with global CLOUDINARY_URL...');
    // We don't even need to call config() if env var is set before require or used correctly
    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    console.log('Upload Result:', result);
    console.log('✅ URL Upload works!');
  } catch (error) {
    console.error('❌ URL Upload Failed:');
    console.error(JSON.stringify(error, null, 2));
  }
}

testUrlUpload();
