import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useMindmapStore } from '../../stores/mindmapStore';

interface StickyNodeData {
  id: string;
  title: string;
  content: string;
  branchId: string;
}

export const StickyNode: React.FC<NodeProps<StickyNodeData>> = ({ data }) => {
  const { setActiveView } = useMindmapStore();

  const handlePortalEnter = () => {
    // For now, just switch to chat view
    setActiveView('chat');
  };

  const truncatedContent = data.content.length > 100 
    ? data.content.substring(0, 100) + '...' 
    : data.content;

  return (
    <div className="sticky-node bg-primary border-2 border-primary rounded-lg shadow-lg p-4 min-w-64 max-w-80">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-accent-primary border-2 border-white"
      />
      
      <div className="sticky-content">
        <h3 className="text-sm font-semibold text-primary mb-2 line-clamp-2">
          {data.title}
        </h3>
        
        <div className="text-xs text-secondary mb-3 line-clamp-4">
          {truncatedContent}
        </div>
        
        <button
          onClick={handlePortalEnter}
          className="w-full px-3 py-1.5 bg-accent-primary text-white text-xs font-medium rounded hover:bg-accent-secondary transition-colors duration-200"
        >
          Enter Portal
        </button>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-accent-primary border-2 border-white"
      />
    </div>
  );
}; 