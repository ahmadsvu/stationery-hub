import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  image?: string;
  date: string;
  author: string;
}

export const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/blog/getblogs');
        if (!response.ok) throw new Error('Failed to fetch blog posts');
        const data = await response.json();
        
        // Handle different possible response structures
        const postsArray = data.blogs || data.data || data || [];
        setBlogPosts(Array.isArray(postsArray) ? postsArray : []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        // Fallback to sample data
        setBlogPosts([
          {
            _id: '1',
            title: 'The Art of Journaling',
            content: 'Discover how daily journaling can enhance your creativity and productivity. Writing by hand has been shown to improve memory retention and help process emotions more effectively...',
            image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80',
            date: '2024-02-28',
            author: 'Sarah Johnson',
          },
          {
            _id: '2',
            title: 'Choosing the Perfect Fountain Pen',
            content: 'A comprehensive guide to selecting your ideal fountain pen. From nib sizes to ink flow, learn what makes each pen unique and how to find the perfect match for your writing style...',
            image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80',
            date: '2024-02-25',
            author: 'Michael Chen',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid gap-8">
          {blogPosts.map((post) => (
            <motion.article
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <img
                    className="h-48 w-full md:w-48 object-cover"
                    src={post.image || 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80'}
                    alt={post.title}
                  />
                </div>
                <div className="p-8">
                  <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-gray-900">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-gray-500">{post.content}</p>
                  <div className="mt-4 flex items-center">
                    <div className="text-sm">
                      <p className="text-gray-600">By {post.author}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
};