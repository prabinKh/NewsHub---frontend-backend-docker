'use client';

import { useEffect, useState } from 'react';
import { newsAPI } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { Newspaper, TrendingUp, Search, FolderOpen } from 'lucide-react';
import Link from 'next/link';

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

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArticles();
    fetchFeaturedArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await newsAPI.getArticles({ page_size: 12 });
      setArticles(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedArticles = async () => {
    try {
      const response = await newsAPI.getFeatured();
      setFeaturedArticles(response.data.articles || []);
    } catch (error) {
      console.error('Error fetching featured articles:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await newsAPI.getCategories();
      // Handle paginated response
      setCategories((response.data.results || response.data).slice(0, 6)); // Show only first 6 categories
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await newsAPI.getArticles({ search: searchQuery });
      setArticles(response.data.results || response.data);
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">
              Discover Amazing Stories
            </h1>
            <p className="text-xl mb-8 text-blue-50">
              Read the latest news and articles from talented writers around the world
            </p>

            {/* Search Bar */}
       
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center">
                <TrendingUp className="w-8 h-8 mr-2 text-blue-600" />
                Featured Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.slice(0, 3).map((article) => (
                <ArticleCard key={article.id} article={article} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center">
                <FolderOpen className="w-8 h-8 mr-2 text-blue-600" />
                Categories
              </h2>
              <Link href="/categories" className="text-blue-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/categories/${category.slug}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 text-center"
                >
                  <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                  <p className="text-xs text-gray-700 mt-1">
                    {category.articles_count} {category.articles_count === 1 ? 'article' : 'articles'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center">
              <Newspaper className="w-8 h-8 mr-2 text-blue-600" />
              Latest Articles
            </h2>
            <Link href="/trending" className="text-blue-600 hover:underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-800 text-lg">No articles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Start Writing Today</h2>
          <p className="text-xl text-gray-800 mb-8">
            Share your stories with the world
          </p>
          <Link href="/register" className="btn btn-primary text-lg px-8 py-3">
            Join Now
          </Link>
        </div>
      </section>
    </div>
  );
}