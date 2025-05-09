import React from 'react'

const Quadrant = ({quadrant}) => {
  return (
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
  )
}

export default Quadrant