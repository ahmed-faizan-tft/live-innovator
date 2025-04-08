import { useEffect, useState } from 'react';
import axios from 'axios';
import { createSocket } from '../utils/socket';
import { useDispatch } from 'react-redux';
import { setLockedElement, setSelectedTemplate } from '../redux/userSlice';

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
        if (response.status === 200 && response.data?.data) {
          setElements(response.data.data);
        }
        
        if (response.status === 200 && response.data?.lockedData) {
          dispatch(setLockedElement(response.data.lockedData));
        }

        if (response.status === 200 && response.data?.templateData) {
          dispatch(setSelectedTemplate(response.data?.templateData))
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