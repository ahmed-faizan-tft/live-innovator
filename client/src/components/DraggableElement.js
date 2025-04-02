import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Tooltip } from 'react-tooltip'
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedElement } from '../redux/userSlice';

const DraggableElement = ({ element, onUpdate, onDelete, isModificationAllowed,index }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(() =>element.content);
  const SelectedElement = useSelector((state) => state.User.selectedElement);  
  const LockedElement = useSelector((state) => state.User.lockedElement);  
  const User = useSelector((state) => state.User.user);  

  const inputRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setContent(element.content); 
  }, [element.content]);
  
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
    disabled: !isModificationAllowed || (LockedElement.includes(element.id) && User.role === "user")
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
    touchAction: 'none', // Important for touch devices
    border: SelectedElement === element.id ? "1px solid red" : "",
  };
  const innerStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      wordWrap: 'break-word',
      overflow: 'hidden', 
      whiteSpace: 'pre-wrap',
      overflow: 'auto'
  }
  const handleDoubleClick = () => {
    if(!isModificationAllowed || (LockedElement.includes(element.id) && User.role === "user")){
      return;
    }
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClick = () => {
    if(User.role === "user") return;
    if(SelectedElement?.length > 0 && SelectedElement === element?.id){
      dispatch(setSelectedElement(""));
      return;
    }
    dispatch(setSelectedElement(element?.id));
  }

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
    if(!isModificationAllowed || (LockedElement.includes(element.id) && User.role === "user")){
      return;
    }
    e.stopPropagation();
    onDelete(element.id);
  };

  return (
    <>
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="whiteboard-element"
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      data-tooltip-id={`key-${index}`}
      data-tooltip-content={`Author: ${element.username}`}
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
        <div className="element-content" style={innerStyle}>
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
    <Tooltip id={`key-${index}`} />
    </>
  );
};

export default DraggableElement;