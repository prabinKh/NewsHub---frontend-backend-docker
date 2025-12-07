from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    MyUser,
    EmailVerificationToken,
    PasswordResetToken,
    LoginAttempt,
    Note
)


@admin.register(MyUser)
class MyUserAdmin(BaseUserAdmin):
    """Custom user admin"""
    
    list_display = ['email', 'name', 'email_verified_badge', 'is_active', 'is_staff', 'created_at']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'email_verified', 'created_at']
    search_fields = ['email', 'name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name',)}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'email_verified', 'groups', 'user_permissions')
        }),
        ('Important Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2', 'is_active', 'is_staff'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    
    def email_verified_badge(self, obj):
        """Display email verification status with color"""
        if obj.email_verified:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Verified</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Not Verified</span>'
        )
    email_verified_badge.short_description = 'Email Status'


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """Email verification token admin"""
    
    list_display = ['user_email', 'token_preview', 'is_valid_badge', 'created_at', 'expires_at']
    list_filter = ['is_used', 'created_at', 'expires_at']
    search_fields = ['user__email', 'token']
    readonly_fields = ['user', 'token', 'created_at', 'expires_at', 'is_used']
    ordering = ['-created_at']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
    
    def token_preview(self, obj):
        """Display shortened token"""
        return f"{obj.token[:20]}..."
    token_preview.short_description = 'Token'
    
    def is_valid_badge(self, obj):
        """Display token validity with color"""
        if obj.is_valid():
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Valid</span>'
            )
        elif obj.is_used:
            return format_html(
                '<span style="color: gray;">Used</span>'
            )
        return format_html(
            '<span style="color: red;">Expired</span>'
        )
    is_valid_badge.short_description = 'Status'
    
    def has_add_permission(self, request):
        return False


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """Password reset token admin"""
    
    list_display = ['user_email', 'token_preview', 'is_valid_badge', 'created_at', 'expires_at']
    list_filter = ['is_used', 'created_at', 'expires_at']
    search_fields = ['user__email', 'token']
    readonly_fields = ['user', 'token', 'created_at', 'expires_at', 'is_used']
    ordering = ['-created_at']
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
    
    def token_preview(self, obj):
        """Display shortened token"""
        return f"{obj.token[:20]}..."
    token_preview.short_description = 'Token'
    
    def is_valid_badge(self, obj):
        """Display token validity with color"""
        if obj.is_valid():
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Valid</span>'
            )
        elif obj.is_used:
            return format_html(
                '<span style="color: gray;">Used</span>'
            )
        return format_html(
            '<span style="color: red;">Expired</span>'
        )
    is_valid_badge.short_description = 'Status'
    
    def has_add_permission(self, request):
        return False


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    """Login attempt admin"""
    
    list_display = ['email', 'ip_address', 'success_badge', 'attempted_at']
    list_filter = ['successful', 'attempted_at']
    search_fields = ['email', 'ip_address']
    readonly_fields = ['email', 'ip_address', 'successful', 'attempted_at', 'user_agent']
    ordering = ['-attempted_at']
    
    def success_badge(self, obj):
        """Display login status with color"""
        if obj.successful:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Success</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Failed</span>'
        )
    success_badge.short_description = 'Status'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    """Note admin"""
    
    list_display = ['title', 'owner_email', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['title', 'description', 'owner__email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Note Information', {
            'fields': ('id', 'owner', 'title', 'description')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def owner_email(self, obj):
        return obj.owner.email
    owner_email.short_description = 'Owner'