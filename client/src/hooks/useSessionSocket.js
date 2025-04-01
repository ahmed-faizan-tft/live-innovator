import { useEffect, useState } from 'react';
import axios from 'axios';
import { createSocket } from '../utils/socket';

const useSessionSocket = (sessionId) => {
  const [socket, setSocket] = useState(null);
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const newSocket = createSocket(sessionId);
    setSocket(newSocket);

    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/restore/${sessionId}`);
        if (response.status === 200 && response.data?.data) {
          setElements(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    newSocket.on('elements', (newElements) => {
      setElements(newElements);
    });

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

  return { elements, updateElements };
};

export default useSessionSocket;