const admin = require('firebase-admin');

// @desc    Record user activity
// @route   POST /api/activity
// @access  Public
const recordActivity = async (req, res) => {
  try {
    const db = admin.firestore();
    const { type, userId, userEmail, details } = req.body;

    const activityData = {
      type,
      userId: userId || 'guest',
      userEmail: userEmail || 'Guest User',
      details: details || {},
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('activities').add(activityData);
    res.status(201).json({ message: 'Activity recorded' });
  } catch (error) {
    console.error('Error recording activity:', error);
    res.status(500).json({ message: 'Failed to record activity' });
  }
};

// @desc    Get all activities for admin
// @route   GET /api/activity
// @access  Private/Admin
const getActivities = async (req, res) => {
  try {
    const db = admin.firestore();
    const snapshot = await db.collection('activities')
      .orderBy('timestamp', 'desc')
      .limit(200) // Limit to last 200 activities for performance
      .get();

    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
};

module.exports = {
  recordActivity,
  getActivities
};
