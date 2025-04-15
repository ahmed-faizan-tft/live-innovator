import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React from 'react'

const PriorityElement = ({element}) => {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: element.id,
        data: {
            container: 'deck',
          }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        cursor:'grab',
        zIndex: 1,
        touchAction: 'none',
        border: "1px solid black",
        backgroundColor:"white"
    }
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
        {element?.content}
    </div>
  )
}

export default PriorityElement