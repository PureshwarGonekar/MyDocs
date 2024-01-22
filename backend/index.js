// server/index.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
  },
});

const usersInDocument = {};
const documents = {};

io.on('connection', (socket) => {
  // console.log('A user connected');

  socket.on('updateUser', ({username, documentId}) => {
    if (documentId) {
      usersInDocument[documentId] = usersInDocument[documentId] || [];
      usersInDocument[documentId].push(username);
      updateUsersList(documentId);
    }
  });

  socket.on('createDocument', () => {
    const documentId = generateUniqueId();
    documents[documentId] = { content: '' };
    socket.emit('documentCreated', documentId);
  });

  socket.on('joinDocument', (documentId) => {
    if (documents[documentId]) {
      socket.join(documentId);
      io.to(documentId).emit('content', documents[documentId].content);
      updateUsersList(documentId);
    } else {
      socket.emit('documentNotFound');
    } 
  });

  socket.on('content', ({ documentId, content }) => {
    if (documents[documentId]) {
      documents[documentId].content = content;
      io.to(documentId).emit('content', content);
    }
  });

  socket.on('disconnect', (id) => {
    console.log('A user disconnected');

    // const documentId = Object.keys(socket.rooms)[1]; // Assuming the documentId is the second room
    // if (documentId) {
    //   usersInDocument[documentId] = usersInDocument[documentId] || [];
    //   const index = usersInDocument[documentId].indexOf(socket.myname);
    //   if (index !== -1) {
    //     usersInDocument[documentId].splice(index, 1);
    //     updateUsersList(documentId);
    //   }
    // }
  });

  function updateUsersList(documentId) {
    const usersInRoom = usersInDocument[documentId] || [];
    io.to(documentId).emit('users', usersInRoom);
  }

  function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

});

app.get('/', async (req,res)=>{
    res.send("Backend")
})
server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
