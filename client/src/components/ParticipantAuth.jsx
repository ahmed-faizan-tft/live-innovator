import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { setSelectedTemplate, setUser } from "../redux/userSlice";
import { useDispatch } from "react-redux";
const pathParts = window.location.pathname.split("/");

const ParticipantAuth = () => {
    const [token, setToken] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const sessionId = pathParts[1];
  const code = pathParts[3]
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const templateId = queryParams.get("template");
  
  
  const navigate = useNavigate()
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchData(){
        try {
            const sessionData = await axios.get(`http://localhost:8000/check/${sessionId}/${code}`);
            
            if (sessionData.status === 200 && sessionData?.data?.data?.isPresent) {
                setIsAuthenticated(true);
                if(templateId){
                  const template = await axios.get(`http://localhost:8000/get-template/${templateId}`);
                  
                  dispatch(setSelectedTemplate(template?.data?.data));

                }
                return;
            }
            navigate("/badAuth")
        } catch (error) {
            navigate("/badAuth")
        }
    }
    fetchData();
  }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await axios.post('http://localhost:8000/auth', {token});
        if(response.status === 200){
            const user = response?.data?.data
            dispatch(setUser({id:user._id, name: user.name, role:user.role}));
            localStorage.setItem('user', JSON.stringify({id:user._id, name: user.name, role:user.role}))
            navigate(`/session/${sessionId}?code=${code}&username=${user.name}`);
        }
    };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
      }}>
            {!isAuthenticated ? (
    <>
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
                </>
            ) : (
                <form onSubmit={handleSubmit} style={{ textAlign: "center" }}>
                    <h2>Enter JWT token</h2>
                    <input 
                        type="text" 
                        placeholder="Enter token" 
                        value={token} 
                        onChange={(e) => setToken(e.target.value)} 
                        required
                        style={{ padding: "10px", fontSize: "1rem", marginBottom: "10px" }}
                    />
                    <br />
                    <button type="submit" style={{ padding: "10px 20px", fontSize: "1rem" }}>Join Session</button>
                </form>
            )}
        </div>
    );
};

export default ParticipantAuth;