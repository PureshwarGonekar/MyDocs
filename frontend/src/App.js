import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

import './App.css';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});


function App() {
  const [myname, setMyname]= useState('');
  const [content, setContent] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [documentId, setDocumentId] = useState('');

  console.log("onlineUsers",onlineUsers)

  useEffect(() => {
    if (myname) {
      socket.emit('updateUser', {username:myname, documentId:documentId});
    }
  }, [documentId]);

  useEffect(() => {
    socket.on('content', (data) => {
      setContent(data);
    });

    socket.on('users', (data) => {
      console.log("data",data)
      setOnlineUsers(data);
    });

    socket.on('documentCreated', (id) => {
      setDocumentId(id);
      socket.emit('joinDocument', id);
    });

    socket.on('documentNotFound', () => {
      alert('Document not found');
    });
  }, []);

  const handleInputChange = (newContent) => {
    socket.emit('content', { documentId, content: newContent });
  };

  const createDocument = () => {
    socket.emit('createDocument');
  };

  const joinDocument = () => {
    const input = prompt('Enter document ID to join:');
    if (input) {
      socket.emit('joinDocument', input);
      setDocumentId(input);
    }
  };

  var modules = {
    toolbar: [
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
        { align: [] }
      ],
      [{ "color": ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", 'custom-color'] }],
    ]
  };
  var formats = [
    "header", "height", "bold", "italic",
    "underline", "strike", "blockquote",
    "list", "color", "bullet", "indent",
    "link", "image", "align", "size",
  ];

  return (
    <div style={{padding: "50px 200px"}}>
      <div>
        <input value={myname} onChange={(e)=>setMyname(e.target.value)} type="text" style={{margin : "10px 0px", padding: "7px", fontWeight: 'bold', background: "pink"}} placeholder='Enter your name....'/>
      </div>
      <div style={{marginBottom: "50px"}}>
        <button style={{margin : "10px 10px 10px 0px", padding: "7px"}} onClick={createDocument} disabled={!myname}>Create Document</button>
        <button style={{margin : "10px 10px 10px 0px", padding: "7px"}} onClick={joinDocument} disabled={!myname}>Join Document</button>
        {documentId && <p className=''>Document ID: <span style={{margin : "10px 0px", padding: "7px", fontWeight: 'bold'}}>{documentId}</span></p>}
      </div>
      <div style={{display: "flex",margin : "0px 0px 20px 0px"}}>
        <strong style={{margin : "0px 20px 0px 0px"}}>Online Users:</strong>
        <div style={{display: "flex"}}>
          {onlineUsers.map((user) => (
            <li  style={{margin : "0px 50px 0px 0px"}} key={user}>{user}</li>
          ))}
        </div>
      </div>
      <ReactQuill
        preserveWhitespace
        modules={modules}
        formats={formats}
        style={{ height: '300px' }}
        value={content}
        onChange={handleInputChange}
      />
    </div>
  );
}

export default App;
