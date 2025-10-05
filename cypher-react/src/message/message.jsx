import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from '../login/login.jsx';
import { About } from '../about/about.jsx';
import { textToNumbers, numbersToText, generateOtp, otpEncrypt, otpDecrypt } from "./encrypt.js";
import '../app.css';

export function Message() {
  const [messages, setMessages] = useState([
    { text: "You are not alone", encrypted: "", type: "received" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const [keys, setKeys] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [userPassword, setUserPassword] = useState("royer"); // example password

  // Generate RSA keys (not yet used for lock/unlock, but ready for later)
  useEffect(() => {
    async function generateKeys() {
      const keyPair = await crypto.subtle.generateKey(
        { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
        true,
        ["encrypt", "decrypt"]
      );
      setKeys(keyPair);
    }
    generateKeys();
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send button handler — encrypt before displaying
  const handleSend = async () => {
    if (input.trim() === "") return;

    const msgNumbers = textToNumbers(input);
    const otpKey = generateOtp(msgNumbers.length);
    const encryptedMessage = otpEncrypt(msgNumbers, otpKey);
    const encryptedText = encryptedMessage.join(" "); // numeric cipher text
    const decryptedText = numbersToText(otpDecrypt(encryptedMessage, otpKey));

    setMessages((prev) => [
      ...prev,
      { text: decryptedText, encrypted: encryptedText, otp: otpKey, type: "sent" }
    ]);
    setInput("");
  };

  // 🔒 Lockdown — switch all visible text to encrypted form
  const handleLockdown = () => {
    setIsLocked(true);
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        displayText: msg.encrypted || msg.text,
      }))
    );
  };

  // 🔓 Unlock — prompt for password to restore plain text
  const handleUnlock = () => {
    const entered = prompt("Enter password to unlock messages:");
    if (entered === userPassword) {
      setIsLocked(false);
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          displayText: msg.text,
        }))
      );
    } else {
      alert("Incorrect password!");
    }
  };

  // 🎹 Keyboard shortcut: Ctrl+L (or Cmd+L)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        if (isLocked) {
          handleUnlock();
        } else {
          handleLockdown();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked]); // depends on isLocked so it stays in sync

  return (
    <main className="container">
      <div className="container-fluidq" style={{ display: "flex" }}>
        {/* Sidebar */}
        <div className="sidebar">
          <h5 className="text-white mb-3">Conversations</h5>
          <button className="btn btn-dark">Andrew</button>
          <button className="btn btn-dark">Bob</button>
          <button className="btn btn-dark">Charlie</button>
          <hr />
          {isLocked ? (
            <button className="btn btn-success" onClick={handleUnlock}>
              🔓 Unlock
            </button>
          ) : (
            <button className="btn btn-danger" onClick={handleLockdown}>
              🔒 Lockdown
            </button>
          )}
          <p style={{ fontSize: "0.8rem", color: "white" }}>
            Shortcut: <strong>Ctrl + e</strong>
          </p>
        </div>

        {/* Chat */}
        <div className="chat">
          <div className="chat-header">
            <h5>
              Active Chat {isLocked && "(Locked)"}
            </h5>
          </div>

          <div className="chat-window">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.type}`}
                title={msg.encrypted}
                onMouseEnter={(e) => {
                  if (!isLocked) e.currentTarget.textContent = msg.encrypted;
                }}
                onMouseLeave={(e) => {
                  if (!isLocked) e.currentTarget.textContent = msg.text;
                }}
              >
                {isLocked ? msg.encrypted : msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {!isLocked && (
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
