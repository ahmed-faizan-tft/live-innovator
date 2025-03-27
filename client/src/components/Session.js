import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { faker } from '@faker-js/faker';

const Session = () => {
  // State variables
  const [showTabs, setShowTabs] = useState(true);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [showCard, setShowCard] = useState(false);
  const navigate = useNavigate();

  // Inline styles
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
      marginBottom: '20px',
    },
    tabs: {
      display: 'flex',
      borderBottom: '2px solid #ccc',
      marginBottom: '20px',
    },
    tab: (isActive) => ({
      padding: '10px 20px',
      cursor: 'pointer',
      borderBottom: isActive ? '2px solid blue' : 'none',
      fontWeight: isActive ? 'bold' : 'normal',
    }),
    noData: {
      padding: '20px',
      textAlign: 'center',
      color: '#666',
    },
    card: {
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '20px',
      cursor: 'pointer',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    cardDescription: {
      fontSize: '14px',
      color: '#555',
    },
  };

  // Handlers
  const handleCreateSession = () => {
    setShowTabs(false);
    setShowCard(true);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleCardClick = async () => {
    const key = uuidv4();
    const randomName = faker.person.fullName();
    const response = await axios.post('http://localhost:8000/create-session', {sessionId: key, name:randomName});
    localStorage.setItem("name",randomName)
    if(response.status === 200 ){
        navigate(`/session/${key}`)
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={handleCreateSession}>
        Create Session
      </button>

      {showTabs && (
        <>
          <div style={styles.tabs}>
            <div
              style={styles.tab(activeTab === 'ongoing')}
              onClick={() => handleTabClick('ongoing')}
            >
              Ongoing Sessions
            </div>
            <div
              style={styles.tab(activeTab === 'upcoming')}
              onClick={() => handleTabClick('upcoming')}
            >
              Upcoming Sessions
            </div>
          </div>
          <div style={styles.noData}>No data found</div>
        </>
      )}

      {showCard && (
        <div style={styles.card} onClick={handleCardClick}>
          <div style={styles.cardTitle}>Session Title</div>
          <div style={styles.cardDescription}>Session Description</div>
        </div>
      )}
    </div>
  );
};

export default Session;
