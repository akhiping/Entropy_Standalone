import React, { useState, useRef, useEffect } from 'react';
import { useMindmapStore } from '../../stores/mindmapStore';

export const Minimap: React.FC = () => {
  const { mindmap } = useMindmapStore();
  const [isVisible, setIsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(250);
  const [currentHeight, setCurrentHeight] = useState(180);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const minimapRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const defaultWidth = 250;
  const defaultHeight = 180;
  const fullscreenWidth = Math.min(800, window.innerWidth * 0.8);
  const fullscreenHeight = Math.min(600, window.innerHeight * 0.8);

  // Handle dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    setIsDragging(true);
    const rect = minimapRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isFullscreen) return;
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      setPosition({
        x: Math.max(0, Math.min(x, window.innerWidth - currentWidth)),
        y: Math.max(0, Math.min(y, window.innerHeight - currentHeight)),
      });
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
  }, [isDragging, dragOffset, currentWidth, currentHeight, isFullscreen]);

  // Handle resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = currentWidth;
    const startHeight = currentHeight;

    const handleResize = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, startWidth + (e.clientX - startX));
      const newHeight = Math.max(150, startHeight + (e.clientY - startY));
      setCurrentWidth(newWidth);
      setCurrentHeight(newHeight);
    };

    const stopResize = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', stopResize);
    };

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Draw sticky nodes on the minimap
  const renderStickies = () => {
    if (!mindmap?.stickies || mindmap.stickies.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-white/60 text-sm">
          No sticky notes yet
        </div>
      );
    }

    const containerWidth = isFullscreen ? fullscreenWidth - 40 : currentWidth - 40;
    const containerHeight = (isFullscreen ? fullscreenHeight : currentHeight) - 80;

    // Calculate bounds of all stickies
    const minX = Math.min(...mindmap.stickies.map(s => s.position.x));
    const maxX = Math.max(...mindmap.stickies.map(s => s.position.x + s.size.width));
    const minY = Math.min(...mindmap.stickies.map(s => s.position.y));
    const maxY = Math.max(...mindmap.stickies.map(s => s.position.y + s.size.height));

    const totalWidth = maxX - minX || 1;
    const totalHeight = maxY - minY || 1;

    const scaleX = containerWidth / totalWidth;
    const scaleY = containerHeight / totalHeight;
    const scale = Math.min(scaleX, scaleY, 1) * 0.8; // Add some padding

    return mindmap.stickies.map((sticky) => {
      const x = (sticky.position.x - minX) * scale + 20;
      const y = (sticky.position.y - minY) * scale + 20;
      const width = Math.max(12, sticky.size.width * scale * 0.3);
      const height = Math.max(8, sticky.size.height * scale * 0.3);

      return (
        <div
          key={sticky.id}
          style={{
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${height}px`,
            background: sticky.color || 'rgba(247, 245, 158, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '2px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={sticky.title}
          onClick={() => {
            // Scroll to sticky in main view
            const stickyElement = document.querySelector(`[data-id="${sticky.id}"]`);
            if (stickyElement) {
              stickyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)';
            e.currentTarget.style.zIndex = '10';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.zIndex = '1';
          }}
        />
      );
    });
  };

  if (!isVisible) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          background: 'rgba(0, 0, 0, 0.85)',
          border: '2px solid #333',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
        }}
        onClick={toggleVisibility}
      >
        <span style={{ color: 'white', fontSize: '14px' }}>📍</span>
      </div>
    );
  }

  return (
    <div
      ref={minimapRef}
      style={{
        position: 'fixed',
        ...(isFullscreen
          ? {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${fullscreenWidth}px`,
              height: `${fullscreenHeight}px`,
            }
          : {
              top: `${position.y}px`,
              right: position.x === 20 ? '20px' : 'auto',
              left: position.x !== 20 ? `${position.x}px` : 'auto',
              width: `${currentWidth}px`,
              height: `${currentHeight}px`,
            }),
        background: 'rgba(0, 0, 0, 0.85)',
        border: isFullscreen ? '2px solid #4CAF50' : '2px solid #333',
        borderRadius: '8px',
        zIndex: 999999,
        padding: '10px',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div
        style={{
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: isFullscreen ? 'default' : 'move',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
      >
        <span>Sticky Notes Map</span>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={toggleFullscreen}
            style={{
              background: 'none',
              border: 'none',
              color: isFullscreen ? '#4CAF50' : 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            title="Toggle Fullscreen"
          >
            ⛶
          </button>
          <button
            onClick={toggleVisibility}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            title="Minimize"
          >
            −
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: `${(isFullscreen ? fullscreenHeight : currentHeight) - 60}px`,
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {renderStickies()}
      </div>

      {/* Resize Handle */}
      {!isFullscreen && (
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: '15px',
            height: '15px',
            background: 'linear-gradient(-45deg, transparent 30%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.3) 70%, transparent 70%)',
            cursor: 'nw-resize',
            borderRadius: '0 0 8px 0',
          }}
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
}; 