# Entropy - Contextual Idea Exploration Platform

Entropy is a standalone web application for idea exploration and contextual thinking, featuring a mindmap-style interface powered by RAG (Retrieval-Augmented Generation) and intelligent branching.

## Features

- **Interactive Mindmap**: Drag-and-drop sticky notes with visual branching
- **RAG-Powered Responses**: Context-aware AI responses using semantic retrieval
- **Multi-LLM Support**: Pluggable adapter for OpenAI, Claude, Ollama, and more
- **Smart Branching**: Automatic topic deviation detection and branch creation
- **Vector Search**: Semantic similarity search across conversation history
- **Reranking**: Advanced context reranking for improved relevance

## Architecture

```
entropy_standalone/
├── frontend/          # React + TypeScript + React Flow
├── backend/           # FastAPI + Python
├── shared/            # Shared types and utilities
├── docker/            # Docker configurations
└── docs/              # Documentation
```

## Tech Stack

### Frontend
- React 18 + TypeScript
- React Flow (mindmap visualization)
- Zustand (state management)
- Tailwind CSS (styling)
- Vite (build tool)

### Backend
- FastAPI (Python web framework)
- Weaviate (vector database)
- OpenAI/HuggingFace (embeddings)
- BGE Reranker (context reranking)
- Pydantic (data validation)

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose

### Development Setup

1. **Clone and setup**:
   ```bash
   cd entropy_standalone
   ./setup.sh
   ```

2. **Start services**:
   ```bash
   docker-compose up -d  # Start Weaviate
   npm run dev:all       # Start both frontend and backend
   ```

3. **Access**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# LLM Providers
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Vector Database
WEAVIATE_URL=http://localhost:8080
WEAVIATE_API_KEY=optional

# Application
ENVIRONMENT=development
LOG_LEVEL=INFO
```

## Development

- `npm run dev:frontend` - Start frontend dev server
- `npm run dev:backend` - Start backend dev server
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run build` - Build for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Contributors

Akhila Pingali

## License

MIT License - see LICENSE file for details. 