import React, { useState, useEffect, useRef } from 'react';
import { useMindmapStore } from '../../stores/mindmapStore';

// Color themes from the extension
const COLOR_THEMES = {
  pastel: [
    'rgba(255, 182, 193, 0.85)', // Light pink
    'rgba(221, 160, 221, 0.85)', // Plum
    'rgba(173, 216, 230, 0.85)', // Light blue
    'rgba(255, 218, 185, 0.85)', // Peach
    'rgba(152, 251, 152, 0.85)', // Light green
  ],
  warm: [
    'rgba(255, 99, 71, 0.85)',   // Tomato
    'rgba(255, 165, 0, 0.85)',   // Orange
    'rgba(255, 215, 0, 0.85)',   // Gold
    'rgba(255, 192, 203, 0.85)', // Pink
    'rgba(255, 160, 122, 0.85)', // Light salmon
  ],
  cold: [
    'rgba(70, 130, 180, 0.85)',  // Steel blue
    'rgba(32, 178, 170, 0.85)',  // Light sea green
    'rgba(72, 209, 204, 0.85)',  // Medium turquoise
    'rgba(135, 206, 250, 0.85)', // Light sky blue
    'rgba(176, 196, 222, 0.85)', // Light steel blue
  ],
  vintage: [
    'rgba(139, 69, 19, 0.85)',   // Saddle brown
    'rgba(160, 82, 45, 0.85)',   // Saddle brown
    'rgba(188, 143, 143, 0.85)', // Rosy brown
    'rgba(205, 133, 63, 0.85)',  // Peru
    'rgba(222, 184, 135, 0.85)', // Burlywood
  ],
  default: [
    'rgba(247, 245, 158, 0.85)', // Default sticky yellow
  ]
};

interface StickyData {
  id: string;
  title: string;
  content: string;
  color: string;
  isMinimized: boolean;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  stackId?: string;
  stackIndex?: number;
  zIndex: number;
  position: { x: number; y: number };
}

interface StickyOverlayProps {
  data: StickyData;
}

export const StickyOverlay: React.FC<StickyOverlayProps> = ({ data }) => {
  const { updateSticky, removeSticky, sendMessageToSticky } = useMindmapStore();
  const [isMinimized, setIsMinimized] = useState(data.isMinimized || false);
  const [currentColor, setCurrentColor] = useState(data.color || COLOR_THEMES.default[0]);
  const [title, setTitle] = useState(data.title || 'Untitled');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(data.position);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [data.chatHistory]);

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      };
      setPosition(newPosition);
      updateSticky(data.id, { position: newPosition });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, data.id, updateSticky]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMinimize = () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    updateSticky(data.id, { isMinimized: newMinimized });
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    updateSticky(data.id, { color });
  };

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(selectedTheme === theme ? '' : theme);
    setShowColorPicker(selectedTheme !== theme);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateSticky(data.id, { title: newTitle });
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isProcessing) return;
    
    setIsProcessing(true);
    const message = chatInput.trim();
    setChatInput('');
    
    try {
      await sendMessageToSticky(data.id, message);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      className="sticky-note"
      data-id={data.id}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: currentColor,
        borderRadius: '10px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.14)',
        overflow: 'hidden',
        minWidth: '280px',
        minHeight: '180px',
        width: '320px',
        height: isMinimized ? '60px' : '240px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        transition: 'all 0.2s ease',
        zIndex: data.zIndex || 1000,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div 
        className="header"
        style={{
          background: 'rgba(0, 0, 0, 0.03)',
          padding: '8px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {/* Header Buttons */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', position: 'relative' }}>
          <button
            onClick={() => removeSticky(data.id)}
            style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#d00',
            }}
          >
            ✖
          </button>
          <button
            onClick={handleMinimize}
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.3)',
              borderRadius: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#333',
            }}
          >
            {isMinimized ? '+' : '—'}
          </button>
        </div>

        {/* Title Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={{
              flex: 1,
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '14px',
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#111',
            }}
          />
          
          {/* Color Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Theme Selector */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {Object.keys(COLOR_THEMES).filter(theme => theme !== 'default').map((theme) => (
                <div
                  key={theme}
                  onClick={() => handleThemeSelect(theme)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: selectedTheme === theme ? '2px solid #4CAF50' : '2px solid #ddd',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#f8f8f8',
                    display: 'flex',
                    transform: selectedTheme === theme ? 'scale(1.1)' : 'scale(1)',
                  }}
                  title={theme.charAt(0).toUpperCase() + theme.slice(1)}
                >
                  {/* Theme Preview */}
                  <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                    {COLOR_THEMES[theme as keyof typeof COLOR_THEMES].slice(0, 2).map((color, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: '100%',
                          background: color,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Color Options */}
            {showColorPicker && selectedTheme && (
              <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                maxHeight: '40px',
                opacity: 1,
                margin: '4px 0',
                transition: 'all 0.4s ease',
              }}>
                {COLOR_THEMES[selectedTheme as keyof typeof COLOR_THEMES].map((color, i) => (
                  <div
                    key={i}
                    onClick={() => handleColorChange(color)}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      background: color,
                      border: currentColor === color ? '2px solid #333' : '2px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Context Label */}
        <div style={{
          fontSize: '11px',
          color: 'rgba(0, 0, 0, 0.7)',
          padding: '2px 0',
          fontWeight: 'bold',
        }}>
          <strong>Context:</strong> {data.content.slice(0, 40)}...
        </div>
      </div>

      {/* Chat History */}
      {!isMinimized && (
        <div
          ref={chatHistoryRef}
          style={{
            padding: '6px',
            overflowY: 'auto',
            background: 'rgba(255, 255, 255, 0.3)',
            minHeight: '40px',
            maxHeight: '100px',
          }}
        >
          {data.chatHistory && data.chatHistory.length > 0 ? (
            data.chatHistory.map((message, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '4px',
                  padding: '3px 6px',
                  borderRadius: '6px',
                  background: message.role === 'user' 
                    ? 'rgba(0, 123, 255, 0.1)' 
                    : 'rgba(108, 117, 125, 0.1)',
                  border: '1px solid ' + (message.role === 'user' 
                    ? 'rgba(0, 123, 255, 0.2)' 
                    : 'rgba(108, 117, 125, 0.2)'),
                }}
              >
                <div style={{ 
                  fontSize: '10px', 
                  color: message.role === 'user' ? '#007bff' : '#6c757d',
                  fontWeight: 'bold',
                  marginBottom: '1px',
                }}>
                  {message.role === 'user' ? 'You' : 'AI'}
                </div>
                <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.3' }}>
                  {message.content}
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              color: '#666', 
              fontStyle: 'italic', 
              textAlign: 'center',
              padding: '15px',
              fontSize: '11px',
            }}>
              Ask something about this context...
            </div>
          )}
        </div>
      )}

      {/* Chat Input */}
      {!isMinimized && (
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '6px',
          borderTop: '1px solid #eee',
          background: 'rgba(255, 255, 255, 0.4)',
        }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask something..."
            disabled={isProcessing}
            style={{
              flex: 1,
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '3px 6px',
              fontSize: '12px',
              color: '#111',
              background: '#fff',
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || !chatInput.trim()}
            style={{
              background: isProcessing ? '#ccc' : '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '3px 8px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '12px',
            }}
          >
            {isProcessing ? '...' : '➤'}
          </button>
        </div>
      )}
    </div>
  );
}; 