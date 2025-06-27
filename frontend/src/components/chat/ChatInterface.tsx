import React, { useState, useRef, useEffect } from 'react';
import { useMindmapStore } from '../../stores/mindmapStore';

export const ChatInterface: React.FC = () => {
  const { 
    mindmap, 
    selectedText, 
    isProcessing,
    sendMessage,
    setSelectedText,
    createBranch,
    setActiveView 
  } = useMindmapStore();
  
  const [input, setInput] = useState('');
  const [showBranchButton, setShowBranchButton] = useState(false);
  const [branchButtonPosition, setBranchButtonPosition] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get the active thread
  const activeThread = mindmap?.threads?.find((t: any) => t.id === mindmap.activeThreadId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeThread?.messages]);

  // Handle text selection for creating sticky notes
  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          setShowBranchButton(false);
          return;
        }

        const text = selection.toString().trim();
        if (!text || text.length < 10) {
          setShowBranchButton(false);
          return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Check if selection is within chat container
        if (chatContainerRef.current && chatContainerRef.current.contains(range.commonAncestorContainer)) {
          setBranchButtonPosition({
            x: rect.right + window.scrollX + 10,
            y: rect.bottom + window.scrollY + 5,
          });
          setSelectedText(text);
          setShowBranchButton(true);
        } else {
          setShowBranchButton(false);
        }
      }, 100);
    };

    const handleMouseDown = () => {
      setShowBranchButton(false);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [setSelectedText]);

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateSticky = () => {
    if (!selectedText) return;
    
    // Get the current selection position for sticky placement
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Calculate position relative to the viewport
    const position = {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
    };
    
    // Create the sticky note
    createBranch({
      selectedText,
      position,
      sourceThreadId: activeThread?.id || '',
    });
    
    // Clear selection and hide button
    window.getSelection()?.removeAllRanges();
    setShowBranchButton(false);
    setSelectedText('');
    
    // Don't switch views - keep in chat and show minimap
  };

  if (!activeThread) {
    return (
      <div className="flex-1 flex h-full relative">
        {/* Left space for sticky notes */}
        <div className="w-80 xl:w-80 lg:w-60 md:w-0 flex-shrink-0"></div>
        
        {/* Centered empty state */}
        <div className="flex-1 max-w-4xl flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">🧠</div>
            <h2 className="text-2xl font-semibold text-primary">Ready to Explore Ideas</h2>
            <p className="text-secondary max-w-md">
              Start a conversation or highlight text to create branching discussions and sticky notes.
            </p>
          </div>
        </div>
        
        {/* Right space for sticky notes */}
        <div className="w-80 xl:w-80 lg:w-60 md:w-0 flex-shrink-0"></div>
      </div>
    );
  }

  return (
          <div className="flex-1 flex h-full relative">
        {/* Left space for sticky notes */}
        <div className="w-80 xl:w-80 lg:w-60 md:w-0 flex-shrink-0"></div>
        
        {/* Centered conversation area */}
        <div className="flex-1 max-w-4xl flex flex-col h-full relative">
        {/* Branch Button */}
        {showBranchButton && (
          <button
            onClick={handleCreateSticky}
            style={{
              position: 'fixed',
              left: `${branchButtonPosition.x}px`,
              top: `${branchButtonPosition.y}px`,
              zIndex: 9999,
              background: 'rgba(247, 245, 158, 0.95)',
              border: '2px solid #ddd',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
          >
            📌 Create Sticky
          </button>
        )}

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {activeThread.messages.map((message: any, index: number) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-accent-primary text-white'
                    : 'bg-secondary text-primary'
                }`}
                style={{ userSelect: 'text', cursor: 'text' }}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-4 py-3 bg-secondary text-primary">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-secondary">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-primary p-6">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-primary rounded-lg bg-primary text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary text-base"
            />
            <button
              onClick={handleSendMessage}
              disabled={isProcessing || !input.trim()}
              className="px-6 py-3 bg-accent-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-secondary transition-colors btn-accent"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      
      {/* Right space for sticky notes */}
      <div className="w-80 xl:w-80 lg:w-60 md:w-0 flex-shrink-0"></div>
    </div>
  );
}; 