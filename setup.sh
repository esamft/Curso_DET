#!/bin/bash

# =====================================================
# DET Flow - Setup Script
# Automated setup for development environment
# =====================================================

set -e  # Exit on error

echo "========================================="
echo "DET Flow - Setup Script"
echo "========================================="

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "Error: Python 3.11+ is required (found $python_version)"
    exit 1
fi

echo "✓ Python version: $python_version"

# Create virtual environment
echo ""
echo "Creating virtual environment..."
if [ -d "venv" ]; then
    echo "Virtual environment already exists. Skipping..."
else
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo ""
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt

echo "✓ Dependencies installed"

# Create .env file if it doesn't exist
echo ""
echo "Setting up environment variables..."
if [ -f ".env" ]; then
    echo ".env file already exists. Skipping..."
else
    cp .env.example .env
    echo "✓ .env file created from .env.example"
    echo "⚠️  Please edit .env and fill in your API keys and credentials"
fi

# Create logs directory
echo ""
echo "Creating logs directory..."
mkdir -p logs
echo "✓ Logs directory created"

# Database setup prompt
echo ""
echo "========================================="
echo "Database Setup"
echo "========================================="
echo ""
echo "Do you want to set up the database now? (y/n)"
read -r setup_db

if [ "$setup_db" = "y" ]; then
    echo ""
    echo "Please ensure your DATABASE_URL is configured in .env"
    echo "Then run the following command to create the schema:"
    echo ""
    echo "  psql \$DATABASE_URL -f migrations/001_initial_schema.sql"
    echo ""
else
    echo "Skipping database setup. You can run migrations later."
fi

# Summary
echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API keys"
echo "2. Run database migrations (if not done already)"
echo "3. Start the server: python run.py"
echo ""
echo "For more information, see README.md"
echo ""
