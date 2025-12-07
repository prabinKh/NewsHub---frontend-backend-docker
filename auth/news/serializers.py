from rest_framework import serializers
from django.utils import timezone
from .models import Category, Tag, Article, Comment, Like, Bookmark, ReadingHistory


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories"""
    
    articles_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'articles_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']
    
    def get_articles_count(self, obj):
        return obj.articles.filter(status='published').count()


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tags"""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class AuthorSerializer(serializers.Serializer):
    """Serializer for article author info"""
    
    id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments"""
    
    author_name = serializers.CharField(source='author.name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)
    replies_count = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'article', 'content', 'parent', 'author_name', 
            'author_email', 'is_approved', 'replies_count', 'replies',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'article', 'author_name', 'author_email', 'created_at', 'updated_at']
    
    def get_replies_count(self, obj):
        return obj.replies.filter(is_approved=True).count()
    
    def get_replies(self, obj):
        # Only include replies if this is a parent comment
        if obj.parent is None:
            replies = obj.replies.filter(is_approved=True)
            return CommentReplySerializer(replies, many=True).data
        return []
    
    def validate_content(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Comment must be at least 3 characters long.")
        return value.strip()


class CommentReplySerializer(serializers.ModelSerializer):
    """Simplified serializer for comment replies"""
    
    author_name = serializers.CharField(source='author.name', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author_name', 'created_at']


class ArticleListSerializer(serializers.ModelSerializer):
    """Serializer for article list (summary view)"""
    
    author_name = serializers.CharField(source='author.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'summary', 'featured_image',
            'author_name', 'category_name', 'tags', 'status',
            'is_featured', 'views_count', 'likes_count', 'comments_count',
            'is_liked', 'is_bookmarked', 'published_at', 'created_at'
        ]
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(article=obj, user=request.user).exists()
        return False
    
    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(article=obj, user=request.user).exists()
        return False


class ArticleDetailSerializer(serializers.ModelSerializer):
    """Serializer for article detail view"""
    
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'summary', 'content', 'featured_image',
            'author', 'category', 'tags', 'status', 'is_featured',
            'views_count', 'likes_count', 'comments_count', 'comments',
            'is_liked', 'is_bookmarked', 'meta_description', 'meta_keywords',
            'published_at', 'created_at', 'updated_at'
        ]
    
    def get_comments(self, obj):
        # Get only parent comments (not replies)
        comments = obj.comments.filter(is_approved=True, parent=None)
        return CommentSerializer(comments, many=True).data
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(article=obj, user=request.user).exists()
        return False
    
    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(article=obj, user=request.user).exists()
        return False


class ArticleCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating articles"""
    
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Article
        fields = [
            'title', 'summary', 'content', 'featured_image',
            'category', 'tags', 'status', 'is_featured',
            'meta_description', 'meta_keywords', 'published_at'
        ]
        extra_kwargs = {
            'featured_image': {'required': False}
        }
    
    def validate_title(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Title must be at least 10 characters long.")
        return value.strip()
    
    def validate_summary(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError("Summary must be at least 20 characters long.")
        return value.strip()
    
    def validate_content(self, value):
        if len(value.strip()) < 100:
            raise serializers.ValidationError("Content must be at least 100 characters long.")
        return value.strip()
    
    def validate(self, data):
        # Auto-set published_at when status changes to published
        if data.get('status') == 'published' and not data.get('published_at'):
            data['published_at'] = timezone.now()
        
        return data
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        
        # Set author from request user
        validated_data['author'] = self.context['request'].user
        
        # Create article
        article = Article.objects.create(**validated_data)
        
        # Handle tags
        if tags_data:
            self._handle_tags(article, tags_data)
        
        return article
    
    def update(self, instance, validated_data):
        tags_data = validated_data.pop('tags', None)
        
        # Update article fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle tags
        if tags_data is not None:
            self._handle_tags(instance, tags_data)
        
        return instance
    
    def _handle_tags(self, article, tags_data):
        """Handle tag creation and assignment"""
        tags = []
        for tag_name in tags_data:
            tag_name = tag_name.strip().lower()
            if tag_name:
                tag, created = Tag.objects.get_or_create(name=tag_name)
                tags.append(tag)
        
        article.tags.set(tags)


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for likes"""
    
    class Meta:
        model = Like
        fields = ['id', 'article', 'created_at']
        read_only_fields = ['id', 'created_at']


class BookmarkSerializer(serializers.ModelSerializer):
    """Serializer for bookmarks"""
    
    article = ArticleListSerializer(read_only=True)
    
    class Meta:
        model = Bookmark
        fields = ['id', 'article', 'created_at']
        read_only_fields = ['id', 'created_at']


class ReadingHistorySerializer(serializers.ModelSerializer):
    """Serializer for reading history"""
    
    article = ArticleListSerializer(read_only=True)
    
    class Meta:
        model = ReadingHistory
        fields = ['id', 'article', 'read_at']
        read_only_fields = ['id', 'read_at']

