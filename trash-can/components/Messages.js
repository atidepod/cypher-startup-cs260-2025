import React, { useState } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';

const Messages = () => {
  const [currentUser, setCurrentUser] = useState('Alice');

  // Simple messages state for demonstration
  const conversations = {
    Alice: [
      { type: 'received', text: 'Hey there! How are you?' },
      { type: 'sent', text: 'I’m good, thanks! How about you?' },
      { type: 'received', text: 'Doing well, excited for this project!' },
    ],
    Bob: [
      { type: 'received', text: 'Yo!' },
      { type: 'sent', text: 'Hey Bob, what’s up?' },
    ],
    Charlie: [
      { type: 'received', text: 'Hello!' },
    ],
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: `url('/assets/background.jpg') no-repeat center center fixed`, backgroundSize: 'cover' }}>
      <ConversationList
        users={Object.keys(conversations)}
        currentUser={currentUser}
        onSelect={setCurrentUser}
      />
      <ChatWindow messages={conversations[currentUser]} />
    </div>
  );
};

export default Messages;
