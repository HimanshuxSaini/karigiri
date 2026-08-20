const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Ensure firebase-admin is initialized in index.js before these routes are called.

/**
 * POST /api/notifications/subscribe
 * Subscribes a user's device token to Firestore.
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'FCM Token is required' });
    }

    // Save token to Firestore
    const db = admin.firestore();
    const tokenRef = db.collection('fcmTokens').doc(token);
    
    // Use set with merge: true to avoid overwriting or duplicates
    await tokenRef.set({
      token: token,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.status(200).json({ success: true, message: 'Token subscribed successfully' });
  } catch (error) {
    console.error('Error subscribing token:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

/**
 * POST /api/notifications/send
 * Sends a push notification to all subscribed devices.
 * Requires Admin privileges (could be secured via middleware).
 */
router.post('/send', async (req, res) => {
  try {
    const { title, body, image: imageUrl, url: clickAction } = req.body;
    
    // Basic validation
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required' });
    }

    const db = admin.firestore();
    
    // Fetch all tokens from Firestore
    const tokensSnapshot = await db.collection('fcmTokens').get();
    
    if (tokensSnapshot.empty) {
      return res.status(200).json({ success: true, message: 'No devices found to send notifications' });
    }

    const tokens = [];
    tokensSnapshot.forEach(doc => {
      tokens.push(doc.data().token);
    });

    // Create the message payload
    const message = {
      notification: {
        title: title,
        body: body,
        ...(imageUrl && { image: imageUrl })
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default'
        }
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        fcmOptions: {
          link: clickAction || 'https://prathamkarigiri.in'
        }
      },
      tokens: tokens
    };

    // Send the multicast message
    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Handle failures (e.g., removing invalid tokens)
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.error(`Failed to send to token ${tokens[idx]}: ${resp.error}`);
        }
      });
      
      // Cleanup invalid tokens from Firestore
      const batch = db.batch();
      failedTokens.forEach(token => {
        const tokenRef = db.collection('fcmTokens').doc(token);
        batch.delete(tokenRef);
      });
      await batch.commit();
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
