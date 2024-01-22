const express = require('express');
const http = require('http');
const socketIO = require('socket.io'); 

const app = express();
const server = http.createServer(app);
const io = socketIO(server,); // we candefine the cors here also

const usersInDocument = {};
const documents = {};

io.on('connection', (socket) => {
  // console.log('A user connected');

  socket.on('updateUser', ({username, documentId}) => {
    if (documentId) {
      socket.username = username;
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

  socket.on('disconnect', () => {
    let documentId = null;
    for (const [docId, users] of Object.entries(usersInDocument)) {
      const index = users.indexOf(socket.username);
      if (index !== -1) {
        documentId = docId;
        users.splice(index, 1); 
        updateUsersList(documentId);
        break;
      }
    }
    console.log(`User disconnected from document ${documentId}`);
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

module.exports = app;