# Getting Started with Entropy

This guide will help you set up and run the Entropy application locally.

## Quick Start

The fastest way to get started is to run the setup script:

```bash
./setup.sh
```

This script will:
- Check prerequisites (Node.js, Python, Docker)
- Create the directory structure
- Install all dependencies
- Start Docker services
- Build the shared package

## Manual Setup

If you prefer to set up manually or encounter issues with the script:

### 1. Prerequisites

Make sure you have the following installed:
- **Node.js 18+**: [Download here](https://nodejs.org/)
- **Python 3.9+**: [Download here](https://python.org/)
- **Docker & Docker Compose**: [Download here](https://docker.com/)

### 2. Environment Configuration

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   # ... other configuration
   ```

### 3. Install Dependencies

Install Node.js workspace dependencies:
```bash
npm install
```

Build the shared package:
```bash
cd shared
npm install
npm run build
cd ..
```

Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

Set up Python backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 4. Start Services

Start the cache service:
```bash
docker-compose up -d
```

Wait for Redis to be ready (about 10 seconds), then check:
```bash
docker-compose ps  # Check service status
```

### 5. Run the Application

Start both frontend and backend:
```bash
npm run dev:all
```

Or start them separately:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

## Access Points

Once running, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Development Workflow

### Adding New Features

1. **Shared Types**: Add new types to `shared/src/types/index.ts`
2. **Backend Logic**: Implement in `backend/app/services/`
3. **API Endpoints**: Add routes in `backend/app/api/routes/`
4. **Frontend Components**: Create in `frontend/src/components/`
5. **State Management**: Update `frontend/src/stores/`

### Testing

```bash
# Run all tests
npm run test

# Frontend tests only
cd frontend && npm run test

# Backend tests only
cd backend && pytest
```

### Building for Production

```bash
npm run build
```

## Troubleshooting

### Common Issues

**Docker services not starting:**
```bash
docker-compose down
docker-compose up -d --force-recreate
```

**Port conflicts:**
- Frontend (5173): Change in `frontend/vite.config.ts`
- Backend (8000): Change in `backend/main.py`
- Redis (6379): Change in `docker-compose.yml`

**Dependencies not installing:**
```bash
# Clear npm cache
npm cache clean --force

# Clear Python cache
cd backend && rm -rf venv && python3 -m venv venv
```

**TypeScript errors:**
```bash
# Rebuild shared package
cd shared && npm run build

# Restart TypeScript server in your editor
```

### Logs

View application logs:
```bash
# Docker services
docker-compose logs -f

# Backend logs (when running)
tail -f backend/logs/app.log
```

## Next Steps

1. **Configure API Keys**: Add your LLM provider API keys to `.env`
2. **Explore the UI**: Create your first sticky note in the mindmap
3. **Test RAG**: Try creating connected thoughts to see contextual responses
4. **Customize**: Modify the LLM and RAG settings in the sidebar

## Need Help?

- Check the [API Documentation](http://localhost:8000/docs) for backend endpoints
- Review the code structure in the main [README.md](./README.md)
- Open an issue if you encounter bugs or have questions

Happy exploring! 🌀✨ 