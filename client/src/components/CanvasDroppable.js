import { useDroppable } from '@dnd-kit/core';
import React from 'react'
import DraggableElement from './DraggableElement';
import { isUserOwnerOrFaciliator } from '../utils';

const CanvasDroppable = ({IsStageBlocked, User, ActiveStage, handleWhiteboardClick, SelectedTemplate, elements, handleElementUpdate, handleDeleteElement, FinalizeStage, handleComment}) => {
    const { setNodeRef } = useDroppable({
        id: 'canvas',
    });
    
  return (
    <div ref={setNodeRef} className="quadrants-container quadrants-container-reheight" onClick={IsStageBlocked && User.role === "user" || ActiveStage !== "collection" ? null : handleWhiteboardClick}>
      {SelectedTemplate?.sections?.map(quadrant => (
        <div 
          key={quadrant.id}
          className={`quadrant quadrant-${quadrant.id}`}
          style={{ 
            backgroundColor: `${quadrant.color}`,
            position: 'absolute',
            left: quadrant.x > 0 ? '50%' : '0',
            top: quadrant.y > 0 ? '0' : '50%',
            width: '50%',
            height: '50%',
            border: '1px solid #ccc',
            boxSizing: 'border-box'
          }}
        >
          <h3 style={{ textAlign: 'center', margin: '10px 0' }}>{quadrant.title}</h3>
        </div>
      ))}
      {/* Sticky notes rendering */}
      {elements.map((element,index) => {
        const container = document.querySelector('.quadrants-container')?.getBoundingClientRect();
        const centerX = container?.width / 2 || 0;
        const centerY = container?.height / 2 || 0;
        
        const x = centerX + (element.relX * centerX) - (element.width / 2);
        const y = centerY + (element.relY * centerY) - (element.height / 2);
        
        return (
          <DraggableElement
            key={element.id}
            element={{ ...element, x, y }}
            onUpdate={handleElementUpdate}
            onDelete={handleDeleteElement}
            isModificationAllowed = {isUserOwnerOrFaciliator(element.userId, User.id, User.role)}
            IsStageBlocked={IsStageBlocked}
            index={index}
            finalizeStage={FinalizeStage}
            handleComment={handleComment}
          />
        );
      })}
    </div>
  )
}

export default CanvasDroppable