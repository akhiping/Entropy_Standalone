import React, { useState } from 'react';
import { useMindmapStore } from '../../stores/mindmapStore';

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stickies' | 'branches' | 'settings'>('branches');
  // const { mindmap, activeView, setActiveView } = useMindmapStore(); // Will use this later
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-secondary border-r border-primary flex flex-col">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 hover:bg-tertiary transition-colors text-primary"
          title="Expand Sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-secondary border-r border-primary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary">
        <div>
          <h2 className="text-lg font-semibold text-primary">Entropy</h2>
          <p className="text-sm text-secondary">Contextual Idea Exploration</p>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-tertiary rounded transition-colors text-secondary"
          title="Collapse Sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-primary">
        {(['stickies', 'branches', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-accent-primary border-b-2 border-accent-primary bg-primary'
                : 'text-secondary hover:text-primary hover:bg-tertiary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'stickies' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Recent Stickies</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-primary border border-primary rounded-lg hover:bg-tertiary transition-colors cursor-pointer">
                <h4 className="text-sm font-medium text-primary">Welcome to Entropy</h4>
                <p className="text-xs text-secondary mt-1">What is Entropy?</p>
                <p className="text-xs text-tertiary mt-1">Just now</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-8 text-secondary">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm text-center text-secondary">Create your first sticky note to get started</p>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Branches</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-accent-primary/10 rounded-lg border border-accent-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-primary rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-primary">Main Branch</div>
                    <div className="text-xs text-secondary">1 sticky note</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center py-8 text-secondary">
                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm text-center text-secondary">Branches will appear as your mindmap grows</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary">Theme</label>
                <div className="mt-1">
                  <select className="w-full px-3 py-2 bg-primary border border-primary rounded text-primary text-sm appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em"}}>
                    <option>Auto (System)</option>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-primary">AI Provider</label>
                <div className="mt-1">
                  <select className="w-full px-3 py-2 bg-primary border border-primary rounded text-primary text-sm appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em"}}>
                    <option>OpenAI GPT-4</option>
                    <option>Claude 3</option>
                    <option>Local Ollama</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-primary">Auto-save</label>
                <div className="mt-1">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-primary" defaultChecked />
                    <span className="ml-2 text-sm text-secondary">Save changes automatically</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-primary">
        <div className="text-center">
          <div className="text-xs text-secondary mb-1">Connected to Weaviate</div>
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-secondary">Services Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 