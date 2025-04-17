import { useEffect, useState } from 'react';
import axios from 'axios';
import { createSocket } from '../utils/socket';
import { useDispatch } from 'react-redux';
import { setActiveStage, setComments, setCurrentStage, setDeckElements, setFinalizeStage, setIsStageBlocked, setLockedElement, setNotificationTitle, setPrioritiesStagePosts, setPrioritiesStagePostsEachUser, setSelectedTemplate, setStagePost, setStages } from '../redux/userSlice';

const useSessionSocket = (sessionId) => {
  const [socket, setSocket] = useState(null);
  const [elements, setElements] = useState([]);
  const dispatch = useDispatch()
  const user = localStorage.getItem("user");
  const User = JSON.parse(user)      
  function processPosts(data) {
    const result = [];

    for (const key in data) {
        const posts = data[key];
        if (!posts || posts.length === 0) continue;

        const base = posts[0]; // All other properties are same across objects in a group

        const avgRelX = posts.reduce((sum, item) => sum + item.relX, 0) / posts.length;
        const avgRelY = posts.reduce((sum, item) => sum + item.relY, 0) / posts.length;

        result.push({
            id: base.id,
            content: base.content,
            width: base.width,
            height: base.height,
            userId: base.userId,
            username: base.username,
            color: base.color,
            relX: avgRelX,
            relY: avgRelY
        });
    }

    return result;
}

  useEffect(() => {
    const newSocket = createSocket(sessionId);
    setSocket(newSocket);

    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/restore/${sessionId}`);
        
        if(response.status !== 200){
          throw "Error in restoring data"
        }
        console.log("response.data-",response.data);

        if(response.data.activeStageData !== "prioritize"){
          if (response.data?.data) {
            setElements(response.data.data);
          }
        }else{          
          if (response.data?.actualDeckElementsData && (!response.data?.priorityPostsEachUserData || !response.data?.priorityPostsEachUserData[User?.id])) {            
            dispatch(setDeckElements(response.data?.actualDeckElementsData))
          }

          if (response.data?.priorityCombinedPostData) {
            dispatch(setPrioritiesStagePosts(response.data?.priorityCombinedPostData));
            const newElements = processPosts(response.data?.priorityCombinedPostData);

            if(User.role === "facilitator"){
              setElements(newElements);
            }
          }

          if (response.data?.priorityPostsEachUserData) {
            const userId = User.id;
            const data = response.data?.priorityPostsEachUserData;
            const currentUserStageData = data[userId];
            if(currentUserStageData){
              dispatch(setPrioritiesStagePostsEachUser(response.data?.priorityPostsEachUserData));
              setElements(currentUserStageData.elements);
              dispatch(setDeckElements(currentUserStageData.deckElements))
            }
          }
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

        if (response.data?.stagesPostsData) {
          dispatch(setStagePost(response.data?.stagesPostsData))
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
      if(data?.activeStage !== "prioritize"){
        setElements(data.elements);
      }else{
        let x = 0, y = 0;
        const modifiedElements = data.actualDeckElements?.map((element,index)=>{
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
            color:"white",
            prioritizeUserId: User.id
          }
        })        
        dispatch(setDeckElements(modifiedElements));
        setElements([]);
      }
      dispatch(setLockedElement(data.lockedElement))
      dispatch(setIsStageBlocked(data.isBlocked));
      dispatch(setActiveStage(data.activeStage));
      dispatch(setCurrentStage(data.currentStage));
    })

    newSocket.on("commentsForOtherParticipants",(data)=>{
      dispatch(setComments(data));
    })

    newSocket.on("notifiyParticipants",(title)=>{
      dispatch(setNotificationTitle(title))
    })

    newSocket.on("priorityCombinedPostForOthers",(data)=>{      
      dispatch(setPrioritiesStagePosts(data));
      const newElements = processPosts(data);
      
      if(User.role === "facilitator"){
        setElements(newElements);
      }
    })

    return () => {
      newSocket.off('elements');
      newSocket.disconnect();
    };
  }, [sessionId]);

  const updateElements = (newElements) => {
    if (socket) {
      setElements(newElements);
    }
  };

  return { socket, elements, updateElements };
};

export default useSessionSocket;