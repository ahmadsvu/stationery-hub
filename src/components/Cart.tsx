import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

export const Cart = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, clearCart } = useStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<string | null>(null);
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleDeleteConfirm = () => {
    if (itemToDelete === 'all') {
      clearCart();
    } else if (itemToDelete) {
      removeFromCart(itemToDelete);
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const openDeleteDialog = (id: string | 'all') => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleCart}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Cart</h2>
                  <div className="flex items-center gap-2">
                    {cart.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openDeleteDialog('all')}
                        className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                        title="Clear cart"
                      >
                        <Trash2 className="h-5 w-5" />
                      </motion.button>
                    )}
                    <button 
                      onClick={toggleCart}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1">
                  <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add some items to get started</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={item.image.startsWith('http') ? item.image : `http://localhost:5000/uploads/${item.image}`}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=100';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                            <p className="text-indigo-600 font-semibold">${item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => updateQuantity(item._id, Math.max(0, item.quantity - 1))}
                                className="p-1 rounded-full hover:bg-white transition-colors"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="font-medium min-w-[20px] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                className="p-1 rounded-full hover:bg-white transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteDialog(item._id)}
                            className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-white transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-medium">Total</span>
                      <span className="text-2xl font-bold text-indigo-600">${total.toFixed(2)}</span>
                    </div>
                    <Link
                      to="/checkout"
                      onClick={toggleCart}
                      className="block w-full bg-indigo-600 text-white text-center py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </Dialog.Title>
            <Dialog.Description className="text-gray-500 mb-6">
              {itemToDelete === 'all' 
                ? 'Are you sure you want to clear your entire cart?' 
                : 'Are you sure you want to remove this item from your cart?'}
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};