import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../redux/userSlice';
import { useDispatch } from 'react-redux';

const useSessionAuth = (sessionId, sessionCode) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if(user){
      const updatedUser = JSON.parse(user)      
      dispatch(setUser(updatedUser));
    }
  },[])

  useEffect(() => {
    if (!sessionCode) return;

    const verifySession = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/check/${sessionId}/${sessionCode}`
        );
        
        if (response.status !== 200 || !response?.data?.data?.isPresent) {
          navigate(`/badAuth`);
        }
      } catch (error) {
        navigate(`/badAuth`);
      }
    };

    verifySession();
  }, [sessionId, sessionCode, navigate]);
};

export default useSessionAuth;