const Review = require('../models/Review');

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    const formattedReviews = reviews.map(r => ({ ...r.toObject(), id: r._id.toString() }));
    res.json(formattedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, productId: req.params.productId });
    res.status(201).json({ ...review.toObject(), id: review._id.toString() });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getReviews,
  createReview
};
