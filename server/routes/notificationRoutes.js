const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const FCMToken = require('../models/FCMToken');

/**
 * POST /api/notifications/subscribe
 * Subscribes a user's device token to MongoDB.
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'FCM Token is required' });
    }

    // Save token to MongoDB (upsert)
    await FCMToken.findOneAndUpdate(
      { token },
      { lastActive: new Date() },
      { upsert: true, returnDocument: 'after' }
    );

    res.status(200).json({ success: true, message: 'Token subscribed successfully' });
  } catch (error) {
    console.error('Error subscribing token:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * POST /api/notifications/send
 * Sends a push notification to all subscribed devices.
 */
router.post('/send', async (req, res) => {
  try {
    const { title, body, image: imageUrl, url: clickAction } = req.body;
    
    // Basic validation
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }

    // Fetch all tokens from MongoDB
    const tokensDocs = await FCMToken.find({});
    
    if (tokensDocs.length === 0) {
      return res.status(200).json({ success: true, message: 'No devices found to send notifications' });
    }

    const tokens = tokensDocs.map(doc => doc.token);

    const cleanImageUrl = imageUrl && typeof imageUrl === 'string' ? imageUrl.trim() : '';

    // Create the message payload
    const message = {
      notification: {
        title: title,
        body: body,
        ...(cleanImageUrl ? { imageUrl: cleanImageUrl } : {})
      },
      data: {
        title: String(title),
        body: String(body),
        url: String(clickAction || 'https://prathamkarigiri.in'),
        icon: 'https://prathamkarigiri.in/pwa-192x192.png',
        image: cleanImageUrl,
        imageUrl: cleanImageUrl
      },
      android: {
        priority: 'high',
        notification: {
          title: title,
          body: body,
          sound: 'default',
          icon: 'https://prathamkarigiri.in/pwa-192x192.png',
          ...(cleanImageUrl ? { imageUrl: cleanImageUrl } : {})
        }
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          title: title,
          body: body,
          icon: 'https://prathamkarigiri.in/pwa-192x192.png',
          badge: 'https://prathamkarigiri.in/pwa-192x192.png',
          ...(cleanImageUrl ? { image: cleanImageUrl } : {})
        },
        fcmOptions: {
          link: clickAction || 'https://prathamkarigiri.in'
        }
      },
      tokens: tokens
    };

    // Send the multicast message
    const { getMessaging } = require('firebase-admin/messaging');
    const response = await getMessaging().sendEachForMulticast(message);
    
    // Handle failures (e.g., removing invalid tokens)
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.error(`Failed to send to token ${tokens[idx]}: ${resp.error}`);
        }
      });
      
      // Cleanup invalid tokens from MongoDB
      await FCMToken.deleteMany({ token: { $in: failedTokens } });
      console.log(`Cleaned up ${failedTokens.length} invalid tokens.`);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Notifications sent',
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
