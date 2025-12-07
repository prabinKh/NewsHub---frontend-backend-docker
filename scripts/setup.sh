#!/bin/bash

# Script to set up the development environment

echo "Setting up News Platform development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "Creating directories..."
mkdir -p auth/logs auth/media auth/staticfiles auth/cache

# Build and start services
echo "Building and starting services..."
docker-compose up --build -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Run initial migrations
echo "Running initial migrations..."
docker-compose exec backend python manage.py migrate

# Collect static files
echo "Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

# Create cache table
echo "Creating cache table..."
docker-compose exec backend python manage.py createcachetable

echo "Setup completed successfully!"
echo ""
echo "You can now access:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo ""
echo "To create a superuser, run: ./scripts/django.sh createsuperuser"