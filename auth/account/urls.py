from django.urls import path
from .views import (
    UserRegistrationView,
    EmailVerificationView,
    ResendVerificationView,
    CustomTokenObtainPairView,
    CustomRefreshTokenView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ChangePasswordView,
    UserProfileView,
    IsAuthenticatedView,
    NoteListCreateView,
    NoteDetailView
)

app_name = 'account'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/verify-email/', EmailVerificationView.as_view(), name='verify_email'),
    path('auth/resend-verification/', ResendVerificationView.as_view(), name='resend_verification'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh/', CustomRefreshTokenView.as_view(), name='token_refresh'),
    path('auth/check/', IsAuthenticatedView.as_view(), name='check_auth'),
    
    # Password management
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # User profile
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    
    # Notes endpoints
    path('notes/', NoteListCreateView.as_view(), name='note_list_create'),
    path('notes/<uuid:pk>/', NoteDetailView.as_view(), name='note_detail'),
]