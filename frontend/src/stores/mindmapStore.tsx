import React, { createContext, useContext, ReactNode } from 'react'
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Sticky, Branch, LLMConfig, RAGConfig } from '@entropy/shared'

// Types for the store
interface MindmapState {
  // Data
  stickies: Record<string, Sticky>
  branches: Record<string, Branch>
  selectedStickyId: string | null
  
  // UI State
  isLoading: boolean
  isSidebarOpen: boolean
  activeView: 'mindmap' | 'timeline' | 'search'
  
  // Configuration
  llmConfig: LLMConfig
  ragConfig: RAGConfig
  
  // Actions
  addSticky: (sticky: Partial<Sticky>) => Promise<void>
  updateSticky: (id: string, updates: Partial<Sticky>) => Promise<void>
  deleteSticky: (id: string) => Promise<void>
  selectSticky: (id: string | null) => void
  
  addBranch: (branch: Partial<Branch>) => void
  updateBranch: (id: string, updates: Partial<Branch>) => void
  deleteBranch: (id: string) => void
  
  generateResponse: (stickyId: string, query: string) => Promise<void>
  searchSimilar: (query: string) => Promise<Sticky[]>
  
  // UI Actions
  setLoading: (loading: boolean) => void
  toggleSidebar: () => void
  setActiveView: (view: 'mindmap' | 'timeline' | 'search') => void
  updateLLMConfig: (config: Partial<LLMConfig>) => void
  updateRAGConfig: (config: Partial<RAGConfig>) => void
}

// Default configurations
const defaultLLMConfig: LLMConfig = {
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
}

const defaultRAGConfig: RAGConfig = {
  maxContext: 5,
  similarityThreshold: 0.7,
  useReranking: true,
  rerankerModel: 'BAAI/bge-reranker-base',
}

