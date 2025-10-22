import React, { useState, useRef, useEffect } from "react";
import { textToNumbers, numbersToText, generateOtp, otpEncrypt, otpDecrypt } from "./encrypt.js";
import "../app.css";

export function Message() {
  const [currentChat, setCurrentChat] = useState("Andrew");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const [locked, setLocked] = useState(false);
  const [password, setPassword] = useState("royer"); // simple password for unlock

  useEffect(() => {
    const saved = localStorage.getItem(`chat_${currentChat}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ text: `New chat with ${currentChat}`, type: "received", encrypted: "" }]);
    }
  }, [currentChat]);

  useEffect(() => {
    localStorage.setItem(`chat_${currentChat}`, JSON.stringify(messages));
  }, [messages, currentChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        toggleLockdown();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const msgNumbers = textToNumbers(input);
    const otpKey = generateOtp(msgNumbers.length);
    const encryptedMessage = otpEncrypt(msgNumbers, otpKey);
    const encryptedText = encryptedMessage.join(" ");
    const decryptedText = numbersToText(otpDecrypt(encryptedMessage, otpKey));

    setMessages((prev) => [
      ...prev,
      { text: decryptedText, encrypted: encryptedText, type: "sent" },
    ]);
    setInput("");
  };

  const toggleLockdown = () => {
    if (!locked) {
      setLocked(true);
    } else {
      const userInput = prompt("Enter password to unlock:");
      if (userInput === password) {
        setLocked(false);
      } else {
        alert("Incorrect password!");
      }
    }
  };

  return (
    <main className="container">
      <div className="container-fluidq" style={{ display: "flex" }}>
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
          <p style={{ fontSize: "0.8rem", color: "white", marginTop: "10px" }}>
            Shortcut: <strong>Ctrl + e</strong> Password: royer
            Thanks for being here! Feel free to type 
            a message into any of the chats. "hover"
            your mouse over the message to see the 
            encrypted message. The lock "button"
            hides your message and requires
            the password to view them. 
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
                onMouseEnter={(e) => {
                  if (!locked) e.currentTarget.textContent = msg.encrypted;
                }}
                onMouseLeave={(e) => {
                  if (!locked) e.currentTarget.textContent = msg.text;
                }}
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
              <button className="btn btn-primary" onClick={handleSend}>
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
