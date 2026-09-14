const Config = require('../models/Config');

// @desc    Fetch flash sale configuration
// @route   GET /api/sale
// @access  Public
const getFlashSale = async (req, res) => {
  try {
    const config = await Config.findOne({ key: 'flashSale' });
    
    if (!config || !config.data) {
      // Default fallback structure
      return res.json({
        isActive: false,
        endTime: null,
        text: 'Flash Sale is live!',
        discountText: 'Up to 50% OFF'
      });
    }

    res.json(config.data);
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
    
    let config = await Config.findOne({ key: 'flashSale' });
    if (!config) {
      config = new Config({ key: 'flashSale', data: {} });
    }
    
    config.data = {
      isActive: Boolean(isActive),
      endTime: endTime || null, // ISO format expect
      text: text || 'Flash Sale is live!',
      discountText: discountText || 'Up to 50% OFF'
    };

    await config.save();

    res.json({ success: true, data: config.data });
  } catch (error) {
    console.error('Error updating flash sale:', error);
    res.status(500).json({ message: 'Failed to update flash sale configuration' });
  }
};

module.exports = {
  getFlashSale,
  updateFlashSale
};
