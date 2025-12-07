'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { newsAPI } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import { History } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchHistory();
    }
  }, [user, authLoading]);

  const fetchHistory = async () => {
    try {
      const response = await newsAPI.getReadingHistory();
      setHistory(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching reading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="flex items-center mb-8">
          <History className="w-10 h-10 mr-3 text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold">Reading History</h1>
            <p className="text-gray-600 mt-2">Articles you've recently read</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reading history yet</p>
            <p className="text-gray-400 mt-2">Start reading articles to see them appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item: any) => (
              <ArticleCard key={item.id} article={item.article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}