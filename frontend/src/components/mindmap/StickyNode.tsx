import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface StickyNodeData {
  id: string;
  title: string;
  content: string;
  query: string;
  response?: string;
  isExpanded?: boolean;
}

const StickyNodeComponent: React.FC<NodeProps<StickyNodeData>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(data.isExpanded || false);

  return (
    <div 
      className={`sticky-note ${selected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`}
      style={{ 
        minWidth: isExpanded ? '320px' : '200px',
        minHeight: isExpanded ? '240px' : '120px',
        maxWidth: '400px'
      }}
    >
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ 
          background: '#6366f1',
          border: '2px solid white',
          width: '8px',
          height: '8px'
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ 
          background: '#6366f1',
          border: '2px solid white',
          width: '8px',
          height: '8px'
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">
          {data.title}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Query */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-1">Query:</div>
          <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded text-left">
            {data.query}
          </div>
        </div>

        {/* Response (only when expanded) */}
        {isExpanded && data.response && (
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Response:</div>
            <div className="text-sm text-gray-700 bg-green-50 p-2 rounded text-left max-h-32 overflow-y-auto">
              {data.response}
            </div>
          </div>
        )}

        {/* Content (only when expanded) */}
        {isExpanded && data.content && (
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Content:</div>
            <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded text-left">
              {data.content}
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator (if no response yet) */}
      {isExpanded && data.query && !data.response && (
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="loading-spinner w-4 h-4"></div>
            <span>Generating response...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const StickyNode = memo(StickyNodeComponent);
export default StickyNode; 