import React, { useEffect, useState } from 'react';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import DraggableElement from './DraggableElement';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { io } from "socket.io-client";
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
const pathParts = window.location.pathname.split("/");

const id = pathParts.filter((path)=> path.includes("-"))[0]
const socket = io(`http://localhost:8000/session/${id}`);

const EMPATHY_QUADRANTS = [
  { id: 'says', title: 'Says', color: '#FFEE93', x: 1, y: 1 },
  { id: 'thinks', title: 'Thinks', color: '#ADF7B6', x: -1, y: 1 },
  { id: 'feels', title: 'Feels', color: '#FFC09F', x: -1, y: -1 },
  { id: 'does', title: 'Does', color: '#A0CED9', x: 1, y: -1 }
];


const Whiteboard = () => {
  const [elements, setElements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
  const [formText, setFormText] = useState('');
  const [quadrant, setQuadrant] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get("code"); 
  
  const navigate = useNavigate()
  
  useEffect(() => {
    if(code){
      try {
        async function fetchData(){
          const sessionData = await axios.get(`http://localhost:8000/check/${id}/${code}`);
            
            if(sessionData.status !== 200 || !sessionData?.data?.data?.isPresent) {
                navigate(`/badAuth`);
                return
            }
        }
        fetchData();
      } catch (error) {
        navigate(`/badAuth`);
        return
      }
    }
    try {
      async function fetchData(){
        const sessionData = await axios.get(`http://localhost:8000/restore/${id}`);
          
          if(sessionData.status === 200) {
              const newData = sessionData.data?.data;
              if(newData?.length > 0) {
                setElements(newData)
              }
              
          }else{
            return;
          }
      }
      fetchData();
    } catch (error) {
      console.log(error);
      
      navigate(`/badAuth`);
      return
    }
    
    socket.on('elements', (newElements) => {      
      setElements(newElements);
    });
    
    return () => {
      socket.off('elements');
    };
  },[])
  
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );
  
  const generateLink = async () => {
    const randomSessionId = Math.random().toString(36).substring(2, 10);
    const response = await axios.post("http://localhost:8000/create-join",{sessionId:id, code: randomSessionId})
    if(response.status === 200){
      setInviteLink(`${window.location.origin}/${id}/join/${randomSessionId}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert("Invite link copied to clipboard!");
    });
  };

  const handleWhiteboardClick = (e) => {
    if (e.target.className !== 'empathy-map-container' && 
        !e.target.className.includes('quadrant')) return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const centerX = container.width / 2;
    const centerY = container.height / 2;
    
    // Calculate relative coordinates (-1 to 1 range)
    const relX = ((e.clientX - container.left) - centerX) / centerX;
    const relY = ((e.clientY - container.top) - centerY) / centerY;
    
    // Determine which quadrant was clicked
    const quadrantX = relX > 0 ? 1 : -1;
    const quadrantY = relY > 0 ? 1 : -1;
    const clickedQuadrant = EMPATHY_QUADRANTS.find(q => q.x === quadrantX && q.y === quadrantY);
    
    // Set form position and quadrant
    setFormPosition({ x: e.clientX, y: e.clientY });
    setQuadrant(clickedQuadrant);
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formText.trim()) {
      setShowForm(false);
      return;
    }

    const container = document.querySelector('.empathy-map-container').getBoundingClientRect();
    const centerX = container.width / 2;
    const centerY = container.height / 2;
    
    // Calculate relative position based on form position
    const relX = ((formPosition.x - container.left) - centerX) / centerX;
    const relY = ((formPosition.y - container.top) - centerY) / centerY;

    const newElement = {
      id: uuidv4(),
      relX,
      relY,
      quadrant: quadrant.id,
      content: formText,
      width: 120,
      height: 60,
      color: quadrant.color
    };
    
    setElements([...elements, newElement]);
    setFormText('');
    setShowForm(false);
    socket.emit("newElements", {id,data:[...elements, newElement]});
  };

  
  const handleDragEnd = (event) => {
    const { active, delta } = event;
    if (!delta) return;

    const updatedElement = elements.map(el => {
      if (el.id === active.id) {
        const container = document.querySelector('.empathy-map-container').getBoundingClientRect();
        const centerX = container.width / 2;
        const centerY = container.height / 2;
        
        // Convert delta to relative movement
        const relDeltaX = delta.x / centerX;
        const relDeltaY = delta.y / centerY;
        
        // Calculate new relative position
        const newRelX = el.relX + relDeltaX;
        const newRelY = el.relY + relDeltaY;
        
        // Determine new quadrant
        const quadrantX = newRelX > 0 ? 1 : -1;
        const quadrantY = newRelY > 0 ? 1 : -1;
        const quadrant = EMPATHY_QUADRANTS.find(q => q.x === quadrantX && q.y === quadrantY);
        
        return {
          ...el,
          relX: newRelX,
          relY: newRelY,
          quadrant: quadrant.id,
          color: quadrant.color
        };
      }
      return el;
    })
    
    setElements(updatedElement);
    socket.emit('newElements', {id,data:updatedElement});

  };

  const handleElementUpdate = (id, updates) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const handleDeleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
  };

  return (
    <>
     {!code && <div className="invite-container">
      <h2 className="session-title">Session: {localStorage.getItem("name")}</h2>
      <button className="invite-button" onClick={generateLink}>
        Invite
      </button>

      {inviteLink && (
        <div className="invite-link-container">
          <input type="text" value={inviteLink} readOnly className="invite-link" />
          <button className="copy-button" onClick={copyToClipboard}>Copy</button>
        </div>
      )}
    </div>}
    <div className="empathy-map-container" onClick={handleWhiteboardClick}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
        {/* Quadrants rendering (same as before) */}
        <div className="quadrants-container">
          {EMPATHY_QUADRANTS.map(quadrant => (
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
        {elements.map(element => {
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
    </>
  );
};

export default Whiteboard;