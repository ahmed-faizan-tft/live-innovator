import { DndContext } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import React from 'react'
import { isUserOwnerOrFaciliator } from '../utils';
import DraggableElement from './DraggableElement';

const Canvas = (props) => {
const {IsStageBlocked, User, ActiveStage, handleWhiteboardClick, sensors, handleDragEnd, SelectedTemplate, elements, handleElementUpdate, handleDeleteElement, FinalizeStage, handleComment, showForm, handleFormSubmit, formPosition, formText, setFormText, setShowForm, quadrant} = props
  return (
    <div className="empathy-map-container" onClick={IsStageBlocked && User.role === "user" || ActiveStage !== "collection" ? null : handleWhiteboardClick}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
        {/* Quadrants rendering (same as before) */}
        <div className="quadrants-container">
          {SelectedTemplate?.sections?.map(quadrant => (
            <div 
              key={quadrant.id}
              className={`quadrant quadrant-${quadrant.id}`}
              style={{ 
                backgroundColor: `${quadrant.color}40`,
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
        </div>
        
        {/* Sticky notes rendering */}
        {elements.map((element,index) => {
          const container = document.querySelector('.empathy-map-container')?.getBoundingClientRect();
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
      </DndContext>

      {/* Text input form */}
      {showForm && (
        <form 
          className="sticky-note-form"
          onSubmit={handleFormSubmit}
          style={{
            position: 'fixed',
            left: `${formPosition.x}px`,
            top: `${formPosition.y}px`,
            zIndex: 1000,
            backgroundColor: quadrant.color,
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          <textarea
            autoFocus
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            placeholder="Enter your text here..."
            style={{
              width: '200px',
              height: '80px',
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: 'transparent'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="submit">Save</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Canvas