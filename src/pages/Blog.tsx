import React from 'react';
import { motion } from 'framer-motion';

const blogPosts = [
  {
    id: '1',
    title: 'The Art of Journaling',
    content: 'Discover how daily journaling can enhance your creativity and productivity...',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80',
    date: '2024-02-28',
    author: 'Sarah Johnson',
  },
  {
    id: '2',
    title: 'Choosing the Perfect Fountain Pen',
    content: 'A comprehensive guide to selecting your ideal fountain pen...',
    image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80',
    date: '2024-02-25',
    author: 'Michael Chen',
  },
];

export const Blog = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>
      
      <div className="grid gap-8">
        {blogPosts.map((post) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <img
                  className="h-48 w-full md:w-48 object-cover"
                  src={post.image}
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
    </div>
  );
};