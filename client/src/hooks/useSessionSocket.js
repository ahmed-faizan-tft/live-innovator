import { useEffect, useState } from 'react';
import axios from 'axios';
import { createSocket } from '../utils/socket';
import { useDispatch } from 'react-redux';
import { setActiveStage, setComments, setCurrentStage, setFinalizeStage, setIsStageBlocked, setLockedElement, setSelectedTemplate, setStages } from '../redux/userSlice';

const useSessionSocket = (sessionId) => {
  const [socket, setSocket] = useState(null);
  const [elements, setElements] = useState([]);
  const dispatch = useDispatch()

  useEffect(() => {
    const newSocket = createSocket(sessionId);
    setSocket(newSocket);

    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/restore/${sessionId}`);
        console.log("response.data",response.data);
        
        if(response.status !== 200){
          throw "Error in restoring data"
        }
        if (response.data?.data) {
          setElements(response.data.data);
        }
        
        if (response.data?.lockedData) {
          dispatch(setLockedElement(response.data.lockedData));
        }

        if (response.data?.templateData) {
          dispatch(setSelectedTemplate(response.data?.templateData))
        }

        if (response.data?.stagesData) {
          dispatch(setStages(response.data?.stagesData))
        }

        if (response.data?.activeStageData) {
          dispatch(setActiveStage(response.data?.activeStageData))
        }
        if (response.data?.currentStageData) {
          dispatch(setCurrentStage(response.data?.currentStageData))
        }
        
        if (response.data?.isStageBlockedData) {
          dispatch(setIsStageBlocked(response.data?.isStageBlockedData))
        }
        if (response.data?.finalizeStageData) {
          dispatch(setFinalizeStage(response.data?.finalizeStageData))
        }

        if (response.data?.commentsData) {
          dispatch(setComments(response.data?.commentsData))
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    newSocket.on('elements', (newElements) => {
      setElements(newElements);
    });

    newSocket.on('lockedElements', (data) =>{
      dispatch(setLockedElement(data))
    })

    newSocket.on("stageBlockedForParticipant", (isBlocked)=>{
      dispatch(setIsStageBlocked(isBlocked))
    })

    newSocket.on("newStageStartForParticipant",(data)=>{
      setElements(data.elements);
      dispatch(setLockedElement(data.lockedElement))
      dispatch(setIsStageBlocked(data.isBlocked));
      dispatch(setActiveStage(data.activeStage));
      dispatch(setCurrentStage(data.currentStage));
    })

    newSocket.on("commentsForOtherParticipants",(data)=>{
      dispatch(setComments(data));
    })

    return () => {
      newSocket.off('elements');
      newSocket.disconnect();
    };
  }, [sessionId]);

  const updateElements = (newElements) => {
    if (socket) {
      setElements(newElements);
      socket.emit('newElements', { id: sessionId, data: newElements });
    }
  };

  return { socket, elements, updateElements };
};

export default useSessionSocket;