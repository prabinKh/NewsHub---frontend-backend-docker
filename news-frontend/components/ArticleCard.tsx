'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Eye, Bookmark } from 'lucide-react';
import { newsAPI } from '@/lib/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  is_featured?: boolean;
}

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(article.is_liked);
  const [isBookmarked, setIsBookmarked] = useState(article.is_bookmarked);
  const [likesCount, setLikesCount] = useState(article.likes_count);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to like articles');
      return;
    }

    try {
      const response = await newsAPI.toggleLike(article.slug);
      setIsLiked(response.data.liked);
      setLikesCount(response.data.likes_count);
    } catch (error) {
      toast.error('Failed to like article');
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to bookmark articles');
      return;
    }

    try {
      const response = await newsAPI.toggleBookmark(article.slug);
      setIsBookmarked(response.data.bookmarked);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to bookmark article');
    }
  };

  return (
    <Link href={`/article/${article.slug}`}>
      <div className={`article-card h-full ${featured ? 'border-2 border-blue-200' : ''}`}>
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 right-4 z-10">
            <span className="badge bg-blue-600 text-white">Featured</span>
          </div>
        )}

        {/* Image */}
        {article.featured_image ? (
          <div className="relative h-48 bg-gray-200">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <div className="text-6xl text-blue-300">📰</div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Category & Date */}
          <div className="flex items-center justify-between mb-3">
            <span className="badge badge-primary">{article.category_name || 'Uncategorized'}</span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-blue-600 transition">
            {article.title}
          </h3>

          {/* Summary */}
          <p className="text-gray-600 mb-4 line-clamp-2">
            {article.summary}
          </p>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="mb-4 text-sm text-gray-600">
            by <span className="font-medium text-gray-900">{article.author_name}</span>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{article.views_count}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{article.comments_count}</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition ${
                  isLiked
                    ? 'text-red-500 bg-red-50'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <span className="text-sm text-gray-600">{likesCount}</span>

              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition ${
                  isBookmarked
                    ? 'text-blue-500 bg-blue-50'
                    : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}