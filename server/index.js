const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { set, get } = require('./cache');

const app = express();
const port = 8000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3005', 
      methods: ['GET', 'POST']
    }
  });


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/auth', (req, res) => {
  const { name, role } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }
  set("name", name);
  set("role", role);
  res.status(200).json({ message: 'Authentication successful', name, role });
});

app.post('/session', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }
  set("sessionId", sessionId);
  res.status(200).json({ message: 'Session successful', sessionId });
});

// Socket.io connection handling
io.of(/^\/session\/[a-zA-Z0-9-]+$/).on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on("newElements",(data)=>{    
    socket.broadcast.emit("elements", data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
