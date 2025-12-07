# Django Backend API

This is the backend API for the News Platform, built with Django and Django REST Framework.

## Features

- User authentication (registration, login, logout)
- JWT token management with refresh tokens
- Email verification for new accounts
- Password reset functionality
- Rate limiting for API endpoints
- Article management (CRUD operations)
- Bookmark and reading history tracking
- Comment system for articles
- Category and tag organization
- Redis caching for performance
- SQLite database for development (PostgreSQL for production)

## Prerequisites

- Python 3.8+
- Django 4.2+
- PostgreSQL (for production)
- Redis

## Installation

### With Docker (Recommended)

```bash
# From the root directory
docker-compose up --build
```

### Manual Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables (copy .env.example to .env and modify as needed):
   ```bash
   cp .env.example .env
   # Edit .env file with your settings
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/verify-email/` - Verify email with token
- `POST /api/auth/resend-verification/` - Resend verification email
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/check/` - Check authentication status
- `GET /api/auth/profile/` - Get user profile
- `PATCH /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password
- `POST /api/auth/password-reset/` - Request password reset
- `POST /api/auth/password-reset/confirm/` - Confirm password reset

### Articles
- `GET /news/articles/` - List articles
- `POST /news/articles/create/` - Create article
- `GET /news/articles/{slug}/` - Get article detail
- `PUT /news/articles/{slug}/update/` - Update article
- `DELETE /news/articles/{slug}/delete/` - Delete article
- `GET /news/my-articles/` - List user's articles
- `POST /news/articles/{slug}/like/` - Like/unlike article
- `POST /news/articles/{slug}/bookmark/` - Bookmark/unbookmark article

### Categories and Tags
- `GET /news/categories/` - List categories
- `GET /news/categories/{slug}/` - Get category detail
- `GET /news/tags/` - List tags

### Comments
- `POST /news/articles/{slug}/comments/` - Add comment
- `DELETE /news/comments/{id}/` - Delete comment

### User Data
- `GET /news/bookmarks/` - List bookmarked articles
- `GET /news/history/` - List reading history
- `GET /news/trending/` - List trending articles

## Environment Variables

- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (True/False)
- `ALLOWED_HOSTS` - Comma-separated list of allowed hosts
- `DATABASE_URL` - Database connection URL (defaults to SQLite)
- `REDIS_URL` - Redis connection URL
- `EMAIL_HOST` - SMTP host for sending emails
- `EMAIL_PORT` - SMTP port
- `EMAIL_USE_TLS` - Use TLS for SMTP
- `EMAIL_HOST_USER` - SMTP username
- `EMAIL_HOST_PASSWORD` - SMTP password
- `DEFAULT_FROM_EMAIL` - Default sender email
- `FRONTEND_URL` - URL of the frontend application

## Development

### Running Tests

```bash
python manage.py test
```

### Code Quality

```bash
# Run linters
flake8 .
# Run formatters
black .
```

## Deployment

For production deployment:

1. Set `DEBUG=False`
2. Use a strong `SECRET_KEY`
3. Configure proper `ALLOWED_HOSTS`
4. Use PostgreSQL instead of SQLite
5. Set up HTTPS
6. Configure proper CORS settings
7. Use a production web server (nginx, Apache, etc.)

## Common Management Commands

```bash
# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Collect static files
python manage.py collectstatic

# Create superuser
python manage.py createsuperuser

# Access Django shell
python manage.py shell

# Check for issues
python manage.py check
```