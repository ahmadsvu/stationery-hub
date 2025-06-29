import React, { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios'; // إذا كنت تفضل axios

const categories = ['All', 'Notebooks', 'Pens', 'Paper', 'Art Supplies'];

const priceRanges = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-10', label: 'Under $10', min: 0, max: 10 },
  { id: '10-25', label: '$10 - $25', min: 10, max: 25 },
  { id: '25-50', label: '$25 - $50', min: 25, max: 50 },
  { id: 'over-50', label: 'Over $50', min: 50, max: Infinity },
];

export const Home = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ جلب البيانات من API عند تحميل الصفحة
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(' http://localhost:5000/product/get'); 
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        console.log(data)
        setProducts(data.products || []);
      } catch (err: any) {
        setError(err.message || 'Error fetching products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedPriceRange('all'); // Reset price range when category changes
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    const priceRange = priceRanges.find((range) => range.id === selectedPriceRange);
    const matchesPrice = priceRange
      ? product.price >= priceRange.min && product.price <= priceRange.max
      : true;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Our Premium Stationery
        </h1>
        <p className="text-gray-600 text-lg">
          Find the perfect tools for your creative journey
        </p>
      </div>

      {/* ✅ إدخال البحث والفلاتر */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="text-gray-400 flex-shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <AnimatePresence>
            {selectedCategory !== 'All' && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-2 flex-1"
              >
                <DollarSign className="text-gray-400 flex-shrink-0" />
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {priceRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ✅ عرض الرسائل أو المنتجات */}
      {loading ? (
        <p className="text-center text-gray-500">Loading products...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </motion.div>
      )}
    </div>
  );
};
