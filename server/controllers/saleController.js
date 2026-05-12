const admin = require('firebase-admin');

// @desc    Fetch flash sale configuration
// @route   GET /api/sale
// @access  Public
const getFlashSale = async (req, res) => {
  try {
    const db = admin.firestore();
    const doc = await db.collection('config').doc('flashSale').get();
    
    if (!doc.exists) {
      // Default fallback structure
      return res.json({
        isActive: false,
        endTime: null,
        text: 'Flash Sale is live!',
        discountText: 'Up to 50% OFF'
      });
    }

    res.json(doc.data());
  } catch (error) {
    console.error('Error fetching flash sale:', error);
    res.status(500).json({ message: 'Server Error fetching configurations' });
  }
};

// @desc    Update flash sale configuration
// @route   POST /api/sale
// @access  Private/Admin
const updateFlashSale = async (req, res) => {
  try {
    const { isActive, endTime, text, discountText } = req.body;
    const db = admin.firestore();
    
    const updatedData = {
      isActive: Boolean(isActive),
      endTime: endTime || null, // ISO format expect
      text: text || 'Flash Sale is live!',
      discountText: discountText || 'Up to 50% OFF',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('config').doc('flashSale').set(updatedData, { merge: true });

    res.json({ success: true, data: updatedData });
  } catch (error) {
    console.error('Error updating flash sale:', error);
    res.status(500).json({ message: 'Failed to update flash sale configuration' });
  }
};

module.exports = {
  getFlashSale,
  updateFlashSale
};
