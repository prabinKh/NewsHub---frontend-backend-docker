'use client';

import { useEffect, useState } from 'react';
// import { use } from 'react'; // Not needed for client components
import { newsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Eye, Bookmark, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{ id: string; name: string }>;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  published_at: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_email: string;
  created_at: string;
  replies: Comment[];
}

export default function ArticleDetailPage() {
  const params = useParams<{ slug: string }>();
  
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    // Only fetch if we have a valid slug
    if (params.slug && params.slug !== 'undefined') {
      fetchArticle();
    }
  }, [params.slug]);

  const fetchArticle = async () => {
    try {
      if (!params.slug || params.slug === 'undefined') {
        throw new Error('Invalid slug');
      }
      const response = await newsAPI.getArticle(params.slug);
      setArticle(response.data);
    } catch (error) {
      toast.error('Article not found');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like articles');
      return;
    }

    if (!params.slug || params.slug === 'undefined') {
      toast.error('Invalid article');
      return;
    }

    try {
      const response = await newsAPI.toggleLike(params.slug);
      setArticle((prev) => prev ? {
        ...prev,
        is_liked: response.data.liked,
        likes_count: response.data.likes_count,
      } : null);
    } catch (error) {
      toast.error('Failed to like article');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please login to bookmark articles');
      return;
    }

    if (!params.slug || params.slug === 'undefined') {
      toast.error('Invalid article');
      return;
    }

    try {
      const response = await newsAPI.toggleBookmark(params.slug);
      setArticle((prev) => prev ? {
        ...prev,
        is_bookmarked: response.data.bookmarked,
      } : null);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to bookmark article');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!params.slug || params.slug === 'undefined') {
      toast.error('Invalid article');
      return;
    }

    const trimmedComment = commentText.trim();
    if (!trimmedComment) {
      toast.error('Please enter a comment');
      return;
    }

    // Validate comment length
    if (trimmedComment.length < 3) {
      toast.error('Comment must be at least 3 characters long');
      return;
    }

    setSubmittingComment(true);
    try {
      await newsAPI.addComment(params.slug, trimmedComment, replyTo || undefined);
      toast.success('Comment posted!');
      setCommentText('');
      setReplyTo(null);
      fetchArticle(); // Refresh to show new comment
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.content 
        ? error.response.data.errors.content[0] 
        : error.response?.data?.message || 'Failed to post comment';
      toast.error(errorMessage);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Article not found</h2>
          <Link href="/" className="text-blue-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          {article.category && (
            <Link href={`/category/${article.category.slug}`}>
              <span className="badge badge-primary mb-4 inline-block">
                {article.category.name}
              </span>
            </Link>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Summary */}
          <p className="text-xl text-gray-800 mb-6">
            {article.summary}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-800 mb-6">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{article.author.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>{article.views_count} views</span>
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag) => (
                <Link key={tag.id} href={`/tag/${tag.name}`}>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition">
                    #{tag.name}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-6 border-t">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                article.is_liked
                  ? 'bg-red-50 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${article.is_liked ? 'fill-current' : ''}`} />
              <span>{article.likes_count}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                article.is_bookmarked
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${article.is_bookmarked ? 'fill-current' : ''}`} />
              <span>Save</span>
            </button>

            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
              <MessageCircle className="w-5 h-5" />
              <span>{article.comments_count} comments</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featured_image && (
          <div className="mb-8">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="article-content prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
        />

        {/* Comments Section */}
        <section className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">
            Comments ({article.comments_count})
          </h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleComment} className="mb-8">
              {replyTo && (
                <div className="mb-2 text-sm text-gray-800">
                  Replying to comment...{' '}
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="text-blue-600 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-800">
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Login
                </Link>{' '}
                to comment on this article
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {article.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-medium">{comment.author_name}</span>
                    <span className="text-sm text-gray-700 ml-2">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {user && (
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Reply
                    </button>
                  )}
                </div>
                <p className="text-gray-700">{comment.content}</p>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-white rounded-lg p-3">
                        <div className="mb-2">
                          <span className="font-medium text-sm">{reply.author_name}</span>
                          <span className="text-xs text-gray-700 ml-2">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {article.comments.length === 0 && (
              <p className="text-center text-gray-800 py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </section>
      </article>
    </div>
  );
}