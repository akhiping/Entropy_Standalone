import React, { useState, useRef, useEffect } from 'react';
import { useMindmapStore } from '../../stores/mindmapStore';

export const ChatInterface: React.FC = () => {
  const { 
    mindmap, 
    selectedText, 
    isProcessing,
    sendMessage,
    setSelectedText 
  } = useMindmapStore();
  
  const [input, setInput] = useState('');
  const [showBranchButton, setShowBranchButton] = useState(false);
  const [branchButtonPosition, setBranchButtonPosition] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get the active thread
  const activeThread = mindmap?.threads?.find((t: any) => t.id === mindmap.activeThreadId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      await sendMessage(input);
      setInput('');
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      if (text.length > 5) { // Minimum selection length
        setSelectedText(text);
        
        // Get selection position
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setBranchButtonPosition({
          x: rect.right + 10,
          y: rect.top + rect.height / 2
        });
        setShowBranchButton(true);
      }
    } else {
      setShowBranchButton(false);
      setSelectedText('');
    }
  };

  const handleCreateBranch = () => {
    if (selectedText) {
      // For now, just show an alert - we'll implement proper branching later
      alert(`Creating branch for: "${selectedText}"`);
      setShowBranchButton(false);
      setSelectedText('');
      window.getSelection()?.removeAllRanges();
    }
  };

  // Show welcome screen if no messages exist
  if (!activeThread || activeThread.messages.length === 0) {
    return (
      <div className="flex flex-col h-full bg-primary">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-secondary max-w-md">
            <h2 className="text-xl font-semibold mb-2 text-primary">Ready to Explore Ideas</h2>
            <p className="text-sm mb-6">
              Start a conversation below to begin exploring ideas through contextual branching
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-primary">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message to get started..."
              className="flex-1 px-4 py-2 bg-secondary border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-primary"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="px-6 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-primary relative">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-primary bg-secondary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-primary">
              {activeThread.title}
            </h1>
            <p className="text-sm text-secondary">
              {activeThread.messages.length} messages
            </p>
          </div>
          
          <div className="text-sm text-tertiary">
            {activeThread.isMainThread ? 'Main Thread' : 'Branch Thread'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        onMouseUp={handleTextSelection}
      >
        {activeThread.messages.map((message: any) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-accent-primary text-white'
                  : 'bg-secondary text-primary border border-primary'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap select-text">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-secondary text-primary border border-primary px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Branch Button */}
      {showBranchButton && (
        <div
          className="fixed z-50 branch-button"
          style={{
            left: `${branchButtonPosition.x}px`,
            top: `${branchButtonPosition.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <button
            onClick={handleCreateBranch}
            className="px-3 py-1.5 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-accent-secondary transition-colors shadow-lg border-2 border-white"
          >
            + Branch
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-primary bg-secondary">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-primary border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary text-primary"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-6 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? '...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Selection indicator */}
      {selectedText && (
        <div className="px-4 py-2 bg-accent-primary/10 border-t border-accent-primary/20">
          <div className="text-xs text-accent-primary">
            ✂️ Selected: "{selectedText.slice(0, 50)}..." 
            <span className="ml-2">Highlight text to create branches!</span>
          </div>
        </div>
      )}
    </div>
  );
}; 