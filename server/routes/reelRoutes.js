const express = require('express');
const router = express.Router();
const { getReels, getReelById, createReel, updateReel, deleteReel } = require('../controllers/reelController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getReels)
  .post(protectAdmin, createReel);

router.route('/:id')
  .get(getReelById)
  .put(protectAdmin, updateReel)
  .delete(protectAdmin, deleteReel);

module.exports = router;
