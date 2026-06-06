const admin = require('firebase-admin');

// @desc    Fetch site settings (including announcements)
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    const db = admin.firestore();
    const doc = await db.collection('settings').doc('site_settings').get();
    
    if (doc.exists) {
      res.json(doc.data());
    } else {
      // Return default empty structure if it doesn't exist yet
      res.json({ announcements: [] });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update site settings
// @route   POST /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const db = admin.firestore();
    const { announcements } = req.body;
    
    const settingsRef = db.collection('settings').doc('site_settings');
    
    // Using set with merge: true creates the doc if it doesn't exist
    await settingsRef.set({ announcements }, { merge: true });
    
    const updatedDoc = await settingsRef.get();
    
    res.json(updatedDoc.data());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
