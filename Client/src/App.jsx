import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './style.css';

const socket = io('http://localhost:3000');

export default function App() {
  const [msg, setMsg] = useState('');
  const [msgs, setMsgs] = useState([{}]);
  const [name,setName]=useState('');

  const sendMsg = () => {
    socket.emit('sending', msg,name);
    setMsgs((prevmsgs) => [...prevmsgs, { message: msg, socketId: name?name:'Me' }]);
    setMsg('');
  };

  useEffect(() => {
    socket.on('response', (msg, id) =>
      setMsgs((prevmsgs) => [...prevmsgs, { message: msg, socketId: id }])
    );
    socket.on('leave', (msg, id) =>
      setMsgs((prevmsgs) => [...prevmsgs, { message: msg, socketId: id }])
    );
  }, []);

  return (
    <div className="container">
      <h3>Chat App</h3>
      <div className='name'>
        <input type="text" name="nam" id="name" onChange={(e)=>setName(e.target.value)} value={name} placeholder='Enter your name.....' />
      </div>
      <div className="chat-box">
        
          
            {msgs.map((msg, index) => (
            <>
            {msg.socketId&&
              <div key={index} className="chat-message" style={{ textAlign: msg.socketId === name || msg.socketId==='Me' ? 'right' : 'left' }}>
              <div
                className="message-content"
                style={{
                  backgroundColor: msg.socketId === name || msg.socketId==='Me'  ? '#e9e5e5' : '#baffba',
                  borderRadius: '50px',
                  padding: '3.7px',
                  display: 'inline-block',
                }}
              >
                <span>{msg.socketId}:</span> {msg.message}
              </div>
            </div>
            
            
}
              </>
            ))}
          
        
      </div>
      <div className="input-container">
        <input
          type="text"
          name="msg"
          id="msg"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button onClick={sendMsg}>Send</button>
      </div>
    </div>
  );
}
