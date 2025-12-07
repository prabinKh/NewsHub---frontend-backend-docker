from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
import logging

from .models import Category, Tag, Article, Comment, Like, Bookmark, ReadingHistory
from .serializers import (
    CategorySerializer,
    TagSerializer,
    ArticleListSerializer,
    ArticleDetailSerializer,
    ArticleCreateUpdateSerializer,
    CommentSerializer,
    BookmarkSerializer,
    ReadingHistorySerializer
)
from .permissions import IsAuthorOrReadOnly

logger = logging.getLogger(__name__)


class StandardPagination(PageNumberPagination):
    """Standard pagination for lists"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# ==================== CATEGORY VIEWS ====================

class CategoryListView(generics.ListAPIView):
    """
    List all categories
    GET /api/news/categories/
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CategoryDetailView(generics.RetrieveAPIView):
    """
    Get category detail
    GET /api/news/categories/{slug}/
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


# ==================== TAG VIEWS ====================

class TagListView(generics.ListAPIView):
    """
    List all tags
    GET /api/news/tags/
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]


# ==================== ARTICLE VIEWS ====================

class ArticleListView(generics.ListAPIView):
    """
    List all published articles
    GET /api/news/articles/
    
    Query params:
    - category: filter by category slug
    - tag: filter by tag slug
    - search: search in title and content
    - featured: true/false
    - author: filter by author email
    """
    serializer_class = ArticleListSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['created_at', 'published_at', 'views_count']
    ordering = ['-published_at']
    
    def get_queryset(self):
        queryset = Article.objects.filter(status='published').select_related(
            'author', 'category'
        ).prefetch_related('tags')
        
        # Filter by category
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Filter by tag
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        
        # Filter by featured
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Filter by author
        author_email = self.request.query_params.get('author')
        if author_email:
            queryset = queryset.filter(author__email=author_email)
        
        return queryset


class ArticleDetailView(generics.RetrieveAPIView):
    """
    Get article detail by slug
    GET /api/news/articles/{slug}/
    """
    queryset = Article.objects.all()
    serializer_class = ArticleDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Increment view count
        instance.increment_views()
        
        # Track reading history for authenticated users
        if request.user.is_authenticated:
            ReadingHistory.objects.create(
                article=instance,
                user=request.user
            )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class MyArticlesView(generics.ListAPIView):
    """
    List articles by authenticated user
    GET /api/news/my-articles/
    """
    serializer_class = ArticleListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
    
    def get_queryset(self):
        return Article.objects.filter(
            author=self.request.user
        ).select_related('author', 'category').prefetch_related('tags')


