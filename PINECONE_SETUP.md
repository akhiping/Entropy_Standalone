# Pinecone Setup Guide for Entropy

This guide will help you set up Pinecone as your vector database for the Entropy project.

## Prerequisites

1. **Pinecone Account**: Sign up at [pinecone.io](https://pinecone.io)
2. **OpenAI Account**: For embeddings (or use HuggingFace as alternative)

## Step 1: Get Your Pinecone API Key

1. Log into your Pinecone console: https://app.pinecone.io
2. Go to "API Keys" in the left sidebar
3. Create a new API key or copy your existing one
4. Note your environment/region (e.g., "us-east-1")

## Step 2: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your API keys:
   ```env
   # Pinecone Configuration
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_REGION=us-east-1
   PINECONE_CLOUD=aws
   
   # OpenAI for embeddings
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Other settings...
   EMBEDDING_PROVIDER=openai
   EMBEDDING_MODEL=text-embedding-3-small
   ```

## Step 3: Install Dependencies

The new dependencies are already configured in `requirements.txt`. Simply install them:

```bash
cd backend
source venv/bin/activate  # or activate your virtual environment
pip install -r requirements.txt
```

## Step 4: Start the Application

1. Start Redis (only service needed now):
   ```bash
   docker-compose up -d
   ```

2. Start the backend:
   ```bash
   npm run dev:backend
   ```

3. Start the frontend:
   ```bash
   npm run dev:frontend
   ```

## Key Changes from Weaviate

### What's Different:

1. **No Local Vector DB**: Pinecone is cloud-hosted, so no local Docker container needed
2. **Automatic Index Creation**: The app will create the `entropy-stickies` index automatically
3. **Better Performance**: Pinecone offers better performance and scaling
4. **Simplified Setup**: No need to configure and maintain a local vector database

### Index Configuration:

- **Index Name**: `entropy-stickies`
- **Dimensions**: 1536 (for OpenAI text-embedding-3-small)
- **Metric**: Cosine similarity
- **Cloud**: AWS (configurable)
- **Region**: us-east-1 (configurable)

## Troubleshooting

### Common Issues:

1. **API Key Invalid**:
   - Double-check your Pinecone API key
   - Make sure you're using the correct environment/region

2. **Embedding Failures**:
   - Verify your OpenAI API key is valid
   - Check your OpenAI account has credits
   - The app will fall back to dummy embeddings if OpenAI fails

3. **Index Creation Errors**:
   - Make sure your Pinecone plan supports index creation
   - Check you haven't exceeded your index limit
   - Verify the region setting matches your Pinecone project

### Debug Steps:

1. Check logs for any error messages:
   ```bash
   # Backend logs will show initialization status
   npm run dev:backend
   ```

2. Verify Pinecone connection:
   ```bash
   # In Python, test the connection
   python3 -c "
   from pinecone import Pinecone
   pc = Pinecone(api_key='your_api_key')
   print(pc.list_indexes())
   "
   ```

## Pinecone Pricing

- **Starter**: Free tier with limitations
- **Standard**: Pay-as-you-scale pricing
- **Enterprise**: Custom pricing

For development, the free tier should be sufficient. Check [Pinecone pricing](https://www.pinecone.io/pricing/) for current limits.

## Benefits of This Migration

1. **🚀 Performance**: Better query performance and lower latency
2. **📈 Scalability**: Automatic scaling without infrastructure management  
3. **🔒 Reliability**: Enterprise-grade reliability and uptime
4. **🛠️ Simplicity**: No local database to maintain or configure
5. **💰 Cost-Effective**: Pay only for what you use

## Next Steps

Once everything is working:

1. Test creating sticky notes and search functionality
2. Monitor your Pinecone usage in the console
3. Adjust embedding models if needed for cost optimization
4. Consider upgrading your Pinecone plan as your usage grows

Happy vector searching! 🎯 