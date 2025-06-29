import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, PenTool } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const { toggleCart, cart, user } = useStore();
  
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
          
          <div className="flex items-center space-x-4">
            <Link to="/blog" className="text-gray-700 hover:text-indigo-600">
              Blog
            </Link>
            
            {user?.isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-indigo-600">
                Admin
              </Link>
            )}
            
            <Link to={user ? "/account" : "/login"}>
              <User className="h-6 w-6 text-gray-700 hover:text-indigo-600" />
            </Link>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="relative"
              onClick={toggleCart}
            >
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-indigo-600" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};