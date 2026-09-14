const Config = require('../models/Config');

// @desc    Fetch site settings (including announcements)
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    const config = await Config.findOne({ key: 'site_settings' });
    
    if (config && config.data) {
      res.json(config.data);
    } else {
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
    const { announcements } = req.body;
    
    let config = await Config.findOne({ key: 'site_settings' });
    if (!config) {
      config = new Config({ key: 'site_settings', data: {} });
    }
    
    config.data = {
      ...config.data,
      announcements
    };
    
    await config.save();
    
    res.json(config.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Fetch any config by key
// @route   GET /api/settings/config/:key
// @access  Public
const getConfig = async (req, res) => {
  try {
    const config = await Config.findOne({ key: req.params.key });
    if (config && config.data) {
      res.json(config.data);
    } else {
      res.json({});
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update any config by key
// @route   PUT /api/settings/config/:key
// @access  Private/Admin
const updateConfig = async (req, res) => {
  try {
    let config = await Config.findOne({ key: req.params.key });
    if (!config) {
      config = new Config({ key: req.params.key, data: req.body });
    } else {
      config.data = req.body;
    }
    await config.save();
    res.json(config.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getConfig,
  updateConfig
};
