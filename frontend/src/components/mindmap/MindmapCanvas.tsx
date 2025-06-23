import React from 'react'
import { StickyOverlay } from './StickyOverlay'
import { Minimap } from './Minimap'
import { useMindmapStore } from '../../stores/mindmapStore'

export const MindmapCanvas: React.FC = () => {
  const { mindmap } = useMindmapStore()

  if (!mindmap) {
    return (
      <div className="flex-1 flex items-center justify-center bg-primary">
        <div className="text-center space-y-4">
          <div className="text-6xl">🗺️</div>
          <h2 className="text-2xl font-semibold text-primary">Mindmap View</h2>
          <p className="text-secondary max-w-md">
            Your sticky notes and idea branches will appear here.
          </p>
        </div>
      </div>
    )
  }

  if (!mindmap.stickies || mindmap.stickies.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-primary relative">
        <div className="text-center space-y-4">
          <div className="text-6xl">📌</div>
          <h2 className="text-2xl font-semibold text-primary">No Sticky Notes Yet</h2>
          <p className="text-secondary max-w-md">
            Go to the chat and highlight text to create your first sticky note, or use the "Add Sticky" button.
          </p>
        </div>
        <Minimap />
      </div>
    )
  }

  return (
    <div className="flex-1 h-full relative bg-primary">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #666 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Render sticky notes as fixed overlays */}
      {mindmap.stickies.map((sticky) => (
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
      
      {/* Minimap overlay */}
      <Minimap />
    </div>
  )
} 