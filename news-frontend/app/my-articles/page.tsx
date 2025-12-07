'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { newsAPI } from '@/lib/api';
import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function MyArticlesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchMyArticles();
    }
  }, [user, authLoading]);

  const fetchMyArticles = async () => {
    try {
      const response = await newsAPI.getMyArticles();
      setArticles(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await newsAPI.deleteArticle(slug);
      toast.success('Article deleted successfully');
      fetchMyArticles();
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">My Articles</h1>
            <p className="text-gray-600 mt-2">Manage your published content</p>
          </div>
          <Link href="/create-article" className="btn btn-primary">
            Create New Article
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">You haven't written any articles yet</p>
            <Link href="/create-article" className="btn btn-primary">
              Write Your First Article
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article: any) => (
              <div key={article.id} className="card flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold">{article.title}</h3>
                    <span className={`badge ${
                      article.status === 'published' ? 'badge-success' :
                      article.status === 'draft' ? 'badge-warning' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {article.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{article.summary}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {article.views_count} views
                    </span>
                    <span>{article.likes_count} likes</span>
                    <span>{article.comments_count} comments</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    href={`/article/${article.slug}`}
                    className="btn btn-secondary p-2"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`/edit-article/${article.slug}`}
                    className="btn btn-secondary p-2"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(article.slug)}
                    className="btn btn-danger p-2"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}