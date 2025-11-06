import React, { useState, useEffect } from "react";
import "../app.css";

export function Login({ setSessionId, setUsername }) {
  const [inputUsername, setInputUsername] = useState("");
  const [password, setPassword] = useState(""); // optional
  const [randomWord, setRandomWord] = useState(""); // added
  const [loadingWord, setLoadingWord] = useState(true); // added

  // Fetch random word from third-party API
  useEffect(() => {
    const fetchRandomWord = async () => {
      try {
        const res = await fetch("https://random-word-api.herokuapp.com/word?number=1");
        const data = await res.json();
        setRandomWord(data[0]);
      } catch (err) {
        console.error("Failed to fetch random word:", err);
        setRandomWord("cypher");
      } finally {
        setLoadingWord(false);
      }
    };
    fetchRandomWord();
  }, []);

  // Handle login
  const handleLogin = async () => {
    if (!inputUsername.trim()) {
      alert("Enter a username");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inputUsername, password }),
      });

      const data = await res.json();

      if (res.ok && data.sessionId) {
        setSessionId(data.sessionId);
        setUsername(inputUsername);

        localStorage.setItem("sessionId", data.sessionId);
        localStorage.setItem("username", inputUsername);
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      alert("Error connecting to server.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login / Create User</h2>

        <input
          type="text"
          placeholder="Username"
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
          className="form-control mb-2"
        />

        <input
          type="password"
          placeholder="Password (optional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control mb-3"
        />

        <button className="btn btn-primary w-100" onClick={handleLogin}>
          Login
        </button>

        <div className="random-word">
          {loadingWord ? "Loading..." : `Random word: "${randomWord}"`}
        </div>

      </div>
    </div>
  );
}
