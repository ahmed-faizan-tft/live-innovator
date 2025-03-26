import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('facilitator');
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = { name, role };
    console.log(payload);
    

    try {
      const response = await axios.post('http://localhost:8000/auth', payload,);

     if(response.status === 200){
        navigate("/session/create")
     }
      console.log('Success:', response);
    } catch (error) {
      console.error('Error:', error);
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
      <label style={labelStyle}>Name:</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
        required
      />

      <label style={labelStyle}>Role:</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={inputStyle}
      >
        <option value="facilitator">Facilitator</option>
        <option value="participant">Participant</option>
      </select>

      <button type="submit" style={buttonStyle}>Submit</button>
    </form>
  );
};

export default Auth;
