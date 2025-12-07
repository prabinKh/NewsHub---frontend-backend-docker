'use client';

import { useEffect, useState } from 'react';
import { newsAPI } from '@/lib/api';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  articles_count: number;
  created_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await newsAPI.getCategories();
      // Handle paginated response
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="flex items-center mb-8">
          <FolderOpen className="w-10 h-10 mr-3 text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold">Categories</h1>
            <p className="text-gray-600 mt-2">Browse articles by category</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{category.name}</h3>
                  <p className="text-gray-600 mb-4">{category.description || 'No description available'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {category.articles_count} {category.articles_count === 1 ? 'article' : 'articles'}
                    </span>
                    <span className="text-blue-600 hover:underline">View Articles →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}