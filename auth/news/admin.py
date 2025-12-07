from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Tag, Article, Comment, Like, Bookmark, ReadingHistory


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Category admin"""
    
    list_display = ['name', 'slug', 'articles_count', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
    
    def articles_count(self, obj):
        count = obj.articles.count()
        return format_html(
            '<span style="font-weight: bold; color: #0066cc;">{}</span>',
            count
        )
    articles_count.short_description = 'Articles'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    """Tag admin"""
    
    list_display = ['name', 'slug', 'articles_count', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at']
    
    def articles_count(self, obj):
        count = obj.articles.count()
        return format_html(
            '<span style="font-weight: bold; color: #0066cc;">{}</span>',
            count
        )
    articles_count.short_description = 'Articles'


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    """Article admin"""
    
    list_display = [
        'title', 'author_email', 'category', 'status_badge',
        'is_featured', 'views_count', 'likes_count', 'comments_count',
        'published_at'
    ]
    list_filter = ['status', 'is_featured', 'category', 'created_at', 'published_at']
    search_fields = ['title', 'summary', 'content', 'author__email']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['id', 'views_count', 'created_at', 'updated_at']
    filter_horizontal = ['tags']
    date_hierarchy = 'published_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'slug', 'author', 'summary', 'content')
        }),
        ('Media', {
            'fields': ('featured_image',)
        }),
        ('Classification', {
            'fields': ('category', 'tags', 'status', 'is_featured')
        }),
        ('SEO', {
            'fields': ('meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('views_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('published_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def author_email(self, obj):
        return obj.author.email
    author_email.short_description = 'Author'
    author_email.admin_order_field = 'author__email'
    
    def status_badge(self, obj):
        colors = {
            'draft': '#FFA500',
            'published': '#28a745',
            'archived': '#6c757d'
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            colors.get(obj.status, '#6c757d'),
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def likes_count(self, obj):
        count = obj.likes.count()
        return format_html(
            '<span style="color: #e74c3c; font-weight: bold;">❤ {}</span>',
            count
        )
    likes_count.short_description = 'Likes'
    
    def comments_count(self, obj):
        count = obj.comments.count()
        return format_html(
            '<span style="color: #3498db; font-weight: bold;">💬 {}</span>',
            count
        )
    comments_count.short_description = 'Comments'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """Comment admin"""
    
    list_display = [
        'author_email', 'article_title', 'content_preview',
        'is_reply', 'approval_badge', 'created_at'
    ]
    list_filter = ['is_approved', 'created_at']
    search_fields = ['content', 'author__email', 'article__title']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Comment Information', {
            'fields': ('id', 'article', 'author', 'content', 'parent')
        }),
        ('Moderation', {
            'fields': ('is_approved',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def author_email(self, obj):
        return obj.author.email
    author_email.short_description = 'Author'
    
    def article_title(self, obj):
        return obj.article.title[:50]
    article_title.short_description = 'Article'
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
    
    def is_reply(self, obj):
        if obj.parent:
            return format_html('<span style="color: #3498db;">↳ Reply</span>')
        return format_html('<span style="color: #95a5a6;">○ Comment</span>')
    is_reply.short_description = 'Type'
    
    def approval_badge(self, obj):
        if obj.is_approved:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Approved</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Pending</span>'
        )
    approval_badge.short_description = 'Status'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    """Like admin"""
    
    list_display = ['user_email', 'article_title', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'article__title']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def article_title(self, obj):
        return obj.article.title[:50]
    article_title.short_description = 'Article'
    
    def has_add_permission(self, request):
        return False


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    """Bookmark admin"""
    
    list_display = ['user_email', 'article_title', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'article__title']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def article_title(self, obj):
        return obj.article.title[:50]
    article_title.short_description = 'Article'
    
    def has_add_permission(self, request):
        return False


@admin.register(ReadingHistory)
class ReadingHistoryAdmin(admin.ModelAdmin):
    """Reading history admin"""
    
    list_display = ['user_email', 'article_title', 'read_at']
    list_filter = ['read_at']
    search_fields = ['user__email', 'article__title']
    readonly_fields = ['id', 'read_at']
    ordering = ['-read_at']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def article_title(self, obj):
        return obj.article.title[:50]
    article_title.short_description = 'Article'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False