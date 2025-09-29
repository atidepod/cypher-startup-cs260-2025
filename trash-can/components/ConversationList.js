import React from 'react';

const ConversationList = ({ users, currentUser, onSelect }) => {
  return (
    <div style={{ width: '25%', backgroundColor: '#444', color: 'white', padding: '10px' }}>
      <h2>Messages</h2>
      <button>+ New Message</button>
      {users.map(user => (
        <div key={user} style={{ marginTop: '10px' }}>
          <button
            style={{
              width: '100%',
              backgroundColor: user === currentUser ? '#666' : '#555',
              color: 'white',
              padding: '5px'
            }}
            onClick={() => onSelect(user)}
          >
            {user}
          </button>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
