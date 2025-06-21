import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import React from 'react'

// Simple local types for now - we'll integrate with shared types later
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  selectedText?: string
  parentMessageId?: string
}

interface Thread {
  id: string
  title: string
  messages: Message[]
  parentThreadId?: string
  branchPoint?: string
  isMainThread: boolean
  createdAt: Date
  updatedAt: Date
}

interface Sticky {
  id: string
  threadId: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  isExpanded: boolean
  isActive: boolean
  stackPosition: number
  parentStickyId?: string
  previewText?: string
  createdAt: Date
  updatedAt: Date
}

interface Mindmap {
  id: string
  name: string
  activeThreadId: string
  mainThreadId: string
  stickies: Sticky[]
  threads: Thread[]
  createdAt: Date
  updatedAt: Date
}

interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama'
  model: string
  temperature: number
  maxTokens: number
}

interface BranchRequest {
  selectedText: string
  sourceMessageId: string
  sourceThreadId: string
  newQuery: string
  position: { x: number; y: number }
}

interface MindmapState {
  // Core State
  mindmap: Mindmap | null
  activeThreadId: string | null
  isLoading: boolean
  error: string | null
  
  // Configuration
  llmConfig: LLMConfig
  
  // Actions
  initializeMindmap: () => void
  createThread: (title: string, initialMessage?: string) => Promise<string>
  sendMessage: (content: string) => Promise<void>
  createBranchFromSelection: (request: BranchRequest) => Promise<string>
  switchToThread: (threadId: string) => void
  createStickyFromThread: (threadId: string, position: { x: number; y: number }) => void
  moveSticky: (stickyId: string, position: { x: number; y: number }) => void
  stackStickies: (parentStickyId: string, childStickyId: string) => void
  enterStickyPortal: (stickyId: string) => void
  
  // Getters
  getActiveThread: () => Thread | null
  getThreadById: (threadId: string) => Thread | null
  getStickyById: (stickyId: string) => Sticky | null

  // New state
  activeView: 'chat' | 'mindmap'
  selectedText: string
  isProcessing: boolean
  theme: 'light' | 'dark'
  
