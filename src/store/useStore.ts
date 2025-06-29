import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '../types';

interface StoreState {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cart: [],
      isCartOpen: false,
      addToCart: (product) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item._id === product._id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item._id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: quantity === 0 
            ? { cart: state.cart.filter((item) => item._id !== productId) }
            : { cart: state.cart.map((item) =>
                item._id === productId ? { ...item, quantity } : item
              )}
        })),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'stationery-store',
    }
  )
);