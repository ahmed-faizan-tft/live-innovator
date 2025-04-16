import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Tooltip } from 'react-tooltip'
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedElement, setSelectedPostsForNextStage } from '../redux/userSlice';
import Modal from './Modal';
import Comments from './Comments';

const DraggableElement = ({ element, onUpdate, onDelete, isModificationAllowed,index,IsStageBlocked, finalizeStage, handleComment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(() =>element.content);
  const [fontSize, setFontSize] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const SelectedElement = useSelector((state) => state.User.selectedElement);  
  const LockedElement = useSelector((state) => state.User.lockedElement);  
  const User = useSelector((state) => state.User.user); 
  const SelectedPostsForNextStage = useSelector((state) => state.User.selectedPostsForNextStage); 
  const currentStage = useSelector((state) => state.User.currentStage); 
  const CommentsState = useSelector((state) => state.User.comments); 
  const ActiveStage = useSelector((state) => state.User.activeStage); 
  const isEditAllowed = !isModificationAllowed || (LockedElement.includes(element.id) && User.role === "user") || (IsStageBlocked && User.role === "user") || (currentStage === "enrich" && User.role === "user")

  const inputRef = useRef(null);
  const divRef = useRef(null);
  const dispatch = useDispatch();
  const isSelected = [...SelectedPostsForNextStage]?.some((newData)=>{
    return newData.id === element.id;
  });

  useEffect(() => {
    setContent(element.content); 
  }, [element.content]);
  
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
    disabled: isEditAllowed,
    data: {
      container: 'canvas'
    }
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
    border: SelectedElement === element.id || isSelected? "1px solid red" : "",
  };
  const innerStyle = {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    fontSize: `${fontSize}px`,
    whiteSpace: "pre-wrap", 
    wordWrap: "break-word" 
  }

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;

    if (content === "") {
        setFontSize(12);
        return;
    }
    

    // Temporary styles for measurement
    const originalFontSize = div.style.fontSize;
    const originalWhiteSpace = div.style.whiteSpace;
    const originalWordWrap = div.style.wordWrap;

    // Ensure text wrapping is enabled for accurate measurement
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";

    let minFont = 1;
    let maxFont = 12;
    let optimalFont = minFont;

    // Check if the maximum font size works
    div.style.fontSize = `${maxFont}px`;
    if (div.scrollHeight <= div.clientHeight && div.scrollWidth <= div.clientWidth) {
        setFontSize(maxFont);
        div.style.fontSize = originalFontSize;
        div.style.whiteSpace = originalWhiteSpace;
        div.style.wordWrap = originalWordWrap;
        return;
    }

    // Binary search to find optimal font size
    while (minFont <= maxFont) {
        const midFont = Math.floor((minFont + maxFont) / 2);
        div.style.fontSize = `${midFont}px`;

        const isOverflowing = div.scrollHeight > div.clientHeight || div.scrollWidth > div.clientWidth;

        if (isOverflowing) {
            maxFont = midFont - 1;
        } else {
            optimalFont = midFont;
            minFont = midFont + 1;
        }
    }

    // Restore original styles
    div.style.fontSize = originalFontSize;
    div.style.whiteSpace = originalWhiteSpace;
    div.style.wordWrap = originalWordWrap;

    setFontSize(optimalFont);
}, [content, element.content]);
  
  const handleDoubleClick = () => {
    if(isEditAllowed){
      return;
    }
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClick = () => {
    if(User.role === "user") return;
    if(finalizeStage === "finalizeStage"){
      if(SelectedElement?.length > 0 && SelectedElement === element?.id){
        dispatch(setSelectedElement(""));
        return;
      }
      dispatch(setSelectedElement(element?.id));
    }else{
      const newDatas = [...SelectedPostsForNextStage];
      const isFound = newDatas?.some((newData)=>{
        return newData.id === element.id;
      });
      if(isFound){
        const data = newDatas?.filter((newData)=>{
          return newData.id != element.id;
        });
        dispatch(setSelectedPostsForNextStage(data))
      }else{
        dispatch(setSelectedPostsForNextStage([...newDatas, element]))
      }
    }
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
    if(isEditAllowed){
      return;
    }
    e.stopPropagation();
    onDelete(element.id);
  };

  const handleClickComment = (e) => {
    e.stopPropagation();
    setIsModalOpen(true)
  }

  const handleAddComment = (postId, newComment) => {
    const allComments = {...CommentsState};
    let currentPostComment = allComments[postId] || [];
    handleComment({...allComments, [postId]:[...currentPostComment,newComment]})
  }

  return (
    <>
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <Comments postId={element.id} comments={CommentsState[element.id]} onAddComment={handleAddComment} User={User}/>
    </Modal>
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
        <div className="element-content" style={innerStyle} ref={divRef}>
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

      {ActiveStage === "enrich" && <button 
        className="comment-button" 
        onClick={handleClickComment}
        style={{
          position: 'absolute',
          top: 0,
          right: "22px",
          background: 'black',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          cursor: 'pointer',
        }}
      >
        c
      </button>}
    </div>
    <Tooltip id={`key-${index}`} />
    </>
  );
};

export default DraggableElement;