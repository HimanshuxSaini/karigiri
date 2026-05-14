const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage, cloudinary } = require('../config/cloudinary');
const { protectAdmin } = require('../middleware/authMiddleware');

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @desc    Upload product image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protectAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // req.file.path contains the Cloudinary URL
    res.json({ 
      url: req.file.path,
      public_id: req.file.filename 
    });

  } catch (error) {
    console.error('Cloudinary Upload Error Details:', error);
    res.status(500).json({ 
      message: 'Server error during upload', 
      error: error.message
    });
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload
// @access  Private/Admin
router.delete('/', protectAdmin, async (req, res) => {
  try {
    const { imageUrl, public_id } = req.body;
    
    if (!imageUrl && !public_id) {
      return res.status(400).json({ message: 'No image identifier provided' });
    }

    let result;
    if (public_id) {
      result = await cloudinary.uploader.destroy(public_id);
    } else {
      // Try to extract public_id from URL if not provided
      // Cloudinary URL format: .../upload/v12345/folder/public_id.jpg
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1].split('.')[0];
      const folder = parts[parts.length - 2];
      const derivedPublicId = `${folder}/${filename}`;
      result = await cloudinary.uploader.destroy(derivedPublicId);
    }

    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully from Cloudinary' });
    } else {
      res.status(400).json({ message: 'Failed to delete image from Cloudinary', result });
    }
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    res.status(500).json({ message: 'Server error during deletion', error: error.message });
  }
});

module.exports = router;

