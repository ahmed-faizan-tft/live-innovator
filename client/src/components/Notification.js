import React, { useEffect, useState } from 'react';

const Notification = ({data}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if(data){
        setVisible(true)
    }
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [data]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      fontFamily: 'sans-serif',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      zIndex: 1000
    }}>
      {data}
    </div>
  );
};

export default Notification;
