import React, { useState, useRef, useCallback } from 'react';
import { Send, MessageSquare, GitBranch } from 'lucide-react';
import { useMindmapStore } from '../../stores/mindmapStore';
import type { Message, Thread } from '@entropy/shared';
import { MessageBubble } from './MessageBubble';
import { BranchButton } from './BranchButton';

interface ChatInterfaceProps {
  thread: Thread;
  onCreateBranch: (selectedText: string, messageId: string, position: { x: number; y: number }) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ thread, onCreateBranch }) => {
  const [input, setInput] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading } = useMindmapStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    
    await sendMessage(thread.id, message);
    scrollToBottom();
  }, [input, isLoading, thread.id, sendMessage, scrollToBottom]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText('');
      setSelectionRect(null);
      setSelectedMessageId(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 10) return; // Minimum selection length

    // Find which message contains the selection
    const range = selection.getRangeAt(0);
    const messageElement = range.commonAncestorContainer.parentElement?.closest('[data-message-id]');
    const messageId = messageElement?.getAttribute('data-message-id');

    if (messageId) {
      setSelectedText(text);
      setSelectedMessageId(messageId);
      setSelectionRect(range.getBoundingClientRect());
    }
  }, []);

  const handleCreateBranch = useCallback(() => {
    if (!selectedText || !selectedMessageId || !selectionRect) return;

    // Position sticky near the selection
    const position = {
      x: selectionRect.right + 20,
      y: selectionRect.top - 100,
    };

    onCreateBranch(selectedText, selectedMessageId, position);
    
    // Clear selection
    setSelectedText('');
    setSelectionRect(null);
    setSelectedMessageId(null);
    window.getSelection()?.removeAllRanges();
  }, [selectedText, selectedMessageId, selectionRect, onCreateBranch]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">{thread.title}</h2>
          {thread.parentThreadId && (
            <div className="flex items-center text-sm text-gray-500">
              <GitBranch className="w-4 h-4 mr-1" />
              Branched conversation
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {thread.messages.length} messages
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onMouseUp={handleTextSelection}
      >
        {thread.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSelected={selectedMessageId === message.id}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span>Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Branch Button */}
      {selectedText && selectionRect && (
        <BranchButton
          selectedText={selectedText}
          position={selectionRect}
          onCreateBranch={handleCreateBranch}
        />
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={input.split('\n').length}
            maxLength={2000}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {selectedText && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
            ✂️ Selected: "{selectedText.slice(0, 50)}..." 
            <span className="text-blue-600 ml-2">Highlight text to create branches!</span>
          </div>
        )}
      </div>
    </div>
  );
}; 