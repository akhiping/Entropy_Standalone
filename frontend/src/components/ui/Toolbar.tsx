import React from 'react';
import { useMindmapStore } from '../../stores/mindmapStore';

export const Toolbar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    theme, 
    toggleTheme,
    createSticky
  } = useMindmapStore();

  const handleAddSticky = () => {
    createSticky('New Idea');
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save clicked');
  };

  const handleSettings = () => {
    // TODO: Implement settings functionality
    console.log('Settings clicked');
  };

  const messageCount = 0; // Will fix this later when threads are properly implemented

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-secondary border-b border-primary">
      {/* Left side - Logo and Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setActiveView('chat')}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <img 
            src="/entropy_icon_akhi.jpg" 
            alt="Entropy" 
            className="w-12 h-12 rounded-lg border-2 border-primary shadow-md"
          />
          <div>
            <h1 className="text-xl font-bold text-primary">Entropy</h1>
            <p className="text-sm text-secondary">Contextual Idea Exploration</p>
          </div>
        </button>
      </div>

      {/* Center - Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleAddSticky}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-secondary transition-colors shadow-sm border border-accent-primary"
        >
          + Add Sticky
        </button>
        
        <button className="px-4 py-2 bg-tertiary text-primary rounded-lg font-medium hover:bg-secondary transition-colors border border-primary">
          Save
        </button>
      </div>

      {/* Right side - Status and Controls */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-secondary">
          0 messages
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-tertiary transition-colors text-primary"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <button
          onClick={handleSettings}
          className="p-2 rounded-lg hover:bg-tertiary transition-colors text-primary"
          title="Settings"
        >
          ⚙️
        </button>
        
        <div className="text-sm text-tertiary">
          Entropy v1.0.0
        </div>
      </div>
    </div>
  );
}; 