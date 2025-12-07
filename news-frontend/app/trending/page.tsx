'use client';

import { useEffect, useState } from 'react';
import { newsAPI } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { TrendingUp } from 'lucide-react';

export default function TrendingPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const response = await newsAPI.getTrending();
      setArticles(response.data.articles || []);
    } catch (error) {
      console.error('Error fetching trending:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="flex items-center mb-8">
          <TrendingUp className="w-10 h-10 mr-3 text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold">Trending Articles</h1>
            <p className="text-gray-600 mt-2">Most viewed articles this week</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

