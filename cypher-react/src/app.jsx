import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Login } from './login/login.jsx';
import { About } from './about/about.jsx';
import { Message } from './message/message.jsx';

export default function App() {
  const [user, setUser] = useState(null);

  // Load stored username from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <header className="container-fluid">
        <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container-fluid">
            <a className="navbar-brand fw-bold" href="#">Cypher</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
              <ul className="navbar-nav">
                {!user && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/">Login</NavLink>
                  </li>
                )}
                {user && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/message">Messages</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/about">About</NavLink>
                    </li>
                    <li className="nav-item">
                  <a className="nav-link" href="https://github.com/atidepod/cypher-startup-cs260-2025">Github</a>
                </li>
                    <li className="nav-item">
                      <button onClick={handleLogout} className="btn btn-danger btn-sm ms-2">
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
        <Route path='/' element={<Login setUser={setUser} />} />
        <Route path='/about' element={user ? <About /> : <Login setUser={setUser} />} />
        <Route path='/message' element={user ? <Message /> : <Login setUser={setUser} />} />
        <Route path='*' element={<NotFound />} />
      </Routes>

      <footer className="footer">
        © 2025 Cypher, Elijah Royer
      </footer>
    </BrowserRouter>
  );
}

function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: LOL get wrecked. Return to sender. Address unknown.</main>;
}
