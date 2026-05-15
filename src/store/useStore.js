import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getFriendlyErrorMessage } from '../utils/errorMessages';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      lastUid: null, // Track the UID of the last logged-in user
      setUser: (userData) => {
        if (userData) {
          // Store only necessary, serializable fields
          const cleanUser = {
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            phoneNumber: userData.phoneNumber
          };
          set({ user: cleanUser, lastUid: userData.uid });
        } else {
          set({ user: null });
        }
      },
      logout: () => set({ user: null }),
    }),
    { name: 'auth-storage' }
  )
);

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
      addItem: (product) => {
        if (product.inStock === false) {
          useToastStore.getState().showToast(`${product.name || 'Item'} is currently out of stock`, 'error');
          return;
        }
        const currentItems = get().items;
        const productId = product.id || product._id;
        const size = product.size || 'One Size';
        const cartItemId = `${productId}-${size}`;
        const existingItem = currentItems.find((item) => item.cartItemId === cartItemId);
        const productName = product?.name || product?.brand || 'Your item';
        
        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...product, id: productId, cartItemId, size, quantity: 1 }] });
        }

        useToastStore.getState().showToast(`${productName} added to your bag`);
      },
      removeItem: (cartItemId) => {
        set({ items: get().items.filter((item) => item.cartItemId !== cartItemId && item.id !== cartItemId) });
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            (item.cartItemId === cartItemId || item.id === cartItemId) ? { ...item, quantity } : item
          ),
        });
      },
      setItems: (items) => set({ items: items || [] }),
      clearCart: () => set({ items: [], appliedCoupon: null }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getDeliveryCharges: () => {
        return get().items.reduce((total, item) => total + (item.deliveryCharge || 0) * item.quantity, 0);
      },
    }),
    { name: 'cart-storage' }
  )
);

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      toggleWishlist: (product) => {
        const productId = product.id || product._id;
        const isExist = get().wishlist.find((item) => (item.id || item._id) === productId);
        if (isExist) {
          set({ wishlist: get().wishlist.filter((item) => (item.id || item._id) !== productId) });
        } else {
          set({ wishlist: [...get().wishlist, { ...product, id: productId }] });
        }
      },
      isInWishlist: (productId) => {
        return !!get().wishlist.find((item) => (item.id || item._id) === productId);
      },
      setWishlist: (wishlist) => set({ wishlist: wishlist || [] }),
      clearWishlist: () => set({ wishlist: [] }),
    }),
    { name: 'wishlist-storage' }
  )
);

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      clearOrders: () => set({ orders: [] }),
    }),
    { name: 'order-storage' }
  )
);

export const useUserStore = create(
  persist(
    (set, get) => ({
      addresses: [],
      addAddress: (address) => set({ addresses: [...get().addresses, { ...address, id: Date.now() }] }),
      removeAddress: (id) => set({ addresses: get().addresses.filter((a) => a.id !== id) }),
      clearUserData: () => set({ addresses: [] }),
    }),
    { name: 'user-data-storage' }
  )
);

export const useToastStore = create((set) => ({
  toasts: [],
  showToast: (message, type = 'success') => {
    const id = Date.now();
    const sanitizedMessage = type === 'error' ? getFriendlyErrorMessage(message) : message;
    
    set((state) => ({
      toasts: [...state.toasts, { id, message: sanitizedMessage, type }]
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
}));

export const useActivityStore = create(
  persist(
    (set, get) => ({
      visitedIds: [], // Array of strings
      searchTerms: [], // Array of strings
      
      trackProductVisit: (productId) => {
        if (!productId) return;
        const current = get().visitedIds;
        // Filter out existing to push to front
        const filtered = current.filter(id => id !== productId);
        // Limit to 20 items
        set({ visitedIds: [productId, ...filtered].slice(0, 20) });
      },
      
      trackSearch: (term) => {
        const trimmed = term?.trim().toLowerCase();
        if (!trimmed || trimmed.length < 2) return;
        
        const current = get().searchTerms;
        const filtered = current.filter(t => t !== trimmed);
        // Limit to 10 items
        set({ searchTerms: [trimmed, ...filtered].slice(0, 10) });
      },
      
      clearActivity: () => set({ visitedIds: [], searchTerms: [] }),
    }),
    { name: 'activity-storage' }
  )
);