  // New actions
  setActiveView: (view: 'chat' | 'mindmap') => void
  setSelectedText: (text: string) => void
  addStickyNote: (title: string, position?: { x: number; y: number }) => void
  updateStickyPosition: (stickyId: string, position: { x: number; y: number }) => void
  deleteStickyNote: (stickyId: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
}

// Initial LLM configuration
const defaultLLMConfig: LLMConfig = {
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 2000,
}

// Create initial mindmap
const createInitialMindmap = (): Mindmap => {
  const mainThreadId = uuidv4()
  return {
    id: uuidv4(),
    name: 'My Mindmap',
    activeThreadId: mainThreadId,
    mainThreadId: mainThreadId,
    stickies: [],
    threads: [{
      id: mainThreadId,
      title: 'Main Thread',
      messages: [], // Start with empty messages - no welcome message
      isMainThread: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

// Mock AI response function (replace with actual API call)
async function mockAIResponse(message: string, threadId: string, mindmap: Mindmap | null): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // Get context from thread history
  const thread = mindmap?.threads.find(t => t.id === threadId)
  const messageHistory = thread?.messages || []
  
  // Simple mock responses based on content
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return "Hello! I'm excited to explore ideas with you. What topic interests you most right now?"
  }
  
  if (message.toLowerCase().includes('explain') || message.toLowerCase().includes('what is')) {
    return `Great question! Let me break this down for you:\n\n• **Context**: Based on our conversation, I can see you're interested in understanding concepts deeply\n• **Approach**: I'll provide both theoretical background and practical examples\n• **Next steps**: Feel free to highlight any part of my response to branch into more specific discussions\n\nWhat specific aspect would you like me to elaborate on further?`
  }
  
  if (message.toLowerCase().includes('how') || message.toLowerCase().includes('process')) {
    return `Here's a step-by-step approach:\n\n1. **Start with fundamentals** - Build a solid foundation\n2. **Practice regularly** - Consistent application reinforces learning\n3. **Seek feedback** - External perspectives reveal blind spots\n4. **Iterate and improve** - Continuous refinement leads to mastery\n\nWhich step would you like to dive deeper into? You can highlight any part of this response to create a focused branch discussion.`
  }
  
  // Default contextual response
  const contextualElements = [
    "That's a fascinating direction to explore!",
    "Building on our previous discussion,",
    "This connects well with what we were talking about earlier.",
    "Let me expand on that thought:",
  ]
  
  const randomContext = contextualElements[Math.floor(Math.random() * contextualElements.length)]
  
  return `${randomContext}\n\n**Your question**: "${message}"\n\n**My thoughts**: This touches on several important aspects that we could explore further. I notice patterns in how these concepts interconnect, and there are multiple angles we could pursue.\n\n**Potential branches**:\n• Deep dive into the technical details\n• Explore practical applications\n• Examine related concepts\n• Discuss alternative perspectives\n\nFeel free to highlight any part of this response to create a new conversation branch, or continue our main discussion thread. What resonates most with you?`
}

export const useMindmapStore = create<MindmapState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      mindmap: null,
      activeThreadId: null,
      isLoading: false,
      error: null,
      llmConfig: defaultLLMConfig,
      activeView: 'chat',
      selectedText: '',
      isProcessing: false,
      theme: 'light',

      // Initialize mindmap
      initializeMindmap: () => {
        const initialMindmap = createInitialMindmap()
        set((state) => {
          state.mindmap = initialMindmap
          state.activeThreadId = initialMindmap.activeThreadId
        })
      },

      // Create new thread
      createThread: async (title: string, initialMessage?: string) => {
        const threadId = uuidv4()
        const messages: Message[] = []
        
        if (initialMessage) {
          messages.push({
            id: uuidv4(),
            role: 'user',
            content: initialMessage,
            timestamp: new Date(),
          })
        }

        const newThread: Thread = {
          id: threadId,
          title,
          messages,
          isMainThread: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => {
          if (state.mindmap) {
            state.mindmap.threads.push(newThread)
            state.mindmap.updatedAt = new Date()
          }
        })

        // Generate AI response if there was an initial message
        if (initialMessage) {
          await get().sendMessage(initialMessage)
        }

        return threadId
      },

      // Send message and get AI response
      sendMessage: async (content: string) => {
        set((state) => {
          state.isProcessing = true
        })

        try {
          // Generate natural mock response based on content
          let mockResponse = ''
          
          const lowerContent = content.toLowerCase()
          
          if (lowerContent.includes('hello') || lowerContent.includes('hi')) {
            mockResponse = "Hello! I'm here to help you explore ideas and have thoughtful conversations. What's on your mind today?"
          } else if (lowerContent.includes('what') || lowerContent.includes('explain')) {
            mockResponse = "That's a great question! Let me share some thoughts on that. The topic you're asking about has several interesting dimensions we could explore together."
          } else if (lowerContent.includes('how')) {
            mockResponse = "There are a few different approaches to consider here. The most effective way usually depends on your specific context and goals. What particular aspect are you most curious about?"
          } else if (lowerContent.includes('why')) {
            mockResponse = "That's an insightful question that gets to the heart of things. The reasoning behind this often comes down to a combination of factors that interact in interesting ways."
          } else {
            // Default conversational responses
            const responses = [
              "That's a fascinating point you bring up. I think there's a lot we could unpack there.",
              "Interesting perspective! That makes me think about how this connects to broader patterns.",
              "I see what you mean. There's definitely more nuance to this than meets the eye.",
              "That's worth exploring further. What aspects of this are you most curious about?",
              "Good observation. This kind of thinking often leads to some really valuable insights.",
              "I appreciate you sharing that. It opens up some interesting avenues for discussion.",
              "That's a thoughtful way to frame it. There are several angles we could take from here."
            ]
            mockResponse = responses[Math.floor(Math.random() * responses.length)]
          }

          set((state) => {
            if (state.mindmap && state.activeThreadId) {
              const activeThread = state.mindmap.threads.find((t) => t.id === state.activeThreadId)
              if (activeThread) {
                // Add user message
                activeThread.messages.push({
                  id: uuidv4(),
                  role: 'user',
                  content,
                  timestamp: new Date(),
                })

                // Add AI response
                activeThread.messages.push({
                  id: uuidv4(),
                  role: 'assistant',
                  content: mockResponse,
                  timestamp: new Date(),
                })

                activeThread.updatedAt = new Date()
                state.mindmap.updatedAt = new Date()
              }
            }
            state.isProcessing = false
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Unknown error'
            state.isProcessing = false
          })
        }
      },

      // Create branch from selected text
      createBranchFromSelection: async (request: BranchRequest) => {
        const branchThreadId = uuidv4()
        const sourceThread = get().getThreadById(request.sourceThreadId)
        const sourceMessage = sourceThread?.messages.find(m => m.id === request.sourceMessageId)

        if (!sourceThread || !sourceMessage) {
          throw new Error('Source thread or message not found')
        }

        // Create branch thread
        const branchThread: Thread = {
          id: branchThreadId,
          title: `Branch: ${request.selectedText.slice(0, 30)}...`,
          messages: [
            {
              id: uuidv4(),
              role: 'user',
              content: request.newQuery,
              timestamp: new Date(),
              selectedText: request.selectedText,
              parentMessageId: request.sourceMessageId,
            }
          ],
          parentThreadId: request.sourceThreadId,
          branchPoint: request.sourceMessageId,
          isMainThread: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Create sticky for the branch
        const sticky: Sticky = {
          id: uuidv4(),
          threadId: branchThreadId,
          position: request.position,
          size: { width: 300, height: 200 },
          isExpanded: false,
          isActive: false,
          stackPosition: 0,
          previewText: request.selectedText.slice(0, 100),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => {
          if (state.mindmap) {
            state.mindmap.threads.push(branchThread)
            state.mindmap.stickies.push(sticky)
            state.mindmap.updatedAt = new Date()
          }
        })

        // Generate AI response for the branch
        await get().sendMessage(request.newQuery)

        return branchThreadId
      },

      // Switch active thread
      switchToThread: (threadId: string) => {
        set((state) => {
          if (state.mindmap) {
            state.mindmap.activeThreadId = threadId
            state.activeThreadId = threadId
            
            // Update sticky states
            state.mindmap.stickies.forEach(sticky => {
              sticky.isActive = sticky.threadId === threadId
            })
          }
        })
      },

      // Create sticky from thread
      createStickyFromThread: (threadId: string, position: { x: number; y: number }) => {
        const thread = get().getThreadById(threadId)
        if (!thread) return

        const sticky: Sticky = {
          id: uuidv4(),
          threadId,
          position,
          size: { width: 300, height: 200 },
          isExpanded: false,
          isActive: false,
          stackPosition: 0,
          previewText: thread.messages[thread.messages.length - 1]?.content.slice(0, 100),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => {
          if (state.mindmap) {
            state.mindmap.stickies.push(sticky)
            state.mindmap.updatedAt = new Date()
          }
        })
      },

      // Move sticky
      moveSticky: (stickyId: string, position: { x: number; y: number }) => {
        set((state) => {
          const sticky = state.mindmap?.stickies.find(s => s.id === stickyId)
          if (sticky) {
            sticky.position = position
            sticky.updatedAt = new Date()
          }
        })
      },

      // Stack stickies
      stackStickies: (parentStickyId: string, childStickyId: string) => {
        set((state) => {
          const parentSticky = state.mindmap?.stickies.find(s => s.id === parentStickyId)
          const childSticky = state.mindmap?.stickies.find(s => s.id === childStickyId)
          
          if (parentSticky && childSticky) {
            childSticky.parentStickyId = parentStickyId
            childSticky.stackPosition = (parentSticky.stackPosition || 0) + 1
            childSticky.position = { ...parentSticky.position }
            childSticky.updatedAt = new Date()
          }
        })
      },

      // Enter sticky portal (switch to its thread)
      enterStickyPortal: (stickyId: string) => {
        const sticky = get().getStickyById(stickyId)
        if (sticky) {
          get().switchToThread(sticky.threadId)
        }
      },

      // Getters
      getActiveThread: () => {
        const state = get()
        if (!state.mindmap || !state.activeThreadId) return null
        return state.mindmap.threads.find(t => t.id === state.activeThreadId) || null
      },

      getThreadById: (threadId: string) => {
        const state = get()
        return state.mindmap?.threads.find(t => t.id === threadId) || null
      },

      getStickyById: (stickyId: string) => {
        const state = get()
        return state.mindmap?.stickies.find(s => s.id === stickyId) || null
      },

      // New actions
      setActiveView: (view: 'chat' | 'mindmap') => {
        set((state) => {
          state.activeView = view
        })
      },

      setSelectedText: (text: string) => {
        set((state) => {
          state.selectedText = text
        })
      },

      addStickyNote: (title: string, position?: { x: number; y: number }) => {
        set((state) => {
          if (state.mindmap) {
            const newSticky: Sticky = {
              id: uuidv4(),
              threadId: uuidv4(), // Create a new thread for this sticky
              position: position || { x: 100, y: 100 },
              size: { width: 300, height: 200 },
              isExpanded: false,
              isActive: false,
              stackPosition: 0,
              previewText: title,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            
            // Create corresponding thread
            const newThread: Thread = {
              id: newSticky.threadId,
              title: title,
              messages: [],
              isMainThread: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            
            state.mindmap.stickies.push(newSticky)
            state.mindmap.threads.push(newThread)
            state.mindmap.updatedAt = new Date()
          }
        })
      },

      updateStickyPosition: (stickyId: string, position: { x: number; y: number }) => {
        set((state) => {
          if (state.mindmap) {
            const sticky = state.mindmap.stickies.find(s => s.id === stickyId)
            if (sticky) {
              sticky.position = position
              sticky.updatedAt = new Date()
            }
          }
        })
      },

      deleteStickyNote: (stickyId: string) => {
        set((state) => {
          if (state.mindmap) {
            state.mindmap.stickies = state.mindmap.stickies.filter(s => s.id !== stickyId)
            state.mindmap.updatedAt = new Date()
          }
        })
      },

      setTheme: (theme: 'light' | 'dark') => {
        set((state) => {
          state.theme = theme
        })
      },

      toggleTheme: () => {
        set((state) => {
          state.theme = state.theme === 'light' ? 'dark' : 'light'
        })
      },
    })),
    {
      name: 'mindmap-store',
      version: 1,
    }
  )
)

// Initialize store on first load
export const initializeStore = () => {
  const store = useMindmapStore.getState()
  if (!store.mindmap) {
    store.initializeMindmap()
  }
}

// Provider component
export const MindmapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    initializeStore()
  }, [])

  return <>{children}</>
} 