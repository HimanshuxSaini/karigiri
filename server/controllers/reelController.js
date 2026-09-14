const Reel = require('../models/Reel');

const getReels = async (req, res) => {
  try {
    const reels = await Reel.find({}).sort({ order: 1 });
    const formattedReels = reels.map(r => ({ ...r.toObject(), id: r._id.toString() }));
    res.json(formattedReels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReelById = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (reel) {
      res.json({ ...reel.toObject(), id: reel._id.toString() });
    } else {
      res.status(404).json({ message: 'Reel not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReel = async (req, res) => {
  try {
    const reel = await Reel.create(req.body);
    res.status(201).json({ ...reel.toObject(), id: reel._id.toString() });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateReel = async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (reel) {
      res.json({ ...reel.toObject(), id: reel._id.toString() });
    } else {
      res.status(404).json({ message: 'Reel not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteReel = async (req, res) => {
  try {
    const reel = await Reel.findByIdAndDelete(req.params.id);
    if (reel) {
      res.json({ success: true });
    } else {
      res.status(404).json({ message: 'Reel not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReels,
  getReelById,
  createReel,
  updateReel,
  deleteReel
};
