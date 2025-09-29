import React from "react";

function Message({ text, sender }) {
  const isMe = sender === "me";
  return (
    <div className={`message ${isMe ? "sent" : "received"}`}>
      {text}
    </div>
  );
}

export default Message;
