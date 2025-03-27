import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const pathParts = window.location.pathname.split("/");

const ParticipantAuth = () => {
  const sessionId = pathParts[1];
  const code = pathParts[3];
  const navigate = useNavigate()
  useEffect(() => {
    async function fetchData(){

        try {
            const sessionData = await axios.get(`http://localhost:8000/check/${sessionId}/${code}`);
            
            if(sessionData.status === 200 && sessionData?.data?.data?.isPresent) {
                navigate(`/session/${sessionId}?code=${code}`);
                return
            }
            navigate("/badAuth")
        } catch (error) {
            navigate("/badAuth")
        }
    }
    fetchData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
      }}
    >
      <p style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Authenticating...</p>
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "4px solid #ccc",
          borderRadius: "4px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, #000, transparent)",
            position: "absolute",
            animation: "auth-move 1s infinite",
          }}
        ></div>
      </div>
      <style>
        {`
          @keyframes auth-move {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
};

export default ParticipantAuth;
