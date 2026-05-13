import { useEffect, useRef } from 'react';
import { useCartStore, useAuthStore } from '../store/useStore';
import { saveCartToFirestore, fetchCartFromFirestore } from '../services/api';

/**
 * Smart hook that automatically keeps the user's local Zustand cart synchronized 
 * with their Firestore document across devices.
 * Includes automatic guest-cart merging and debounced API writes.
 */
export const useCartSync = () => {
  const { user } = useAuthStore();
  const { items, setItems } = useCartStore();
  
  const lastSyncedRef = useRef(null);
  const initialLoadRef = useRef(false);

  // 1. Automatically fetch and merge remote cart from database when a user logs in
  useEffect(() => {
    const syncFromDb = async () => {
      if (user?.uid) {
        try {
          const remoteItems = await fetchCartFromFirestore(user.uid);
          
          if (remoteItems && remoteItems.length > 0) {
            const localItems = useCartStore.getState().items;
            
            // Merge Strategy: Combine remote items and guest items gracefully
            const mergedMap = new Map();
            
            // Add remote items first
            remoteItems.forEach(item => {
              const key = item.cartItemId || `${item.id}-${item.size || 'One Size'}`;
              mergedMap.set(key, item);
            });
            
            // Overlay guest items (so user retains what they just put in their bag as guest)
            localItems.forEach(item => {
              const key = item.cartItemId || `${item.id}-${item.size || 'One Size'}`;
              mergedMap.set(key, item); // Guest items take precedence or add unique new items
            });
            
            const mergedList = Array.from(mergedMap.values());
            
            setItems(mergedList);
            lastSyncedRef.current = JSON.stringify(mergedList);
            
            // If there were guest items, automatically push the merged state immediately
            if (localItems.length > 0) {
              await saveCartToFirestore(user.uid, mergedList);
            }
          } else {
            // If database cart was empty but they have guest items, push local to Firestore immediately
            const localItems = useCartStore.getState().items;
            if (localItems.length > 0) {
              await saveCartToFirestore(user.uid, localItems);
              lastSyncedRef.current = JSON.stringify(localItems);
            }
          }
        } catch (error) {
          console.error("Failed syncing cart on login:", error);
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
  }, [user?.uid, setItems]);

  // 2. Reactively push local cart modifications to Firestore (Debounced)
  useEffect(() => {
    // Ensure user is logged in AND we have already processed the initial sync/merge
    if (!user?.uid || !initialLoadRef.current) return;

    const currentSerialized = JSON.stringify(items);
    if (lastSyncedRef.current === currentSerialized) return;

    // Debounce write operation by 1.5 seconds to aggregate rapid quantity toggles
    const handler = setTimeout(async () => {
      try {
        await saveCartToFirestore(user.uid, items);
        lastSyncedRef.current = currentSerialized;
      } catch (error) {
        console.error("Failed saving cart change:", error);
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [items, user?.uid]);
};
