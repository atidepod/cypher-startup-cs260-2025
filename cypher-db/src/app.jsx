import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { Login } from './login/login.jsx';
import { About } from './about/about.jsx';
import { Message } from './message/message.jsx';

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [username, setUsername] = useState("");
  const [chat, setChat] = useState("default");

  // --- Restore session from localStorage ---
  useEffect(() => {
    const storedSession = localStorage.getItem("sessionId");
    const storedUsername = localStorage.getItem("username");
    if (storedSession && storedUsername) {
      setSessionId(storedSession);
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sessionId");
    localStorage.removeItem("username");
    setSessionId(null);
    setUsername("");
  };

  return (
    <BrowserRouter>
      <header className="container-fluid">
        <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container-fluid">
            <a className="navbar-brand fw-bold" href="#">Cypher</a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
              <ul className="navbar-nav">
                {!sessionId ? (
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="https://github.com/atidepod/cypher-startup-cs260-2025"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  </li>
                ) : (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/message">Messages</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/about">About</NavLink>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        href="https://github.com/atidepod/cypher-startup-cs260-2025"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub
                      </a>
                    </li>
                    <li className="nav-item">
                      <button
                        onClick={handleLogout}
                        className="btn btn-danger btn-sm ms-2"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <Routes>
        {/* --- Before login --- */}
        {!sessionId ? (
          <>
            <Route path="/" element={<Login setSessionId={setSessionId} setUsername={setUsername} />} />
            {/* Redirect all other routes back to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          /* --- After login --- */
          <>
            <Route path="/message" element={<Message sessionId={sessionId} username={username} onLogout={handleLogout} />} />
            <Route path="/about" element={<About />} />
            <Route path="/" element={<Navigate to="/message" replace />} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>

      <footer className="footer">© 2025 Cypher</footer>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center text-white py-5">
      404: LOL Return to sender. Address unknown.
    </main>
  );
}
