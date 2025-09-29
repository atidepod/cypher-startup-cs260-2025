import React from 'react';

const ChatWindow = ({ messages }) => {
  return (
    <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ backgroundColor: '#222', color: 'white', padding: '10px', flexGrow: 1, overflowY: 'auto', borderRadius: '5px' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              textAlign: msg.type === 'sent' ? 'right' : 'left',
              margin: '5px 0'
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <input type="text" placeholder="Type a message..." size="50" />
        <button>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
