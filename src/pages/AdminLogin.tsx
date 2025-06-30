import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      
      // Try multiple endpoints to check server connectivity
      const endpoints = [
        'http://localhost:5000/product/get',
        'http://localhost:5000/blog/getblogs',
        'http://localhost:5000/api/health', // If you have a health check endpoint
      ];

      let isConnected = false;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
          });
          
          // If any endpoint responds (even with an error), server is running
          if (response.status < 500) {
            isConnected = true;
            break;
          }
        } catch (err) {
          // Continue to next endpoint
          continue;
        }
      }

      setConnectionStatus(isConnected ? 'online' : 'offline');
      return isConnected;
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('offline');
      return false;
    }
  };

  React.useEffect(() => {
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { username: formData.username });
      
      const response = await fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, get text response
        const textResponse = await response.text();
        console.log('Non-JSON response:', textResponse);
        throw new Error('Server returned non-JSON response');
      }

      console.log('Response data:', data);

      if (response.ok) {
        // Handle successful authentication without requiring a token
        const adminData = data.admin || data.user || data.data || { 
          username: formData.username,
          id: data.id || 'admin',
          role: 'admin'
        };

        // Store admin session data (no token required)
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        localStorage.setItem('adminLoginTime', new Date().toISOString());
        
        // Update connection status to online since login worked
        setConnectionStatus('online');
        
        // Clear form
        setFormData({ username: '', password: '' });
        
        console.log('Login successful, navigating to admin dashboard');
        
        // Navigate to admin dashboard
        navigate('/admin/products');
      } else {
        // Authentication failed but server is responding
        setConnectionStatus('online');
        
        // Handle different error response formats
        const errorMessage = data.message || data.error || data.msg || 'Invalid username or password';
        setError(errorMessage);
        console.log('Login failed:', errorMessage);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timeout. Please check your connection and try again.');
        setConnectionStatus('offline');
      } else if (err.message?.includes('fetch') || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please ensure the backend is running on localhost:5000.');
        setConnectionStatus('offline');
      } else if (err.message?.includes('JSON')) {
        setError('Server response format error. Please check backend configuration.');
        setConnectionStatus('online'); // Server is responding but with wrong format
      } else {
        setError(`Unexpected error: ${err.message || 'Please try again.'}`);
        // Don't change connection status for unexpected errors
      }
    } finally {
      setIsLoading(false);
    }
  };

  const ConnectionIndicator = () => (
    <div className="flex items-center justify-center gap-2 text-sm mb-4">
      {connectionStatus === 'online' && (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Server connected</span>
        </>
      )}
      {connectionStatus === 'offline' && (
        <>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <WifiOff className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Server offline</span>
        </>
      )}
      {connectionStatus === 'checking' && (
        <>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <RefreshCw className="animate-spin h-4 w-4 text-yellow-600" />
          <span className="text-yellow-600">Checking connection...</span>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access the admin dashboard
            </p>
          </div>

          <ConnectionIndicator />

          {connectionStatus === 'offline' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Server Connection Failed</p>
                  <p className="text-sm text-red-700">Please ensure the backend server is running on port 5000.</p>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={checkConnection}
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 mx-auto"
              disabled={isLoading || connectionStatus === 'checking'}
            >
              <RefreshCw className={`h-4 w-4 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
              Check Connection
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};