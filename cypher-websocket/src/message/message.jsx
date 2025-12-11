import React, { useState, useRef, useEffect } from "react";
import {
  textToNumbers,
  numbersToText,
  generateOtp,
  otpEncrypt,
  otpDecrypt
} from "./encrypt.js";
import "../app.css";

export function Message({ sessionId, username, onLogout }) {
  const [currentChat, setCurrentChat] = useState("Andrew");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [locked, setLocked] = useState(false);
  const chatEndRef = useRef(null);
  const [socket, setSocket] = useState(null);

  // ----------------------------
  // Ensure sessionId is valid
  // ----------------------------
  useEffect(() => {
    if (!sessionId) {
      console.warn("❌ Message.jsx mounted with NO sessionId — preventing fetch");
    }
  }, [sessionId]);

  // ----------------------------
  //  WebSocket Setup
  // ----------------------------
  useEffect(() => {
    if (!sessionId || !username) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}`);

    ws.onopen = () => {
      console.log("WebSocket connected");

      ws.send(
        JSON.stringify({
          type: "identify",
          sessionId,
          username
        })
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "new_message" && msg.chat === currentChat) {
        const decrypted = numbersToText(
          otpDecrypt(msg.encrypted.split(" ").map(Number), msg.otp)
        );

        setMessages((prev) => [
          ...prev,
          {
            type: "incoming",
            text: decrypted,
            encrypted: msg.encrypted
          }
        ]);
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [sessionId, username, currentChat]);

  // ----------------------------
  // Fetch messages for a chat
  // ----------------------------
  const fetchMessages = async (chat) => {
    if (!sessionId) return;

    try {
      const res = await fetch(`/api/messages/${chat}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        }
      });

      if (res.status === 401) {
        console.warn("❌ 401: Session is invalid. Logging out.");
        onLogout();
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) return;

      const formatted = data.map((m) => ({
        type: m.username === username ? "outgoing" : "incoming",
        text: numbersToText(
          otpDecrypt(m.encrypted.split(" ").map(Number), m.otp)
        ),
        encrypted: m.encrypted
      }));

      setMessages(formatted);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Load messages when chat changes
  useEffect(() => {
    if (sessionId) {
      fetchMessages(currentChat);
    }
  }, [currentChat, sessionId]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ----------------------------
  // Send new message
  // ----------------------------
  const handleSend = async () => {
    if (input.trim() === "") return;

    const msgNumbers = textToNumbers(input);
    const otpKey = generateOtp(msgNumbers.length);
    const encryptedMessage = otpEncrypt(msgNumbers, otpKey);
    const encryptedText = encryptedMessage.join(" ");

    const outgoingMsg = {
      type: "outgoing",
      text: input,
      encrypted: encryptedText
    };

    // Show immediately
    setMessages((prev) => [...prev, outgoingMsg]);
    setInput("");

    // Store in database
    try {
      await fetch(`/api/messages/${currentChat}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId
        },
        body: JSON.stringify({ encrypted: encryptedText, otp: otpKey })
      });
    } catch (err) {
      console.error(err);
    }

    // WebSocket broadcast
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "new_message",
          chat: currentChat,
          encrypted: encryptedText,
          otp: otpKey,
          username
        })
      );
    }
  };

  // ----------------------------
  // Lock Toggle
  // ----------------------------
  const toggleLockdown = () => {
    if (!locked) {
      setLocked(true);
    } else {
      const pw = prompt("Enter password to unlock:");
      if (pw === "royer") setLocked(false);
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
              className={`btn ${currentChat === name ? "btn-primary" : "btn-dark"
                } mb-2`}
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
            <h5>
              {currentChat}'s Chat {locked && "(Locked 🔒)"}
            </h5>
          </div>

          <div className="chat-window">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.type}`}
                title={locked ? msg.encrypted : msg.text}
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
