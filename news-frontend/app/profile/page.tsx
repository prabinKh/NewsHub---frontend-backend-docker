'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { authAPI } from '@/lib/api';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    articles_count: 0,
    comments_count: 0,
    likes_received: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchStats = async () => {
      if (user) {
        try {
          setStatsLoading(true);
          const response = await authAPI.getProfile();
          if (response.data.stats) {
            setStats(response.data.stats);
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
        } finally {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-3xl">
        <div className="card">
          <h1 className="text-3xl font-bold mb-8">Profile</h1>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{user.email}</span>
                {user.email_verified && (
                  <span className="badge badge-success">Verified</span>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Articles</p>
                  {statsLoading ? (
                    <div className="h-6 w-8 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-blue-600">{stats.articles_count}</p>
                  )}
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Likes Received</p>
                  {statsLoading ? (
                    <div className="h-6 w-8 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-green-600 flex items-center">
                      <Heart className="w-5 h-5 mr-1 text-red-500" />
                      {stats.likes_received}
                    </p>
                  )}
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Comments</p>
                  {statsLoading ? (
                    <div className="h-6 w-8 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-purple-600">{stats.comments_count}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}