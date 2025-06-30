import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, CreditCard } from 'lucide-react';
import { area } from 'framer-motion/client';

const areas = [
  { id: 'Tartous', name: 'Tartous', cost: 5 },
  { id: 'Latakia', name: 'Latakia', cost: 7 },
  { id: 'Homs', name: 'Homs', cost: 10 },
  { id: 'Damascus', name: 'Damascus', cost: 12 },
  { id: 'Aleppo', name: 'Aleppo', cost: 15 },
];

export const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useStore();
  const [selectedArea, setSelectedArea] = useState(areas[0]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const total = subtotal + selectedArea.cost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const area = areas.find(a => a.id === e.target.value);
    if (area) setSelectedArea(area);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        area: selectedArea.name,
        products: cart.map(product => ({
          _id: product._id,
          name: product.name,
          quantity: product.quantity,
          price: product.price,
        })),
        subtotal:subtotal,
        total: total,
        status: 'pending',
      };

      // Send order to backend
      const response = await fetch('http://localhost:5000/api/sendorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        clearCart();
        navigate('/');
        alert('Order placed successfully! We will contact you soon.');
      } else {
        const errorData = await response.json();
        alert(`Error placing order: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some items to your cart before checkout.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Area *
                    </label>
                    <select
                      value={selectedArea.id}
                      onChange={handleAreaChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name} (+${area.cost.toFixed(2)} delivery)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter your complete address including street, building, and floor details"
                      required
                    />
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Place Order
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {cart.map((product) => (
                <div key={product._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={product.image.startsWith('http') ? product.image : `http://localhost:5000/uploads/${product.image}`}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=100';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-900">${(product.price * product.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery ({selectedArea.name})</span>
                <span>${selectedArea.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Payment:</strong> Cash on delivery. You can pay when your order arrives.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};