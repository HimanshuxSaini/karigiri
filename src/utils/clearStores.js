import { useCartStore, useWishlistStore, useOrderStore, useUserStore } from '../store/useStore';

export const clearAllStores = () => {
  useCartStore.getState().clearCart();
  useWishlistStore.getState().clearWishlist();
  useOrderStore.getState().clearOrders();
  useUserStore.getState().clearUserData();
};
