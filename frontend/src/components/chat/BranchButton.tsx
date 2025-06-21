import React from 'react';
import { GitBranch, Plus } from 'lucide-react';

interface BranchButtonProps {
  selectedText: string;
  position: DOMRect;
  onCreateBranch: () => void;
}

export const BranchButton: React.FC<BranchButtonProps> = ({
  selectedText,
  position,
  onCreateBranch,
}) => {
  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center space-x-2 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: position.right + 10,
        top: position.top - 40,
      }}
    >
      <div className="flex items-center space-x-2 text-sm text-gray-700">
        <GitBranch className="w-4 h-4 text-indigo-600" />
        <span className="font-medium">Create Branch</span>
      </div>
      
      <button
        onClick={onCreateBranch}
        className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        <Plus className="w-3 h-3" />
        <span>Branch</span>
      </button>
      
      {/* Tooltip arrow */}
      <div
        className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-gray-200 rotate-45"
      />
    </div>
  );
}; 