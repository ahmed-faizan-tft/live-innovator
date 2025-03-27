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
      origin: 'http://localhost:3004', 
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

// Socket.io connection handling
io.of(/^\/session\/[a-zA-Z0-9-]+$/).on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on("newElements",({id,data})=>{    
    setCache(id,data)
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
