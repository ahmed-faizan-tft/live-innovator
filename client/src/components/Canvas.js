import { closestCorners, DndContext, useDroppable } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import React from 'react'
import { isUserOwnerOrFaciliator } from '../utils';
import DraggableElement from './DraggableElement';
import PriorityElement from './PriorityElement';
import DeckDroppable from './DeckDroppable';
import CanvasDroppable from './CanvasDroppable';

const Canvas = (props) => {
  const {IsStageBlocked, User, ActiveStage, handleWhiteboardClick, sensors, handleDragEnd, SelectedTemplate, elements, handleElementUpdate, handleDeleteElement, FinalizeStage, handleComment, showForm, handleFormSubmit, formPosition, formText, setFormText, setShowForm, quadrant, deckElements} = props

  return (
    <div className="empathy-map-container">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {/* Deck-cards */}
        <DeckDroppable deckElements={deckElements}/>
        {/* Quadrants rendering (same as before) */}
        <CanvasDroppable
          IsStageBlocked={IsStageBlocked}
          User={User}
          ActiveStage={ActiveStage}
          handleWhiteboardClick={handleWhiteboardClick}
          SelectedTemplate={SelectedTemplate}
          elements={elements}
          handleElementUpdate={handleElementUpdate}
          handleDeleteElement={handleDeleteElement}
          FinalizeStage={FinalizeStage}
          handleComment={handleComment}
        />
        
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