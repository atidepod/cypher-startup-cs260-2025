import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://cypherw.click'); // replace with wss://yourdomain.com in production

    socketRef.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() === '') return;
    socketRef.current.send(input);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#222', color: 'white' }}>
      <div style={{ width: '25%', backgroundColor: '#444', padding: '10px' }}>
        <h2>Messages</h2>
        <button>+ New Message</button>
        <div style={{ marginTop: '10px' }}>
          <button>Alice</button>
          <button>Bob</button>
          <button>Charlie</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {messages.map((msg, idx) => (
            <p key={idx}>{msg}</p>
          ))}
        </div>
        <div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ width: '80%' }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
