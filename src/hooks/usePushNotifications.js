import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase/config';
import { useToastStore } from '../store/useStore';

export const usePushNotifications = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [permission, setPermission] = useState('Notification' in window ? Notification.permission : 'denied');

  const requestPermission = async () => {
    try {
      if (permission === 'granted') {
        await generateToken();
        return;
      }
      if (!('Notification' in window)) {
        console.warn('Push notifications are not supported in this browser.');
        return;
      }
      
      const p = await Notification.requestPermission();
      setPermission(p);
      
      if (p === 'granted') {
        await generateToken();
      } else {
        console.log('Push notification permission denied.');
      }
    } catch (error) {
      console.error('Error requesting push notification permission:', error);
    }
  };

  const generateToken = async () => {
    try {
      if (!messaging) return;
      
      // We will read VAPID key from env variables
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.warn('VITE_FIREBASE_VAPID_KEY is missing. Push notifications cannot be registered.');
        return;
      }

      // Wait for the Vite PWA service worker to be ready/active
      const registration = await navigator.serviceWorker.ready;

      const currentToken = await getToken(messaging, { 
        vapidKey,
        serviceWorkerRegistration: registration
      });
      
      if (currentToken) {
        setFcmToken(currentToken);
        await subscribeTokenToBackend(currentToken);
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
    }
  };

  const subscribeTokenToBackend = async (token) => {
    try {
      // Avoid resubscribing if we already did it this session
      if (sessionStorage.getItem('fcmTokenSubscribed') === token) {
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (res.ok) {
        console.log('Successfully subscribed to push notifications');
        sessionStorage.setItem('fcmTokenSubscribed', token);
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications via backend', error);
    }
  };

  // Listen to foreground messages
  useEffect(() => {
    if (!messaging) return;
    
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Received foreground message ', payload);
      const title = payload?.notification?.title || 'New Notification';
      const body = payload?.notification?.body || '';
      useToastStore.getState().showToast(`${title}: ${body}`, 'success');
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return {
    requestPermission,
    permission,
    fcmToken
  };
};
