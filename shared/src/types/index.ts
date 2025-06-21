import { z } from 'zod';

// Message in a conversation thread
export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.date(),
  selectedText: z.string().optional(), // Text that was highlighted to create this message
  parentMessageId: z.string().optional(), // For branching from specific messages
});

// Conversation thread (what powers each sticky/portal)
export const ThreadSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(MessageSchema),
  parentThreadId: z.string().optional(), // Thread this branched from
  branchPoint: z.string().optional(), // Message ID where branch started
  isMainThread: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional(),
});

// Sticky note representing a conversation branch
export const StickySchema = z.object({
  id: z.string(),
  threadId: z.string(), // Links to conversation thread
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.object({
    width: z.number().default(300),
    height: z.number().default(200),
  }),
  isExpanded: z.boolean().default(false),
  isActive: z.boolean().default(false), // Currently active portal
  stackPosition: z.number().default(0), // For sibling stacking
  parentStickyId: z.string().optional(), // For stacked siblings
  previewText: z.string().optional(), // Summary of thread
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Mindmap containing all stickies and threads
export const MindmapSchema = z.object({
  id: z.string(),
  name: z.string(),
  activeThreadId: z.string(), // Currently active conversation thread
  mainThreadId: z.string(), // Original/root conversation thread
  stickies: z.array(StickySchema),
  threads: z.array(ThreadSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Context for RAG/embeddings
export const ContextSchema = z.object({
  threadId: z.string(),
  relevantMessages: z.array(MessageSchema),
  relevantThreads: z.array(z.string()), // Thread IDs for context
  embeddings: z.array(z.number()).optional(),
  similarity: z.number().optional(),
});

// Branch creation request
export const BranchRequestSchema = z.object({
  selectedText: z.string(),
  sourceMessageId: z.string(),
  sourceThreadId: z.string(),
  newQuery: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

// LLM configuration
export const LLMConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'ollama']),
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().default(2000),
  systemPrompt: z.string().optional(),
});

// Export types
export type Message = z.infer<typeof MessageSchema>;
export type Thread = z.infer<typeof ThreadSchema>;
export type Sticky = z.infer<typeof StickySchema>;
export type Mindmap = z.infer<typeof MindmapSchema>;
export type Context = z.infer<typeof ContextSchema>;
export type BranchRequest = z.infer<typeof BranchRequestSchema>;
export type LLMConfig = z.infer<typeof LLMConfigSchema>; 