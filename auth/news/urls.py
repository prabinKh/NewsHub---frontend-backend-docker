from django.urls import path
from .views import *
app_name = 'news'

urlpatterns = [
    # Categories
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/<slug:slug>/', CategoryDetailView.as_view(), name='category_detail'),
    
    # Tags
    path('tags/', TagListView.as_view(), name='tag_list'),
    
    # Articles - Public
    path('articles/', ArticleListView.as_view(), name='article_list'),
    
    # Articles - Authenticated
    path('my-articles/', MyArticlesView.as_view(), name='my_articles'),
    path('articles/create/', ArticleCreateView.as_view(), name='article_create'),
    path('articles/<slug:slug>/update/', ArticleUpdateView.as_view(), name='article_update'),
    path('articles/<slug:slug>/delete/', ArticleDeleteView.as_view(), name='article_delete'),
    
    # Article Detail (must be last to avoid conflicting with other article URLs)
    path('articles/<slug:slug>/', ArticleDetailView.as_view(), name='article_detail'),
    
    # Comments
    path('articles/<slug:slug>/comments/', CommentCreateView.as_view(), name='comment_create'),
    path('comments/<uuid:pk>/', CommentDeleteView.as_view(), name='comment_delete'),
    
    # Likes & Bookmarks
    path('articles/<slug:slug>/like/', toggle_like, name='toggle_like'),
    path('articles/<slug:slug>/bookmark/', toggle_bookmark, name='toggle_bookmark'),
    path('bookmarks/', BookmarkListView.as_view(), name='bookmark_list'),
    
    # Reading History
    path('history/', ReadingHistoryView.as_view(), name='reading_history'),
    
    # Trending & Featured
    path('trending/', trending_articles, name='trending_articles'),
    path('featured/', featured_articles, name='featured_articles'),
]

