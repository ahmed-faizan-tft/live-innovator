import React, { useRef, useState } from 'react';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DraggableElement from './DraggableElement';
import useSessionSocket from '../hooks/useSessionSocket';
import useSessionAuth from '../hooks/useSessionAuth';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { isUserOwnerOrFaciliator } from '../utils';
import { setActiveStage, setComments, setCurrentStage, setDeckElements, setFinalizeStage, setIsStageBlocked, setLockedElement, setPrioritiesStagePosts, setPrioritiesStagePostsEachUser, setSelectedElement, setSelectedPostsForNextStage, setStagePost } from '../redux/userSlice';
import activeStageEnum, { moveStageEnum } from '../utils/enum/stage';
import Notification from './Notification';
import Canvas from './Canvas';

const Whiteboard = () => {
  const { id: sessionId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sessionCode = queryParams.get("code");
  const [showForm, setShowForm] = useState(false);
  const [formPosition, setFormPosition] = useState({ x: 0, y: 0 });
  const [formText, setFormText] = useState('');
  const [quadrant, setQuadrant] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const User = useSelector((state) => state.User.user);
  const SelectedElement = useSelector((state) => state.User.selectedElement);    
  const LockedElement = useSelector((state) => state.User.lockedElement);    
  const SelectedTemplate = useSelector((state) => state.User.selectedTemplate);    
  const Stages = useSelector((state) => state.User.stages);    
  const StagePosts = useSelector((state) => state.User.stagePosts);    
  const ActiveStage = useSelector((state) => state.User.activeStage);    
  const CurrentStage = useSelector((state) => state.User.currentStage);    
  const IsStageBlocked = useSelector((state) => state.User.isStageBlocked);    
  const FinalizeStage = useSelector((state) => state.User.finalizeStage);    
  const SelectedPostsForNextStage = useSelector((state) => state.User.selectedPostsForNextStage);   
  const NotificationTitle = useSelector((state) => state.User.notificationTitle);   
  const DeckElements = useSelector((state) => state.User.deckElements);   
  const PrioritiesStagePosts = useSelector((state) => state.User.prioritiesStagePosts);   
  const PrioritiesStagePostsEachUser = useSelector((state) => state.User.prioritiesStagePostsEachUser);   
  
  const { socket, elements, updateElements } = useSessionSocket(sessionId);
  useSessionAuth(sessionId, sessionCode);
  const dispatch = useDispatch()  
  const ref = useRef()
  
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );
  
  const generateLink = async () => {
    const randomSessionId = Math.random().toString(36).substring(2, 10);
    const response = await axios.post("http://localhost:8000/create-join",{sessionId:sessionId, code: randomSessionId})
    if(response.status === 200){
      setInviteLink(`${window.location.origin}/${sessionId}/join/${randomSessionId}?template=${SelectedTemplate?._id}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setInviteLink("");
      alert("Invite link copied to clipboard!");
    });
  };

  const handleWhiteboardClick = (e) => {
    if (e.target.className !== 'quadrants-container' && 
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
    const clickedQuadrant = SelectedTemplate?.sections?.find(q => q.x === quadrantX && q.y === quadrantY);
    
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

    const container = document.querySelector('.quadrants-container').getBoundingClientRect();
    const centerX = container.width / 2;
    const centerY = container.height / 2;
    
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
      color: quadrant.color,
      userId: User.id,
      username:User.name
    };
    const combinedElements = [...elements, newElement]
    
    updateElements(combinedElements);
    socket.emit('newElements', { id: sessionId, data: combinedElements });
    setFormText('');
    setShowForm(false);
  };

  const handleDragEnd = (event) => {
    const { active, delta, over, activatorEvent } = event;
    if (!delta || !over) return;
    const activeContainer = active.data.current?.container;
    const overContainerId = over.id;

    // Move within the same container
    if(activeContainer === "canvas" && overContainerId === "canvas"){
      const updatedElements = elements.map(el => {
        if (el.id === active.id) {
          const container = document.querySelector('.quadrants-container').getBoundingClientRect();
          const centerX = container.width / 2;
          const centerY = container.height / 2;
          
          const relDeltaX = delta.x / centerX;
          const relDeltaY = delta.y / centerY;
          
          const newRelX = el.relX + relDeltaX;
          const newRelY = el.relY + relDeltaY;
          
          const quadrantX = newRelX > 0 ? 1 : -1;
          const quadrantY = newRelY > 0 ? 1 : -1;
          const quadrant = SelectedTemplate?.sections?.find(q => q.x === quadrantX && q.y === quadrantY);
          
          return {
            ...el,
            relX: newRelX,
            relY: newRelY,
            quadrant: quadrant.id,
            color: quadrant.color,
            prioritizeUserId: ActiveStage ==="prioritize" ? User.id: undefined
          };
        }
        return el;
      });
      
      updateElements(updatedElements);
      if(ActiveStage !== "prioritize"){
        socket.emit('newElements', { id: sessionId, data: updatedElements });
      }else{
        //temporary
        if(User.role === "facilitator") return;

        const isPostPresent = PrioritiesStagePosts[active.id]
        let newPostElements = isPostPresent.filter((element)=>{
          return !(element.prioritizeUserId === User.id)
        });
        const activeUpdatedElement = updatedElements?.filter((element)=>{
          return element.id === active.id
        })
        delete activeUpdatedElement.quandrant;
        activeUpdatedElement.prioritizeUserId = User.id;

        newPostElements = [...newPostElements, ...activeUpdatedElement];
        dispatch(setPrioritiesStagePosts({...PrioritiesStagePosts, [active.id]:newPostElements}))
        socket.emit("priorityCombinedPost",sessionId,{...PrioritiesStagePosts, [active.id]:newPostElements});

        const currentUserPostsPositionAndDeckElements = {[User.id]:{deckElements:DeckElements, elements:updatedElements}};
        dispatch(setPrioritiesStagePostsEachUser({...PrioritiesStagePostsEachUser, ...currentUserPostsPositionAndDeckElements}));
        socket.emit("priorityPostsEachUser", sessionId, currentUserPostsPositionAndDeckElements)
      }
    }else if(activeContainer === "deck" && overContainerId === "canvas"){
      if(User.role === "facilitator") return;
      const movedElement = [...DeckElements].find(el => el.id === active.id);
      if (movedElement) {
        const container = document.querySelector('.quadrants-container').getBoundingClientRect();
        const centerX = container.width / 2;
        const centerY = container.height / 2;
        const finalX = active.rect.current.translated.left;
        const finalY = active.rect.current.translated.top;
        
        const relX = ((finalX - container.left) - centerX + movedElement.width/2) / centerX;
        const relY = ((finalY - container.top) - centerY + movedElement.height/2) / centerY;

        const quadrantX = relX > 0 ? 1 : -1;
        const quadrantY = relY > 0 ? 1 : -1;
        const quadrant = SelectedTemplate?.sections?.find(q => q.x === quadrantX && q.y === quadrantY);
      
        const updatedElement = {
          ...movedElement,
          relX,
          relY,
          quadrant: quadrant.id,
          color: quadrant.color,
          prioritizeUserId: ActiveStage ==="prioritize" ? User.id: undefined
        };  
        const modifiedDeckElements =  DeckElements.filter(el => el.id !== active.id);            
        dispatch(setDeckElements(modifiedDeckElements));

        updateElements(prev => [...prev, updatedElement]);
        const isPostPresent = PrioritiesStagePosts[active.id]
        if(isPostPresent){
          const priorityStageElementsData = {...PrioritiesStagePosts, [active.id]:[...isPostPresent,updatedElement]}
          dispatch(setPrioritiesStagePosts(priorityStageElementsData));
          socket.emit("priorityCombinedPost",sessionId,priorityStageElementsData);

          const currentUserPostsPositionAndDeckElements = {[User.id]:{deckElements:modifiedDeckElements, elements:[...elements,updatedElement]}};
          dispatch(setPrioritiesStagePostsEachUser({...PrioritiesStagePostsEachUser, ...currentUserPostsPositionAndDeckElements}));
          socket.emit("priorityPostsEachUser", sessionId, currentUserPostsPositionAndDeckElements)
        }else{
          const priorityStageElementsData = {...PrioritiesStagePosts, [active.id]:[updatedElement]};
          dispatch(setPrioritiesStagePosts(priorityStageElementsData))
          socket.emit("priorityCombinedPost",sessionId,priorityStageElementsData);

          const currentUserPostsPositionAndDeckElements = {[User.id]:{deckElements:modifiedDeckElements, elements:[...elements, updatedElement]}};
          dispatch(setPrioritiesStagePostsEachUser({...PrioritiesStagePostsEachUser, ...currentUserPostsPositionAndDeckElements}));
          socket.emit("priorityPostsEachUser", sessionId, currentUserPostsPositionAndDeckElements)
        }
      }
    }
  };

  const handleElementUpdate = (id, updates) => {
    const newUpdatedElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    )

    updateElements(newUpdatedElements);
    socket.emit('newElements', { id: sessionId, data: newUpdatedElements });
  };

  const handleDeleteElement = (id) => {
    const newUpdatedElements = elements.filter(el => el.id !== id)

    updateElements(newUpdatedElements);
    socket.emit('newElements', { id: sessionId, data: newUpdatedElements });
  };

  const handleDropdownChange = (event) => {
    const value = event.target.value;   
     
    if (value === "lock") {
      const newLockedElements = [...LockedElement, SelectedElement];
      dispatch(setLockedElement(newLockedElements))
      socket.emit("locked", {sessionId, data: newLockedElements})
    }else if(value === "unlock"){
      const updatedLockedElements = LockedElement.filter(el => el !== SelectedElement);
      dispatch(setLockedElement(updatedLockedElements))
      socket.emit("locked", {sessionId, data: updatedLockedElements})
    }
    dispatch(setSelectedElement(""))
    ref.current.value = ""
  };
  

  const isLocked = () =>{    
    return !!(SelectedElement && SelectedElement.length > 0 && LockedElement.includes(SelectedElement))
  }

  const handleFinalizeStage = ()=>{
    if(FinalizeStage === "finalizeStage"){
      dispatch(setFinalizeStage("nextStage"))
      socket.emit("blockStage",{sessionId, isBlocked:true, finalizeStage: "nextStage"})
      socket.emit("notifications", sessionId, "You have been blocked by facilitator until finalize stage.")
    }else if(FinalizeStage === "nextStage"){
      // handling for the next stage
      const newStagePost = {...StagePosts,[ActiveStage]:elements}
      dispatch(setStagePost(newStagePost))
      // emit a socket to store stages post on redis
      socket.emit("stagesPosts",sessionId, newStagePost)
      if(SelectedPostsForNextStage?.length === 0){
        dispatch(setSelectedPostsForNextStage(elements))
      }
      dispatch(setFinalizeStage("startStage"))
    }else{
      dispatch(setFinalizeStage("finalizeStage"));
      dispatch(setActiveStage(activeStageEnum[ActiveStage]));
      dispatch(setCurrentStage(activeStageEnum[ActiveStage]));
      dispatch(setIsStageBlocked(false));
      dispatch(setSelectedPostsForNextStage([]));
      dispatch(setLockedElement([]));
      dispatch(setSelectedElement(""));
      let modifiedElements = [];
      if(activeStageEnum[ActiveStage] !== "prioritize"){

        updateElements(SelectedPostsForNextStage);
        socket.emit('newElements', { id: sessionId, data: SelectedPostsForNextStage });
      }else{
        // update deck for facilitator
        let x = 0, y = 0;
        modifiedElements = SelectedPostsForNextStage?.map((element,index)=>{
          y = index===0 ? 0 : y+10;
          return {
            id: element.id,
            content: element.content,
            width:element.width,
            height:element.height,
            userId:element.userId,
            username:element.username,
            x:x,
            y:y,
            color:"white"
          }
        })
        dispatch(setDeckElements(modifiedElements));
        updateElements([]);
      }
      // update all required data on participant side
      socket.emit("newStageStart",
        {
          sessionId, 
          isBlocked:false, 
          finalizeStage: "finalizeStage",
          currentStage:activeStageEnum[ActiveStage],
          activeStage:activeStageEnum[ActiveStage],
          elements:activeStageEnum[ActiveStage] !== "prioritize" ? SelectedPostsForNextStage : [],
          actualDeckElements:activeStageEnum[ActiveStage] !== "prioritize" ? [] :modifiedElements,
          lockedElement:[]
        }
      )
      socket.emit("notifications", sessionId, "You have been Moved into new stage by facilitator.")
    }
  }
  const handleComment = (data)=>{
    dispatch(setComments(data));
    socket.emit("comments", sessionId, data)
  }
  
  const handleStageClick = (stage)=>{
    if(User.role !== "facilitator") return;
    if(!moveStageEnum[CurrentStage]?.includes(stage.type) || ActiveStage === stage.type || (FinalizeStage !== "finalizeStage" && ActiveStage===CurrentStage)) return;
    if(stage.type === CurrentStage){
      dispatch(setFinalizeStage("finalizeStage"));
      dispatch(setActiveStage(stage.type));
      updateElements(StagePosts[stage.type]);
      socket.emit('newElements', { id: sessionId, data: StagePosts[stage.type] });
      dispatch(setSelectedPostsForNextStage([]));
    }else{
      dispatch(setActiveStage(stage.type));
      dispatch(setFinalizeStage("nextStage"));
      dispatch(setSelectedPostsForNextStage(StagePosts[activeStageEnum[stage.type]] || elements));
      updateElements(StagePosts[stage.type]);
      socket.emit('newElements', { id: sessionId, data: StagePosts[stage.type] });
      if(!StagePosts[CurrentStage]){
        const newStagePost = {...StagePosts,[CurrentStage]:elements}
        dispatch(setStagePost(newStagePost))
        socket.emit("stagesPosts",sessionId, newStagePost)

      }
    }
    socket.emit('newElements', { id: sessionId, data: StagePosts[CurrentStage] });
  }

  const handleIncludePost = () =>{
    const nextStage = activeStageEnum[ActiveStage];    
    let newStagePost = {...StagePosts,[nextStage]:SelectedPostsForNextStage}
    dispatch(setStagePost(newStagePost));
    socket.emit("stagesPosts",sessionId, newStagePost)
  }

  return (
    <>
     {!sessionCode && <div className="invite-container">
      <h2 className="session-title">Session: {SelectedTemplate?.sessionName}</h2>
      <select
        className="invite-dropdown"
        onChange={handleDropdownChange}
        disabled={SelectedElement?.length > 0 ? false : true}
        ref={ref}
      >
        <option value="">Select Action</option> 
        <option value="lock" disabled={isLocked()}>Lock</option>
        <option value="unlock" disabled={!isLocked()}>Unlock</option>
      </select>
      {elements?.length > 0 && CurrentStage === ActiveStage && <button className='stageButton' onClick={handleFinalizeStage}>
        {FinalizeStage === "finalizeStage" ? "Finalize Stage" : (FinalizeStage === "nextStage" ?"Move To Next Stage":"Start stage")}
      </button>}
      {CurrentStage !== ActiveStage && <button className='stageButton' onClick={handleIncludePost}>
        Move post to next stages
      </button>}
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
    <div className="stage-container">
      {Stages?.length > 0 &&
        Stages.map((stage, index) => (
          <span key={index} className="stage" style={stage.type === ActiveStage ? {fontWeight:"bold"}:{}}>
            <span onClick={()=>handleStageClick(stage)}>{stage.title}</span>
            {index < Stages.length - 1 && <span className="arrow">→</span>}
          </span>
        ))}
    </div>

    <Canvas
      IsStageBlocked={IsStageBlocked}
      User={User}
      ActiveStage={ActiveStage}
      handleWhiteboardClick={handleWhiteboardClick}
      sensors={sensors}
      handleDragEnd={handleDragEnd}
      SelectedTemplate={SelectedTemplate}
      elements={elements}
      handleElementUpdate={handleElementUpdate}
      handleDeleteElement={handleDeleteElement}
      FinalizeStage={FinalizeStage}
      handleComment={handleComment}
      showForm={showForm}
      handleFormSubmit={handleFormSubmit}
      formPosition={formPosition}
      formText={formText}
      setFormText={setFormText}
      setShowForm={setShowForm}
      quadrant={quadrant}
      deckElements={DeckElements}
    />
    <Notification data={NotificationTitle}/>
    </>
  );
};

export default Whiteboard;