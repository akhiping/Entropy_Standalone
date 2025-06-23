import React from 'react'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

import { MindmapProvider, useMindmapStore } from './stores/mindmapStore'
import { ChatInterface } from './components/chat/ChatInterface'
import { MindmapCanvas } from './components/mindmap/MindmapCanvas'
import { StickyOverlay } from './components/mindmap/StickyOverlay'
import { Sidebar } from './components/ui/Sidebar'
import { Toolbar } from './components/ui/Toolbar'
import { Minimap } from './components/mindmap/Minimap'

function AppContent() {
  const { activeView, theme, setTheme, mindmap } = useMindmapStore()
  
  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('entropy-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Default to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  }, [setTheme])

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('entropy-theme', theme)
  }, [theme])

  const renderMainContent = () => {
    switch (activeView) {
      case 'chat':
        return <ChatInterface />
      case 'mindmap':
        return <MindmapCanvas />
      default:
        return <ChatInterface />
    }
  }

  return (
    <div className="h-screen w-full bg-secondary text-primary flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <Toolbar />
        
        {/* Main view */}
        <div className="flex-1 overflow-hidden relative">
          {renderMainContent()}
          
          {/* Global sticky notes overlay - shows in all views except mindmap (which renders its own) */}
          {mindmap?.stickies && activeView !== 'mindmap' && mindmap.stickies.map((sticky) => (
            <StickyOverlay
              key={sticky.id}
              data={{
                id: sticky.id,
                title: sticky.title,
                content: sticky.content,
                color: sticky.color,
                isMinimized: sticky.isMinimized,
                chatHistory: sticky.chatHistory,
                stackId: sticky.stackId,
                stackIndex: sticky.stackIndex,
                zIndex: sticky.zIndex,
                position: sticky.position,
              }}
            />
          ))}
          
          {/* Global Minimap - shows when there are sticky notes */}
          {mindmap?.stickies && mindmap.stickies.length > 0 && activeView !== 'mindmap' && (
            <Minimap />
          )}
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <MindmapProvider>
      <AppContent />
    </MindmapProvider>
  )
}

export default App 