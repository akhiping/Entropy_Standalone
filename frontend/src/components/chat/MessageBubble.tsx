import React from 'react';
import { User, Bot } from 'lucide-react';
import type { Message } from '@entropy/shared';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isSelected?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSelected }) => {
  const isUser = message.role === 'user';
  
  return (
    <div
      data-message-id={message.id}
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} ${
        isSelected ? 'bg-blue-50 rounded-lg p-2 -m-2' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-xs lg:max-w-md ${isUser ? 'text-right' : ''}`}>
        {/* Message Bubble */}
        <div
          className={`inline-block px-4 py-2 rounded-lg text-sm leading-relaxed select-text ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm'
          }`}
        >
          {/* Show selected text context if this message branched from selection */}
          {message.selectedText && (
            <div
              className={`mb-2 p-2 rounded text-xs italic border-l-2 ${
                isUser
                  ? 'bg-indigo-500 border-indigo-300 text-indigo-100'
                  : 'bg-gray-50 border-gray-300 text-gray-600'
              }`}
            >
              💬 Continuing from: "{message.selectedText.slice(0, 60)}..."
            </div>
          )}
          
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs text-gray-500 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}; 