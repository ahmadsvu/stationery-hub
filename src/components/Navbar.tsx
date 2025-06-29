import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, PenTool } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const { toggleCart, cart } = useStore();
  
  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <PenTool className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">StationeryHub</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/blog" 
              className="text-gray-700 hover:text-indigo-600 transition-colors font-medium"
            >
              Blog
            </Link>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="relative"
              onClick={toggleCart}
            >
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-indigo-600 transition-colors" />
              {cart.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                >
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};