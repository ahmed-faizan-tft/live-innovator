import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../redux/userSlice';
import { useDispatch } from 'react-redux';

const Auth = () => {
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/auth', {token: token});

      if (response.status === 200) {
        const user = response?.data?.data;
        dispatch(setUser({ id: user._id, name: user.name, role: user.role }));
        localStorage.setItem('user', JSON.stringify({ id: user._id, name: user.name, role: user.role }));
        navigate("/session/create");
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '300px',
    margin: 'auto',
  };

  const labelStyle = {
    marginBottom: '5px',
  };

  const inputStyle = {
    marginBottom: '10px',
    padding: '8px',
    fontSize: '16px',
  };

  const buttonStyle = {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <label style={labelStyle}>JWT Token:</label>
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={inputStyle}
        required
      />
      <button type="submit" style={buttonStyle}>Submit</button>
    </form>
  );
};

export default Auth;
