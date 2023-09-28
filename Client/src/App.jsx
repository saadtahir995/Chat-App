import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './style.css'; // Import your CSS file

const socket = io('http://localhost:3000');

export default function App() {
  const [msg, setMsg] = useState('');
  const [msgs, setMsgs] = useState([{}]);

  const sendMsg = () => {
    console.log('hi');
    socket.emit('sending', msg);
    setMsgs((prevmsgs) => [...prevmsgs, { message: msg, socketId: 'Me' }]);
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
      <div className="chat-box">
        {msgs.length > 1 && (
          <>
            {msgs.map((msg, index) => (
              <div key={index} className="chat-message">
                <span>{msg.socketId} :</span> {msg.message}
              </div>
            ))}
          </>
        )}
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
