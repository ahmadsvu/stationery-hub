import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem, User } from '../types';

interface StoreState {
  user: User | null;
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCart: () => void;
  setUser: (user: User | null) => void;
  clearCart: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      cart: [],
      isCartOpen: false,
      addToCart: (product) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setUser: (user) => set({ user }),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'stationery-store',
    }
  )
);