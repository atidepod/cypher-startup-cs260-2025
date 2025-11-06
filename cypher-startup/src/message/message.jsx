import React, { useState, useRef, useEffect } from "react";
import { textToNumbers, numbersToText, generateOtp, otpEncrypt, otpDecrypt } from "./encrypt.js";
import { Login } from '../login/login.jsx';
import { About } from '../about/about';
import "../app.css";

export function Message({ sessionId, username, onLogout }) {
  const [currentChat, setCurrentChat] = useState("Andrew");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const chatEndRef = useRef(null);
  const [chat, setChat] = useState("default");


  // Fetch messages from server
  const fetchMessages = async (chat) => {
    try {
      const res = await fetch(`http://localhost:3001/api/messages/${chat}`, {
        method: "GET", // or POST
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId // MUST match backend
        },
      });
      const data = await res.json();
      if (!data.messages) return;

      setMessages(prev => [
        ...prev,
        { text: input, encrypted: encryptedText, type: "sent" }
      ]);
      setInput("");

    } catch (err) {
      console.error(err);
    }
  };

  // Send new message
const handleSend = async () => {

  if (input.trim() === "") return;

  const msgNumbers = textToNumbers(input);
  const otpKey = generateOtp(msgNumbers.length);
  const encryptedMessage = otpEncrypt(msgNumbers, otpKey);
  const encryptedText = encryptedMessage.join(" ");
  const decryptedText = numbersToText(otpDecrypt(encryptedMessage, otpKey));

  // Optimistically add message to UI
  const newMsg = {
    type: "outgoing",
    text: decryptedText,
    encrypted: encryptedText,
  };
  setMessages(prev => [...prev, newMsg]);
  setInput("");

  // Send encrypted message to server
  try {
    const res = await fetch(`http://localhost:3001/api/messages/${chat}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId
      },
      body: JSON.stringify({ encrypted: encryptedText, otp: otpKey })
    });

  } catch (err) {
    console.error(err);
    // Optional: remove the message if sending fails
    // setMessages(prev => prev.filter(m => m !== newMsg));
  }
};


  // Auto-fetch messages every 3 seconds
  useEffect(() => {
    fetchMessages(currentChat);
    const interval = setInterval(() => fetchMessages(currentChat), 3000);
    return () => clearInterval(interval);
  }, [currentChat, sessionId]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lock toggle
  const toggleLockdown = () => {
    if (!locked) {
      setLocked(true);
    } else {
      const userInput = prompt("Enter password to unlock:");
      if (userInput === "royer") setLocked(false);
      else alert("Incorrect password!");
    }
  };

  return (
    <main className="container">
      <div className="container-fluidq">
        {/* Sidebar */}
        <div className="sidebar">
          <h5 className="text-white mb-3">Conversations</h5>
          {["Andrew", "Bob", "Charlie"].map((name) => (
            <button
              key={name}
              className={`btn ${currentChat === name ? "btn-primary" : "btn-dark"} mb-2`}
              onClick={() => setCurrentChat(name)}
            >
              {name}
            </button>
          ))}
          <hr />
          <button className="btn btn-danger w-100" onClick={toggleLockdown}>
            {locked ? "Unlock 🔓" : "Lock 🔒"}
          </button>
          <button className="btn btn-secondary w-100 mt-2" onClick={onLogout}>
            Logout
          </button>
          <p>
            Shortcut: <strong>Ctrl + e</strong> Password: royer
          </p>
        </div>

        {/* Chat Section */}
        <div className="chat">
          <div className="chat-header">
            <h5>{currentChat}'s Chat {locked && "(Locked 🔒)"}</h5>
          </div>

          <div className="chat-window">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.type}`}
                title={locked ? msg.encrypted : msg.text}
                onMouseEnter={(e) => { if (!locked) e.currentTarget.textContent = msg.encrypted; }}
                onMouseLeave={(e) => { if (!locked) e.currentTarget.textContent = msg.text; }}
              >
                {locked ? msg.encrypted : msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {!locked && (
            <div className="chat-input">
              <input
                type="text"
                className="form-control"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className="btn btn-primary" onClick={handleSend}>Send</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
