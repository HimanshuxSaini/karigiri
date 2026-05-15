import { useEffect, useRef } from 'react';
import { useWishlistStore, useAuthStore } from '../store/useStore';
import { saveWishlistToFirestore, fetchWishlistFromFirestore } from '../services/api';

/**
 * Smart hook that automatically keeps the user's local Zustand wishlist synchronized 
 * with their Firestore document across devices.
 * Includes automatic guest-wishlist merging and debounced API writes.
 */
export const useWishlistSync = () => {
  const { user } = useAuthStore();
  const { wishlist, setWishlist } = useWishlistStore();
  
  const lastSyncedRef = useRef(null);
  const initialLoadRef = useRef(false);

  // 1. Automatically fetch and merge remote wishlist from database when a user logs in
  useEffect(() => {
    const syncFromDb = async () => {
      if (user?.uid) {
        try {
          const remoteItems = await fetchWishlistFromFirestore(user.uid);
          
          if (remoteItems && remoteItems.length > 0) {
            const localItems = useWishlistStore.getState().wishlist;
            
            // Merge Strategy: Combine remote items and guest items gracefully
            const mergedMap = new Map();
            
            // Add remote items first
            remoteItems.forEach(item => {
              const key = item.id || item._id;
              if (key) mergedMap.set(key, item);
            });
            
            // Overlay guest items (so user retains what they just favorited as guest)
            localItems.forEach(item => {
              const key = item.id || item._id;
              if (key) mergedMap.set(key, item);
            });
            
            const mergedList = Array.from(mergedMap.values());
            
            setWishlist(mergedList);
            lastSyncedRef.current = JSON.stringify(mergedList);
            
            // If there were guest items, automatically push the merged state immediately
            if (localItems.length > 0) {
              await saveWishlistToFirestore(user.uid, mergedList);
            }
          } else {
            // If database wishlist was empty but they have guest items, push local to Firestore immediately
            const localItems = useWishlistStore.getState().wishlist;
            if (localItems.length > 0) {
              await saveWishlistToFirestore(user.uid, localItems);
              lastSyncedRef.current = JSON.stringify(localItems);
            }
          }
        } catch (error) {
          console.error("Failed syncing wishlist on login:", error);
        } finally {
          initialLoadRef.current = true;
        }
      } else {
        // Reset trackers on logout
        initialLoadRef.current = false;
        lastSyncedRef.current = null;
      }
    };
    
    syncFromDb();
  }, [user?.uid, setWishlist]);

  // 2. Reactively push local wishlist modifications to Firestore (Debounced)
  useEffect(() => {
    // Ensure user is logged in AND we have already processed the initial sync/merge
    if (!user?.uid || !initialLoadRef.current) return;

    const currentSerialized = JSON.stringify(wishlist);
    if (lastSyncedRef.current === currentSerialized) return;

    // Debounce write operation by 1.5 seconds to aggregate rapid toggle taps
    const handler = setTimeout(async () => {
      try {
        await saveWishlistToFirestore(user.uid, wishlist);
        lastSyncedRef.current = currentSerialized;
      } catch (error) {
        console.error("Failed saving wishlist change:", error);
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [wishlist, user?.uid]);
};
