// ... existing imports ...
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTemplate } from '../redux/userSlice';

const Session = () => {
  const [showTabs, setShowTabs] = useState(true);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [showCard, setShowCard] = useState(false);
  const [templates, setTemplates] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    async function getTemplates() {
      const response = await axios.get('http://localhost:8000/get-templates');
      if (response.status === 200) {
        setTemplates(response.data.data);
      }
    }
    getTemplates();
  }, []);

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
      marginBottom: '20px',
      cursor: 'pointer',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    sectionItem: {
      padding: '6px 10px',
      borderRadius: '5px',
      color: '#333',
      display: 'inline-block',
      marginRight: '10px',
      marginBottom: '6px',
    },
  };

  const handleCreateSession = () => {
    setShowTabs(false);
    setShowCard(true);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleCardClick = async (template) => {
    
    const key = uuidv4();
    const randomName = template?.sessionName
    const response = await axios.post('http://localhost:8000/create-session', {
      sessionId: key,
      name: randomName,
      template:template
    });
    localStorage.setItem("name", randomName);
    if (response.status === 200) {
      dispatch(setSelectedTemplate(template))
      navigate(`/session/${key}`);
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

      {showCard && templates.map(template => (
        <div
          key={template._id}
          style={styles.card}
          onClick={() => handleCardClick(template)}
        >
          <div style={styles.cardTitle}>{template.sessionName}</div>
          <div>
            {template.sections.map((section) => (
              <span
                key={section.id}
                style={{
                  ...styles.sectionItem,
                  backgroundColor: section.color,
                }}
              >
                {section.title}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Session;
