# News Platform with Django Backend and Next.js Frontend

This project is a complete news platform with a Django REST API backend and a Next.js frontend. It includes user authentication, article management, bookmarking, and more.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started with Docker](#getting-started-with-docker)
- [Manual Installation](#manual-installation)
- [Services Overview](#services-overview)
- [Environment Variables](#environment-variables)
- [Development Commands](#development-commands)
- [Database Management](#database-management)
- [Common Issues](#common-issues)
- [Production Deployment](#production-deployment)

## Features

### Backend (Django)
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

### Frontend (Next.js)
- Responsive UI with Tailwind CSS
- User authentication flows (register, login, logout)
- Email verification
- Password reset
- Article browsing and reading
- Bookmark management
- Reading history
- User profiles
- Category navigation
- Search functionality
- Trending articles section
- Mobile-friendly design

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐
│   Frontend      │    │    Backend       │    │    Redis     │
│   (Next.js)     │◄──►│   (Django)       │◄──►│   (Cache)    │
│   Port: 3000    │    │   Port: 8000     │    │   Port: 6379 │
└─────────────────┘    └──────────────────┘    └──────────────┘
```

## Prerequisites

- Docker and Docker Compose installed on your machine
- Node.js 18+ (for manual installation)
- Python 3.8+ (for manual installation)
- PostgreSQL (for production)

## Getting Started with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd complit-authentication
   ```

2. Build and run the services:
   ```bash
   docker-compose up --build
   ```

3. Access the applications:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Redis: localhost:6379

## Manual Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd auth
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables (copy .env.example to .env and modify as needed):
   ```bash
   cp .env.example .env
   # Edit .env file with your settings
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../news-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (copy .env.example to .env.local and modify as needed):
   ```bash
   cp .env.example .env.local
   # Edit .env.local file with your settings
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Services Overview

### Backend (Django)
- Port: 8000
- Features:
  - User authentication (registration, login, logout)
  - JWT token management
  - Rate limiting
  - Article management
  - Bookmark and history tracking
  - Redis caching

### Frontend (Next.js)
- Port: 3000
- Features:
  - Responsive UI with Tailwind CSS
  - Authentication flows
  - Article browsing and reading
  - Bookmark management
  - User profiles

### Redis
- Port: 6379
- Used for:
  - Caching
  - Rate limiting

## Environment Variables

### Backend
- `SECRET_KEY`: Django secret key (required for production)
- `DEBUG`: Set to False for production
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `REDIS_URL`: Redis connection URL
- `DATABASE_URL`: PostgreSQL database URL (optional, defaults to SQLite)
- `EMAIL_HOST`: SMTP host for sending emails
- `EMAIL_PORT`: SMTP port
- `EMAIL_USE_TLS`: Use TLS for SMTP
- `EMAIL_HOST_USER`: SMTP username
- `EMAIL_HOST_PASSWORD`: SMTP password
- `DEFAULT_FROM_EMAIL`: Default sender email
- `FRONTEND_URL`: URL of the frontend application

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Development Commands

### Using Helper Scripts

The project includes helper scripts in the `scripts/` directory:

```bash
# Start the development environment
./scripts/start.sh

# Stop the development environment
./scripts/stop.sh

# Run Django management commands
./scripts/django.sh migrate
./scripts/django.sh createsuperuser
./scripts/django.sh shell
```

### Running with Docker Compose
```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild services
docker-compose up --build

# View logs
docker-compose logs
```

### Running Individual Services
```bash
# Backend only
docker-compose up backend

# Frontend only
docker-compose up frontend
```

### Manual Development Commands

#### Backend
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

# Run tests
python manage.py test

# Check for issues
python manage.py check
```

#### Frontend
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run linter with auto-fix
npm run lint:fix

# Run TypeScript compiler
npm run type-check
```

## Database Management

The backend uses SQLite by default for development. For production, you can configure PostgreSQL using the `DATABASE_URL` environment variable.

To run migrations:
```bash
# With Docker
docker-compose exec backend python manage.py migrate

# Without Docker
python manage.py migrate
```

To create a superuser:
```bash
# With Docker
docker-compose exec backend python manage.py createsuperuser

# Without Docker
python manage.py createsuperuser
```

## Common Issues

### Port Conflicts
If you encounter port conflicts, modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Change host port to 8001
```

### Permission Issues
On Linux, you might encounter permission issues with mounted volumes. Fix with:
```bash
sudo chown -R $USER:$USER auth/media auth/staticfiles
```

### Docker Build Issues
If you encounter issues during Docker builds, try building without cache:
```bash
docker-compose build --no-cache
```

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in environment variables
2. Use a strong `SECRET_KEY`
3. Configure proper `ALLOWED_HOSTS`
4. Use PostgreSQL instead of SQLite
5. Set up HTTPS
6. Configure proper CORS settings
7. Use a production web server (nginx, Apache, etc.)

Example production environment:
```bash
SECRET_KEY=your-very-secure-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgres://user:password@host:port/dbname
REDIS_URL=redis://redis:6379/1
```

## Project Structure

```
.
├── auth/                  # Django backend
│   ├── account/          # User authentication app
│   ├── news/             # News management app
│   ├── auth/             # Django project settings
│   ├── manage.py         # Django management script
│   └── requirements.txt  # Python dependencies
├── news-frontend/        # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── lib/              # Utility functions
│   └── public/           # Static assets
├── docker-compose.yml    # Docker Compose configuration
├── docker-compose.override.yml  # Docker Compose overrides
├── scripts/              # Helper scripts
└── README.md             # This file
```