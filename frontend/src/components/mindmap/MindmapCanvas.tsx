import React, { useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useMindmapStore } from '../../stores/mindmapStore'
import { StickyNode } from './StickyNode'

// Custom node types
const nodeTypes: NodeTypes = {
  sticky: StickyNode,
}

export const MindmapCanvas: React.FC = () => {
  const mindmap = useMindmapStore((state) => state.mindmap)
  const updateStickyPosition = useMindmapStore((state) => state.updateStickyPosition)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Convert stickies to React Flow nodes
  useEffect(() => {
    if (!mindmap) return

    const stickyNodes: Node[] = mindmap.stickies.map((sticky) => ({
      id: sticky.id,
      type: 'sticky',
      position: sticky.position,
      data: {
        id: sticky.id,
        title: sticky.title,
        content: sticky.content,
        branchId: sticky.branchId,
      },
      draggable: true,
    }))

    setNodes(stickyNodes)

    // Create edges between stickies based on their relationships
    const stickyEdges: Edge[] = []
    mindmap.stickies.forEach((sticky) => {
      if (sticky.parentStickyId) {
        const parentExists = mindmap.stickies.some(s => s.id === sticky.parentStickyId)
        if (parentExists) {
          stickyEdges.push({
            id: `${sticky.parentStickyId}-${sticky.id}`,
            source: sticky.parentStickyId,
            target: sticky.id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: 'var(--accent-primary)', strokeWidth: 2 },
          })
        }
      }
    })

    setEdges(stickyEdges)
  }, [mindmap, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateStickyPosition(node.id, node.position)
    },
    [updateStickyPosition]
  )

  if (!mindmap) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary">
        <div className="text-center">
          <div className="text-2xl mb-2">🧠</div>
          <div>No mindmap data available</div>
        </div>
      </div>
    )
  }

  if (mindmap.stickies.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary">
        <div className="text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-xl font-semibold mb-2 text-primary">Your Mindmap Awaits</h3>
          <p className="text-sm max-w-md">
            Click "Add Sticky" to create your first idea node, or start a conversation to generate branches!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-primary">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="mindmap-canvas"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="var(--border-primary)"
        />
        <Controls 
          showInteractive={false}
          className="react-flow-controls"
        />
        <MiniMap 
          zoomable 
          pannable 
          className="react-flow-minimap"
          nodeColor="var(--accent-primary)"
        />
      </ReactFlow>
    </div>
  )
} 