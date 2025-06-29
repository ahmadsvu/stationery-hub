import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, FileText, ShoppingBag, Plus, Pencil, Trash2, Search, LogOut, Eye, X, Save, Upload, Wifi, WifiOff, AlertCircle } from 'lucide-react';
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
  _id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  image?: string;
}

interface Order {
  _id: string;
  name: string;
  phone: string;
  address: string;
  deliveryArea: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

// Connection status hook
const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/product/get', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      const isOk = response.ok;
      setIsConnected(isOk);
      setLastChecked(new Date());
      return isOk;
    } catch (error) {
      setIsConnected(false);
      setLastChecked(new Date());
      return false;
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { isConnected, lastChecked, checkConnection };
};

const ConnectionStatus = () => {
  const { isConnected, lastChecked, checkConnection } = useConnectionStatus();

  const getStatusColor = () => {
    if (isConnected === null) return 'bg-yellow-400';
    return isConnected ? 'bg-green-400' : 'bg-red-400';
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Checking...';
    return isConnected ? 'Connected' : 'Offline Mode';
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-gray-600">{getStatusText()}</span>
      {lastChecked && (
        <span className="text-gray-400 text-xs">
          {lastChecked.toLocaleTimeString()}
        </span>
      )}
      <button
        onClick={checkConnection}
        className="text-indigo-600 hover:text-indigo-800 text-xs underline"
      >
        Refresh
      </button>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const { isConnected } = useConnectionStatus();

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setConnectionError('');
      
      const response = await fetch('http://localhost:5000/product/get');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      console.log('Products API Response:', data);
      
      // Handle different possible response structures
      const productsArray = data.products || data.data || data || [];
      setProducts(Array.isArray(productsArray) ? productsArray : []);
      
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setConnectionError(error.message);
      
      // Fallback to mock data when backend is not available
      setProducts([
        {
          _id: 'mock-1',
          name: 'Premium Notebook',
          description: 'High-quality paper notebook with leather cover',
          price: 24.99,
          image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
          category: 'Notebooks',
          stock: 50,
        },
        {
          _id: 'mock-2',
          name: 'Fountain Pen Set',
          description: 'Elegant fountain pen with multiple ink cartridges',
          price: 45.99,
          image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=400',
          category: 'Pens',
          stock: 25,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setEditingProduct({
      _id: '',
      name: '',
      description: '',
      price: 0,
      image: '',
      category: 'Notebooks',
      stock: 0,
    });
    setIsAddModalOpen(true);
  };

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
      const isEditing = editingProduct._id && !editingProduct._id.startsWith('mock-');
      
      const url = isEditing 
        ? `http://localhost:5000/product/update/${editingProduct._id}`
        : 'http://localhost:5000/product/add';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
          image: editingProduct.image,
        }),
      });

      if (response.ok) {
        await fetchProducts();
        setIsEditModalOpen(false);
        setIsAddModalOpen(false);
        setEditingProduct(null);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to save product'}`);
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`Connection error: ${error.message}`);
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
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete product'}`);
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(`Connection error: ${error.message}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setEditingProduct({
          ...editingProduct,
          image: data.filename || data.path || data.url
        });
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Manage Products</h2>
          <ConnectionStatus />
        </div>
        <button 
          onClick={handleAddProduct}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {connectionError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 font-medium">Backend Connection Issue</p>
            <p className="text-yellow-700 text-sm">Using offline mode with sample data. Error: {connectionError}</p>
          </div>
        </div>
      )}

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

      {/* Product Modal (Add/Edit) */}
      <Dialog
        open={isEditModalOpen || isAddModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setIsAddModalOpen(false);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                {isAddModalOpen ? 'Add New Product' : 'Edit Product'}
              </Dialog.Title>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsAddModalOpen(false);
                }}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      placeholder="Or enter image URL"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {editingProduct.image && (
                      <img
                        src={editingProduct.image.startsWith('http') ? editingProduct.image : `http://localhost:5000/uploads/${editingProduct.image}`}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=100';
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsAddModalOpen(false);
                    }}
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
                        {isAddModalOpen ? 'Add Product' : 'Save Changes'}
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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true);
      setConnectionError('');
      
      const response = await fetch('http://localhost:5000/blog/getblogs');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      console.log('Blog Posts API Response:', data);
      
      // Handle different possible response structures
      const postsArray = data.blogs || data.data || data || [];
      setPosts(Array.isArray(postsArray) ? postsArray : []);
      
    } catch (error: any) {
      console.error('Error fetching blog posts:', error);
      setConnectionError(error.message);
      
      // Fallback to mock data
      setPosts([
        {
          _id: 'mock-blog-1',
          title: 'The Art of Journaling',
          content: 'Discover the therapeutic benefits of daily journaling and how it can enhance your creativity...',
          date: '2024-01-15',
          author: 'John Doe',
          image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80',
        },
        {
          _id: 'mock-blog-2',
          title: 'Choosing the Perfect Fountain Pen',
          content: 'A comprehensive guide to selecting the ideal fountain pen for your writing style...',
          date: '2024-01-10',
          author: 'Jane Smith',
          image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const handleAddPost = () => {
    setEditingPost({
      _id: '',
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      author: '',
      image: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const isEditing = editingPost._id && !editingPost._id.startsWith('mock-');
      
      const url = isEditing 
        ? `http://localhost:5000/blog/updateblog/${editingPost._id}`
        : 'http://localhost:5000/blog/addblogs';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingPost.title,
          content: editingPost.content,
          author: editingPost.author,
          date: editingPost.date,
          image: editingPost.image,
        }),
      });

      if (response.ok) {
        await fetchBlogPosts();
        setIsEditModalOpen(false);
        setIsAddModalOpen(false);
        setEditingPost(null);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to save blog post'}`);
      }
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      alert(`Connection error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/blog/deleteblog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPosts(posts.filter(post => post._id !== id));
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete blog post'}`);
      }
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      alert(`Connection error: ${error.message}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPost) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setEditingPost({
          ...editingPost,
          image: data.filename || data.path || data.url
        });
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Manage Blog Posts</h2>
          <ConnectionStatus />
        </div>
        <button 
          onClick={handleAddPost}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {connectionError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 font-medium">Backend Connection Issue</p>
            <p className="text-yellow-700 text-sm">Using offline mode with sample data. Error: {connectionError}</p>
          </div>
        </div>
      )}

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search blog posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  By {post.author} • {new Date(post.date).toLocaleDateString()}
                </p>
                <p className="mt-2 text-gray-600 line-clamp-2">{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="mt-3 w-32 h-20 object-cover rounded-md"
                  />
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button 
                  onClick={() => handleEditPost(post)}
                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                  title="Edit post"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeletePost(post._id)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Blog Post Modal (Add/Edit) */}
      <Dialog
        open={isEditModalOpen || isAddModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setIsAddModalOpen(false);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                {isAddModalOpen ? 'Add New Blog Post' : 'Edit Blog Post'}
              </Dialog.Title>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsAddModalOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editingPost && (
              <form onSubmit={handleSavePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <input
                      type="text"
                      value={editingPost.author}
                      onChange={(e) => setEditingPost({...editingPost, author: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={editingPost.date}
                      onChange={(e) => setEditingPost({...editingPost, date: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      placeholder="Or enter image URL"
                      value={editingPost.image || ''}
                      onChange={(e) => setEditingPost({...editingPost, image: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {editingPost.image && (
                      <img
                        src={editingPost.image}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsAddModalOpen(false);
                    }}
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
                        {isAddModalOpen ? 'Publish Post' : 'Save Changes'}
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

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setConnectionError('');
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/getorder', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      console.log('Orders API Response:', data);
      
      // Handle different possible response structures
      const ordersArray = data.orders || data.data || data || [];
      setOrders(Array.isArray(ordersArray) ? ordersArray : []);
      
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setConnectionError(error.message);
      
      // Fallback to mock data for development
      setOrders([
        {
          _id: 'mock-order-1',
          name: 'Alice Johnson',
          phone: '+1234567890',
          address: '123 Main St, City',
          deliveryArea: 'Tartous',
          items: [
            { productId: '1', productName: 'Premium Notebook', quantity: 2, price: 24.99 }
          ],
          total: 54.98,
          status: 'pending',
          createdAt: '2024-01-20T10:00:00Z',
        },
        {
          _id: 'mock-order-2',
          name: 'Bob Smith',
          phone: '+1987654321',
          address: '456 Oak Ave, Town',
          deliveryArea: 'Latakia',
          items: [
            { productId: '2', productName: 'Fountain Pen Set', quantity: 1, price: 45.99 },
            { productId: '3', productName: 'Watercolor Paper', quantity: 3, price: 18.99 }
          ],
          total: 108.96,
          status: 'processing',
          createdAt: '2024-01-19T14:30:00Z',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
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
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to update order status'}`);
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      // Update locally for offline mode
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Manage Orders</h2>
          <ConnectionStatus />
        </div>
        <button
          onClick={fetchOrders}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Refresh Orders
        </button>
      </div>

      {connectionError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 font-medium">Backend Connection Issue</p>
            <p className="text-yellow-700 text-sm">Using offline mode with sample data. Error: {connectionError}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.name}</div>
                      <div className="text-sm text-gray-500">{order.phone}</div>
                    </div>
                  </td>
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
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewOrder(order)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 p-1 rounded hover:bg-indigo-50 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      )}

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
                      <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
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
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-lg">${selectedOrder.total.toFixed(2)}</span>
                    </div>
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
        <div className="p-6 border-t">
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