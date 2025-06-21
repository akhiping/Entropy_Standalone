import React, { useCallback } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type OnConnect,
  type Node,
  type Edge,
} from 'reactflow'
import { Toaster } from 'react-hot-toast'

import { MindmapProvider } from './stores/mindmapStore'
import { StickyNode } from './components/mindmap'
import { Toolbar, Sidebar } from './components/ui'

// Custom node types
const nodeTypes = {
  stickyNote: StickyNode,
}

// Initial nodes for demo
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'stickyNote',
    position: { x: 250, y: 250 },
    data: {
      id: 'sticky_1',
      title: 'Welcome to Entropy',
      content: 'This is your first sticky note in the mindmap',
      query: 'What is Entropy?',
      response: 'Entropy is a contextual idea exploration platform that helps you organize and expand your thoughts using AI-powered responses.',
      isExpanded: true,
    },
  },
]

const initialEdges: Edge[] = []

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  return (
    <MindmapProvider>
      <div className="h-screen w-screen flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Toolbar */}
          <Toolbar />
          
          {/* React Flow Canvas */}
          <div className="h-full w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{
                padding: 0.1,
              }}
              className="bg-gray-50"
            >
              <Controls
                position="bottom-left"
                className="!bg-white !border-gray-200 !shadow-lg"
              />
              <MiniMap
                position="bottom-right"
                className="!bg-white !border-gray-200 !shadow-lg"
                maskColor="rgba(0, 0, 0, 0.1)"
                nodeColor="#6366f1"
              />
              <Background
                color="#e5e7eb"
                gap={20}
                size={1}
              />
            </ReactFlow>
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
    </MindmapProvider>
  )
}

export default App 