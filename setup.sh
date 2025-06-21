#!/bin/bash

# Entropy Project Setup Script
echo "🌀 Setting up Entropy - Contextual Idea Exploration Platform"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.9+ and try again."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi

print_success "Prerequisites check passed"

# Create directory structure
print_status "Creating directory structure..."

# Backend directories
mkdir -p backend/app/{api,services,models,core,utils}
mkdir -p backend/app/api/{routes,deps}
mkdir -p backend/tests

# Frontend directories
mkdir -p frontend/src/{components,pages,services,stores,utils,types}
mkdir -p frontend/src/components/{ui,mindmap,sticky}
mkdir -p frontend/public

# Shared directories
mkdir -p shared/src/{types,utils}

# Documentation and configuration
mkdir -p docs
mkdir -p docker

print_success "Directory structure created"

# Create environment file
print_status "Creating environment configuration..."
if [ ! -f .env ]; then
    cp env.example .env
    print_success "Environment file created from template"
else
    print_warning "Environment file already exists"
fi

# Install dependencies
print_status "Installing Node.js dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Node.js dependencies installed"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

# Build shared package
print_status "Building shared package..."
cd shared
npm install
npm run build
cd ..
print_success "Shared package built"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..
print_success "Frontend dependencies installed"

# Set up Python virtual environment
print_status "Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
print_success "Python virtual environment set up"

# Start Docker services
print_status "Starting Docker services..."
docker-compose up -d
if [ $? -eq 0 ]; then
    print_success "Docker services started"
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check if Weaviate is ready
    if curl -f -s http://localhost:8080/v1/.well-known/ready > /dev/null; then
        print_success "Weaviate is ready"
    else
        print_warning "Weaviate may still be starting up"
    fi
else
    print_error "Failed to start Docker services"
    exit 1
fi

# Create initial configuration files
print_status "Creating configuration files..."

# Create frontend index.html
cat > frontend/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/entropy-icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Entropy - Contextual Idea Exploration</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

print_success "Configuration files created"

# Final setup message
echo ""
echo "🎉 Entropy setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy env.example to .env and configure your API keys"
echo "2. Start the development servers:"
echo "   npm run dev:all"
echo ""
echo "Access points:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:8000"
echo "- API Documentation: http://localhost:8000/docs"
echo "- Weaviate: http://localhost:8080"
echo ""
echo "Happy exploring! 🧠✨" 