'use client';

import { useEffect, useState } from 'react';
import { newsAPI } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Suspense } from 'react';

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

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const response = await newsAPI.getArticles({ search: query });
      setArticles(response.data.results || response.data);
      setTotalResults(response.data.count || response.data.length || 0);
    } catch (error) {
      console.error('Error searching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Search NewsHub</h1>
          <p className="text-gray-600 mb-8">Enter a search term to find articles, authors, or topics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Search Results for "{query}"
          </h1>
          {!loading && (
            <p className="text-gray-600">
              Found {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No results found</h2>
            <p className="text-gray-600">
              Try different keywords or browse our categories
            </p>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}