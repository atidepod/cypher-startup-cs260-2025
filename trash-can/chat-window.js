import React, { useState } from "react";
import Message from "./message";

function ChatWindow({ messages, onSend, activeChat }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <section className="chat">
      <div className="chat-header">
        <h3>Conversation with {activeChat}</h3>
      </div>

      <div className="chat-window">
        {messages.map((msg, i) => (
          <Message key={i} text={msg.text} sender={msg.sender} />
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </section>
  );
}

export default ChatWindow;
