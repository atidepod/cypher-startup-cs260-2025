import React, { useState, useEffect, useRef } from 'react';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    ws.current = new WebSocket('https://startup.cypherw.click');

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { user: 'You', message: input };
    ws.current.send(JSON.stringify(msg));
    setInput('');
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      
      {/* Sidebar */}
      <div style={{ width: '25%', backgroundColor: '#444', color: 'white', padding: '10px', boxSizing: 'border-box' }}>
        <h2>Messages</h2>
        <button style={{ width: '100%', marginBottom: '10px' }}>+ New Message</button>
        <button style={{ width: '100%', marginBottom: '5px' }}>Alice</button>
        <button style={{ width: '100%', marginBottom: '5px' }}>Bob</button>
        <button style={{ width: '100%', marginBottom: '5px' }}>Charlie</button>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px', boxSizing: 'border-box', backgroundColor: 'rgba(0,0,0,0.6)', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                textAlign: m.user === 'You' ? 'right' : 'left',
                margin: '5px 0',
              }}
            >
              <span style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '15px',
                backgroundColor: m.user === 'You' ? '#0b93f6' : '#e5e5ea',
                color: m.user === 'You' ? 'white' : 'black',
                maxWidth: '70%',
                wordWrap: 'break-word'
              }}>
                <b>{m.user}: </b>{m.message}
              </span>
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: 'none', marginRight: '5px' }}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          />
          <button onClick={sendMessage} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#0b93f6', color: 'white' }}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
