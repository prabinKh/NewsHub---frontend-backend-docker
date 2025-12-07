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

export default function CategoryBar() {
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
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container-custom">
          <div className="flex space-x-4 overflow-x-auto">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 py-3 sticky top-16 z-40">
      <div className="container-custom">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          <Link 
            href="/"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap hover:bg-blue-200 transition"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="font-medium">Home</span>
          </Link>
          
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 whitespace-nowrap hover:bg-gray-200 transition"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}