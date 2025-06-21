import React from 'react';
import { useMindmapStore } from '../../stores/mindmapStore';

export const Toolbar: React.FC = () => {
  const { 
    setActiveView, 
    addStickyNote, 
    theme, 
    toggleTheme,
    mindmap 
  } = useMindmapStore();

  const handleAddSticky = () => {
    // Create a new sticky note at a random position
    const randomPosition = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    };
    
    addStickyNote('New Idea', randomPosition);
    
    // Switch to mindmap view to see the new sticky
    setActiveView('mindmap');
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
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center border-2 border-accent-primary shadow-sm">
            <img 
              src="/entropy_icon_akhi.jpg" 
              alt="Entropy Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary">Entropy</h1>
            <p className="text-xs text-secondary">Contextual Idea Exploration</p>
          </div>
        </div>
      </div>

      {/* Center section */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleAddSticky}
          className="flex items-center space-x-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
        >
          <span className="text-sm">+ Add Sticky</span>
        </button>
        
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-tertiary transition-colors"
        >
          <span className="text-sm"> Save</span>
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        <div className="text-xs text-secondary">
          {messageCount} messages
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-tertiary transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
        
        <button
          onClick={handleSettings}
          className="p-2 rounded-lg hover:bg-tertiary transition-colors"
          title="Settings"
        >
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        <div className="text-xs text-tertiary">
          Entropy v1.0.0
        </div>
      </div>
    </div>
  );
}; 