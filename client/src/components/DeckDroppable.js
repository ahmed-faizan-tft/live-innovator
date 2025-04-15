import React from 'react'
import PriorityElement from './PriorityElement';
import { useDroppable } from '@dnd-kit/core';

const DeckDroppable = ({deckElements}) => {  
  const { setNodeRef } = useDroppable({
    id: 'deck',
  });

  return (
    <div className='deck-cards' ref={setNodeRef}>
      {deckElements?.length > 0 && deckElements?.map((dectElement)=>{
        return <PriorityElement element={dectElement}/>
      })}
    </div>
  )
}

export default DeckDroppable