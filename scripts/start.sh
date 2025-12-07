#!/bin/bash

# Script to start the development environment with Docker

echo "Starting News Platform development environment..."

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

# Build and start services
echo "Building and starting services..."
docker-compose up --build

echo "Services started successfully!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"