class ArticleCreateView(generics.CreateAPIView):
    """
    Create new article
    POST /api/news/articles/create/
    """
    serializer_class = ArticleCreateUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            
            if serializer.is_valid():
                article = serializer.save()
                
                # Return detail serializer for response
                response_serializer = ArticleDetailSerializer(
                    article,
                    context={'request': request}
                )
                
                return Response({
                    'success': True,
                    'message': 'Article created successfully!',
                    'article': response_serializer.data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Article creation error: {str(e)}")
            return Response({
                'success': False,
                'message': 'An error occurred while creating the article.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ArticleUpdateView(generics.UpdateAPIView):
    """
    Update article
    PUT/PATCH /api/news/articles/{slug}/update/
    """
    serializer_class = ArticleCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Article.objects.filter(author=self.request.user)
    
    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            
            if serializer.is_valid():
                article = serializer.save()
                
                # Return detail serializer for response
                response_serializer = ArticleDetailSerializer(
                    article,
                    context={'request': request}
                )
                
                return Response({
                    'success': True,
                    'message': 'Article updated successfully!',
                    'article': response_serializer.data
                }, status=status.HTTP_200_OK)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Article update error: {str(e)}")
            return Response({
                'success': False,
                'message': 'An error occurred while updating the article.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ArticleDeleteView(generics.DestroyAPIView):
    """
    Delete article
    DELETE /api/news/articles/{slug}/delete/
    """
    permission_classes = [IsAuthenticated, IsAuthorOrReadOnly]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return Article.objects.filter(author=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            
            return Response({
                'success': True,
                'message': 'Article deleted successfully!'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Article deletion error: {str(e)}")
            return Response({
                'success': False,
                'message': 'An error occurred while deleting the article.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== COMMENT VIEWS ====================

class CommentCreateView(generics.CreateAPIView):
    """
    Create comment on article
    POST /api/news/articles/{slug}/comments/
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, slug):
        try:
            article = get_object_or_404(Article, slug=slug, status='published')
            
            serializer = self.get_serializer(data=request.data)
            
            if serializer.is_valid():
                # Check if parent comment exists (for replies)
                parent_id = request.data.get('parent')
                parent = None
                if parent_id:
                    parent = get_object_or_404(Comment, id=parent_id, article=article)
                
                comment = serializer.save(
                    article=article,
                    author=request.user,
                    parent=parent
                )
                
                return Response({
                    'success': True,
                    'message': 'Comment posted successfully!',
                    'comment': CommentSerializer(comment).data
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Comment creation error: {str(e)}")
            return Response({
                'success': False,
                'message': 'An error occurred while posting the comment.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CommentDeleteView(generics.DestroyAPIView):
    """
    Delete comment
    DELETE /api/news/comments/{id}/
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Comment.objects.filter(author=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            
            return Response({
                'success': True,
                'message': 'Comment deleted successfully!'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Comment deletion error: {str(e)}")
            return Response({
                'success': False,
                'message': 'An error occurred while deleting the comment.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== LIKE VIEWS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, slug):
    """
    Toggle like on article
    POST /api/news/articles/{slug}/like/
    """
    try:
        article = get_object_or_404(Article, slug=slug, status='published')
        
        like, created = Like.objects.get_or_create(
            article=article,
            user=request.user
        )
        
        if not created:
            # Unlike
            like.delete()
            return Response({
                'success': True,
                'liked': False,
                'likes_count': article.likes.count()
            }, status=status.HTTP_200_OK)
        
        # Like
        return Response({
            'success': True,
            'liked': True,
            'likes_count': article.likes.count()
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Like toggle error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== BOOKMARK VIEWS ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, slug):
    """
    Toggle bookmark on article
    POST /api/news/articles/{slug}/bookmark/
    """
    try:
        article = get_object_or_404(Article, slug=slug, status='published')
        
        bookmark, created = Bookmark.objects.get_or_create(
            article=article,
            user=request.user
        )
        
        if not created:
            # Remove bookmark
            bookmark.delete()
            return Response({
                'success': True,
                'bookmarked': False,
                'message': 'Bookmark removed.'
            }, status=status.HTTP_200_OK)
        
        # Add bookmark
        return Response({
            'success': True,
            'bookmarked': True,
            'message': 'Article bookmarked!'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Bookmark toggle error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BookmarkListView(generics.ListAPIView):
    """
    List user's bookmarks
    GET /api/news/bookmarks/
    """
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
    
    def get_queryset(self):
        return Bookmark.objects.filter(
            user=self.request.user
        ).select_related('article__author', 'article__category')


# ==================== READING HISTORY VIEWS ====================

class ReadingHistoryView(generics.ListAPIView):
    """
    List user's reading history
    GET /api/news/history/
    """
    serializer_class = ReadingHistorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination
    
    def get_queryset(self):
        return ReadingHistory.objects.filter(
            user=self.request.user
        ).select_related('article__author', 'article__category').order_by('-read_at')


# ==================== SEARCH & TRENDING ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def trending_articles(request):
    """
    Get trending articles (most viewed in last 7 days)
    GET /api/news/trending/
    """
    try:
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        
        articles = Article.objects.filter(
            status='published',
            published_at__gte=week_ago
        ).order_by('-views_count')[:10]
        
        serializer = ArticleListSerializer(
            articles,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'success': True,
            'articles': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Trending articles error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def featured_articles(request):
    """
    Get featured articles
    GET /api/news/featured/
    """
    try:
        articles = Article.objects.filter(
            status='published',
            is_featured=True
        ).order_by('-published_at')[:5]
        
        serializer = ArticleListSerializer(
            articles,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'success': True,
            'articles': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Featured articles error: {str(e)}")
        return Response({
            'success': False,
            'message': 'An error occurred.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)