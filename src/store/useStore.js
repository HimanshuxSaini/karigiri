import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
            photoURL: userData.photoURL
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
      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);
        
        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
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
        const isExist = get().wishlist.find((item) => item.id === product.id);
        if (isExist) {
          set({ wishlist: get().wishlist.filter((item) => item.id !== product.id) });
        } else {
          set({ wishlist: [...get().wishlist, product] });
        }
      },
      isInWishlist: (productId) => {
        return !!get().wishlist.find((item) => item.id === productId);
      },
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
      paymentMethods: [],
      addAddress: (address) => set({ addresses: [...get().addresses, { ...address, id: Date.now() }] }),
      removeAddress: (id) => set({ addresses: get().addresses.filter((a) => a.id !== id) }),
      addPaymentMethod: (payment) => set({ paymentMethods: [...get().paymentMethods, { ...payment, id: Date.now() }] }),
      removePaymentMethod: (id) => set({ paymentMethods: get().paymentMethods.filter((p) => p.id !== id) }),
      clearUserData: () => set({ addresses: [], paymentMethods: [] }),
    }),
    { name: 'user-data-storage' }
  )
);