// Create the store
export const useMindmapStore = create<MindmapState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        stickies: {},
        branches: {},
        selectedStickyId: null,
        isLoading: false,
        isSidebarOpen: true,
        activeView: 'mindmap',
        llmConfig: defaultLLMConfig,
        ragConfig: defaultRAGConfig,
        
        // Sticky actions
        addSticky: async (stickyData) => {
          set((state) => {
            state.isLoading = true
          })
          
          try {
            // Generate ID if not provided
            const id = stickyData.id || `sticky_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            const sticky: Sticky = {
              id,
              title: stickyData.title || 'Untitled',
              content: stickyData.content || '',
              query: stickyData.query || '',
              response: stickyData.response || '',
              position: stickyData.position || { x: 100, y: 100 },
              parentId: stickyData.parentId,
              childIds: stickyData.childIds || [],
              branchId: stickyData.branchId || 'default',
              createdAt: new Date(),
              updatedAt: new Date(),
              embedding: stickyData.embedding,
              metadata: stickyData.metadata || {},
            }
            
            // Call API to create sticky
            // TODO: Implement API call
            
            set((state) => {
              state.stickies[id] = sticky
              state.isLoading = false
            })
            
            // If this sticky has a parent, update parent's children
            if (sticky.parentId && get().stickies[sticky.parentId]) {
              set((state) => {
                state.stickies[sticky.parentId!].childIds.push(id)
              })
            }
            
          } catch (error) {
            console.error('Failed to add sticky:', error)
            set((state) => {
              state.isLoading = false
            })
          }
        },
        
        updateSticky: async (id, updates) => {
          set((state) => {
            state.isLoading = true
          })
          
          try {
            // Call API to update sticky
            // TODO: Implement API call
            
            set((state) => {
              if (state.stickies[id]) {
                Object.assign(state.stickies[id], updates, { updatedAt: new Date() })
              }
              state.isLoading = false
            })
            
          } catch (error) {
            console.error('Failed to update sticky:', error)
            set((state) => {
              state.isLoading = false
            })
          }
        },
        
        deleteSticky: async (id) => {
          set((state) => {
            state.isLoading = true
          })
          
          try {
            const sticky = get().stickies[id]
            if (!sticky) return
            
            // Call API to delete sticky
            // TODO: Implement API call
            
            set((state) => {
              // Remove from parent's children
              if (sticky.parentId && state.stickies[sticky.parentId]) {
                const parentChildIds = state.stickies[sticky.parentId].childIds
                const index = parentChildIds.indexOf(id)
                if (index > -1) {
                  parentChildIds.splice(index, 1)
                }
              }
              
              // Update children to remove this parent
              sticky.childIds.forEach(childId => {
                if (state.stickies[childId]) {
                  state.stickies[childId].parentId = undefined
                }
              })
              
              // Remove the sticky
              delete state.stickies[id]
              
              // Deselect if this was selected
              if (state.selectedStickyId === id) {
                state.selectedStickyId = null
              }
              
              state.isLoading = false
            })
            
          } catch (error) {
            console.error('Failed to delete sticky:', error)
            set((state) => {
              state.isLoading = false
            })
          }
        },
        
        selectSticky: (id) => {
          set((state) => {
            state.selectedStickyId = id
          })
        },
        
        // Branch actions
        addBranch: (branchData) => {
          const id = branchData.id || `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          const branch: Branch = {
            id,
            title: branchData.title || 'New Branch',
            description: branchData.description,
            color: branchData.color || '#6366f1',
            stickyIds: branchData.stickyIds || [],
            parentBranchId: branchData.parentBranchId,
            childBranchIds: branchData.childBranchIds || [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          set((state) => {
            state.branches[id] = branch
          })
        },
        
        updateBranch: (id, updates) => {
          set((state) => {
            if (state.branches[id]) {
              Object.assign(state.branches[id], updates, { updatedAt: new Date() })
            }
          })
        },
        
        deleteBranch: (id) => {
          set((state) => {
            delete state.branches[id]
          })
        },
        
        // AI actions
        generateResponse: async (stickyId, query) => {
          set((state) => {
            state.isLoading = true
          })
          
          try {
            // TODO: Implement API call to generate response
            const response = `AI response to: ${query}`
            
            set((state) => {
              if (state.stickies[stickyId]) {
                state.stickies[stickyId].response = response
                state.stickies[stickyId].updatedAt = new Date()
              }
              state.isLoading = false
            })
            
          } catch (error) {
            console.error('Failed to generate response:', error)
            set((state) => {
              state.isLoading = false
            })
          }
        },
        
        searchSimilar: async (query) => {
          try {
            // TODO: Implement semantic search API call
            return []
          } catch (error) {
            console.error('Failed to search similar stickies:', error)
            return []
          }
        },
        
        // UI actions
        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading
          })
        },
        
        toggleSidebar: () => {
          set((state) => {
            state.isSidebarOpen = !state.isSidebarOpen
          })
        },
        
        setActiveView: (view) => {
          set((state) => {
            state.activeView = view
          })
        },
        
        updateLLMConfig: (config) => {
          set((state) => {
            Object.assign(state.llmConfig, config)
          })
        },
        
        updateRAGConfig: (config) => {
          set((state) => {
            Object.assign(state.ragConfig, config)
          })
        },
      }))
    ),
    {
      name: 'mindmap-store',
    }
  )
)

// Context for providing the store
const MindmapContext = createContext<ReturnType<typeof useMindmapStore> | null>(null)

interface MindmapProviderProps {
  children: ReactNode
}

export const MindmapProvider: React.FC<MindmapProviderProps> = ({ children }) => {
  return (
    <MindmapContext.Provider value={useMindmapStore}>
      {children}
    </MindmapContext.Provider>
  )
}

// Hook to use the context
export const useMindmap = () => {
  const context = useContext(MindmapContext)
  if (!context) {
    throw new Error('useMindmap must be used within a MindmapProvider')
  }
  return context()
} 