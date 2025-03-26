import React, { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';

const DraggableElement = ({ element, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(element.content);
  const inputRef = useRef(null);
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    backgroundColor: element.color,
    cursor: isEditing ? 'text' : 'grab',
    zIndex: isEditing ? 1000 : 1,
    touchAction: 'none' // Important for touch devices
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(element.id, { content });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(element.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="whiteboard-element"
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: 'transparent',
            outline: 'none',
          }}
        />
      ) : (
        <div className="element-content">
          {content}
        </div>
      )}
      <button 
        className="delete-button" 
        onClick={handleDelete}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
};

export default DraggableElement;