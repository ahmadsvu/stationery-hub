import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, FileText, ShoppingBag, Plus, Pencil, Trash2, Search, LogOut, Eye, X, Save, Settings, Lock, User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

interface Order {
  _id: string;
  name: string;
  phone: string;
  address: string;
  deliveryArea: string;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/product/get');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/product/update/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          category: editingProduct.category,
          stock: editingProduct.stock,
        }),
      });

      if (response.ok) {
        await fetchProducts();
        setIsEditModalOpen(false);
        setEditingProduct(null);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/product/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProducts(products.filter(product => product._id !== id));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img 
                        className="h-10 w-10 rounded-full object-cover" 
                        src={product.image.startsWith('http') ? product.image : `http://localhost:5000/uploads/${product.image}`}
                        alt={product.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=100';
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded hover:bg-indigo-50 transition-colors"
                    title="Edit product"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                    onClick={() => handleDeleteProduct(product._id)}
                    title="Delete product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Edit Product
              </Dialog.Title>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editingProduct && (
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock || 0}
                      onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="Notebooks">Notebooks</option>
                    <option value="Pens">Pens</option>
                    <option value="Paper">Paper</option>
                    <option value="Art Supplies">Art Supplies</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

const BlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'The Art of Journaling',
      content: 'Discover the therapeutic benefits of daily journaling...',
      date: '2024-01-15',
      author: 'John Doe',
    },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Blog Posts</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  By {post.author} • {new Date(post.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-gray-600 line-clamp-2">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Mock data for development
      setOrders([
        {
          _id: '1',
          name: 'Alice Johnson',
          phone: '+1234567890',
          address: '123 Main St, City',
          deliveryArea: 'Tartous',
          products: [
            { productId: '1', productName: 'Premium Notebook', quantity: 2, price: 24.99 }
          ],
          total: 5498, // Price in cents
          status: 'pending',
          createdAt: '2024-01-20T10:00:00Z',
        },
      ]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = async (order: Order) => {
    setIsLoadingOrder(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/getorder/${order._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const detailedOrder = await response.json();
        // Convert price from cents to dollars if needed
        if (detailedOrder.total > 1000) {
          detailedOrder.total = detailedOrder.total / 100;
        }
        setSelectedOrder(detailedOrder);
      } else {
        // Fallback to existing order data
        setSelectedOrder(order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Fallback to existing order data
      setSelectedOrder(order);
    } finally {
      setIsLoadingOrder(false);
      setIsOrderModalOpen(true);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status } : order
        ));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Orders</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id.slice(-6)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value as Order['status'])}
                    className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${(order.total > 1000 ? order.total / 100 : order.total).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleViewOrder(order)}
                    disabled={isLoadingOrder}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 p-1 rounded hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  >
                    {isLoadingOrder ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      <Dialog
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Order Details #{selectedOrder?._id.slice(-6)}
              </Dialog.Title>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Name:</strong> {selectedOrder.name}</p>
                      <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                      <p><strong>Delivery Area:</strong> {selectedOrder.deliveryArea}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </p>
                      <p><strong>Total:</strong> ${(selectedOrder.total > 1000 ? selectedOrder.total / 100 : selectedOrder.total).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.address}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {(selectedOrder.products || []).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

// Admin Settings Component
const AdminSettings = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate at least one field is being updated
    if (!formData.newUsername && !formData.newPassword) {
      setError('Please provide a new username or password');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const updateData: any = {
        currentPassword: formData.currentPassword,
      };

      if (formData.newUsername) {
        updateData.newUsername = formData.newUsername;
      }

      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch('http://localhost:5000/admin/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Admin credentials updated successfully!');
        setFormData({
          currentPassword: '',
          newUsername: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        // Update stored admin user if username changed
        if (formData.newUsername) {
          const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
          adminUser.username = formData.newUsername;
          localStorage.setItem('adminUser', JSON.stringify(adminUser));
        }
      } else {
        setError(data.message || 'Failed to update credentials');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsSettingsModalOpen(true)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
        title="Admin Settings"
      >
        <Settings className="h-4 w-4 mr-2" />
        Settings
      </motion.button>

      {/* Settings Modal */}
      <Dialog
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Settings
              </Dialog.Title>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2"
              >
                <Check className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-600">{success}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Update Credentials</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Username (optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        name="newUsername"
                        value={formData.newUsername}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter new username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password (optional)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  {formData.newPassword && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Update Settings
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        setIsAuthenticated(true);
      } else {
        navigate('/admin/login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Blog Posts', href: '/admin/blog-posts', icon: FileText },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        </div>
        <nav className="mt-6 flex-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-indigo-600 bg-indigo-50 border-r-2 border-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t space-y-2">
          <AdminSettings />
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <Routes>
          <Route path="products" element={<Products />} />
          <Route path="blog-posts" element={<BlogPosts />} />
          <Route path="orders" element={<Orders />} />
          <Route path="" element={<Products />} />
        </Routes>
      </div>
    </div>
  );
};