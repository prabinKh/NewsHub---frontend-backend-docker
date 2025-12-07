'use client';

import { useEffect, useState } from 'react';
import { newsAPI } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { FolderOpen } from 'lucide-react';
import { use } from 'react';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featured_image: string | null;
  author_name: string;
  category_name: string;
  tags: Array<{ id: string; name: string }>;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  published_at: string;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  articles_count: number;
  created_at: string;
}

export default function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap the params Promise
  const unwrappedParams = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (unwrappedParams.slug) {
      fetchCategory(unwrappedParams.slug);
      fetchArticles(unwrappedParams.slug);
    } else {
      setLoading(false);
    }
  }, [unwrappedParams.slug]);

  const fetchCategory = async (slug: string) => {
    try {
      const response = await newsAPI.getCategories();
      // Handle paginated response
      const allCategories = response.data.results || response.data;
      const foundCategory = allCategories.find((cat: Category) => cat.slug === slug);
      setCategory(foundCategory || null);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const fetchArticles = async (slug: string) => {
    try {
      const response = await newsAPI.getArticles({ category: slug });
      setArticles(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
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
        {category ? (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FolderOpen className="w-8 h-8 mr-2 text-blue-600" />
              <h1 className="text-3xl font-bold">{category.name}</h1>
            </div>
            <p className="text-gray-600 mb-2">{category.description || 'No description available'}</p>
            <p className="text-sm text-gray-500">
              {category.articles_count} {category.articles_count === 1 ? 'article' : 'articles'}
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Category Not Found</h1>
          </div>
        )}

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No articles found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}