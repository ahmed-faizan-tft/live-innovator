require('dotenv').config()
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { set:setCache, get } = require('./cache');

const connectDB = require("./db.js")
const app = express();
const port = 8000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3003", 
      methods: ['GET', 'POST']
    }
  });


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.use("/",require("./router/session.js"))
app.use("/",require("./router/user.js"))
app.use("/",require("./router/join.js"))
app.use("/",require("./router/templates.js"))

// Socket.io connection handling
io.of(/^\/session\/[a-zA-Z0-9-]+$/).on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on("newElements",({id,data})=>{    
    setCache(id,data)
    socket.broadcast.emit("elements", data)
  })

  socket.on("locked",({sessionId,data})=>{
    setCache(`locked-session-id-${sessionId}`,data)    
    socket.broadcast.emit("lockedElements", data)
  })

  socket.on("blockStage", ({sessionId, isBlocked, finalizeStage})=>{
    setCache(`isBlocked-${sessionId}`,isBlocked)
    setCache(`finalizeStage-${sessionId}`,finalizeStage)
    socket.broadcast.emit("stageBlockedForParticipant", isBlocked)
  })

  socket.on("newStageStart", (data)=>{
    setCache(data.sessionId,data?.elements)
    setCache(`locked-session-id-${data.sessionId}`,data?.lockedElement)    
    setCache(`isBlocked-${data.sessionId}`,data?.isBlocked)
    setCache(`finalizeStage-${data.sessionId}`,data?.finalizeStage)
    setCache(`activeStage-${data.sessionId}`,data?.activeStage)
    setCache(`currentStage-${data.sessionId}`,data?.currentStage)
    socket.broadcast.emit("newStageStartForParticipant", data)
  })

  socket.on("comments",(sessionId,comments)=>{
    setCache(`comments-${sessionId}`,comments)
    socket.broadcast.emit("commentsForOtherParticipants", comments);
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
