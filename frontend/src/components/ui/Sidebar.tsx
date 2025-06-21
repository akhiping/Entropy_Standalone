import React, { useState } from 'react';

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stickies' | 'branches' | 'settings'>('stickies');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          title="Expand Sidebar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gradient">Entropy</h1>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            title="Collapse Sidebar"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Contextual Idea Exploration</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {(['stickies', 'branches', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'stickies' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Recent Stickies</h3>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-800">Welcome to Entropy</div>
                <div className="text-xs text-gray-600 mt-1">What is Entropy?</div>
                <div className="text-xs text-gray-500 mt-2">Just now</div>
              </div>
              <div className="text-center py-8 text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-sm">Create your first sticky note to get started</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Branches</h3>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <div className="text-sm font-medium text-gray-800">Main Branch</div>
                </div>
                <div className="text-xs text-gray-600 mt-1">1 sticky note</div>
              </div>
              <div className="text-center py-8 text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Branches will appear as your mindmap grows</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LLM Provider
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="ollama">Ollama</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: 0.7
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Similarity Threshold: 0.7
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  defaultValue="0.7"
                  className="w-full"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <div>Connected to Weaviate</div>
          <div className="flex items-center justify-center mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span>Services Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 