import { io } from "socket.io-client";

export const createSocket = (sessionId) => {
  return io(`http://localhost:8000/session/${sessionId}`);
};