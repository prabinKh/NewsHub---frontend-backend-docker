#!/bin/bash

# Script to run Django management commands in the Docker container

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker is not installed."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose is not installed."
    exit 1
fi

# Check if a command was provided
if [ $# -eq 0 ]
then
    echo "Usage: ./django.sh <command>"
    echo "Example: ./django.sh migrate"
    echo "Example: ./django.sh createsuperuser"
    echo "Example: ./django.sh shell"
    exit 1
fi

# Run the Django management command
echo "Running Django command: python manage.py $@"
docker-compose exec backend python manage.py "$@"