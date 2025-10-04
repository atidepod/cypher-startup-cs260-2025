import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login.jsx';
import { About } from './about/about.jsx';
import { Message } from './message/message.jsx';


export default function App() {
  return (
    <BrowserRouter>
      <header className="container-fluid">
        <menu>
          <nav className="navbar navbar-expand-lg navbar-dark">
            <div className="container-fluid">
              <a className="navbar-brand fw-bold" href="#">Cypher</a>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item"><a className="nav-link" href="/">Login</a></li>
                  <li className="nav-item"><a className="nav-link" href="message">Messages</a></li>
                  <li className="nav-item"><a className="nav-link active" href="about">About</a></li>
                  <li className="nav-item"><a className="nav-link" href="https://github.com/atidepod/cypher-startup-cs260-2025">Github</a></li>
                </ul>
              </div>
            </div>
          </nav>
        </menu>


      </header>
      <Routes>
        <Route path='/' element={<Login />} exact />
        <Route path='/about' element={<About />} />
        <Route path='/message' element={<Message />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <footer className="footer">
        © 2025 Cypher
      </footer>
    </BrowserRouter>

  );
}
function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: LOL Return to sender. Address unknown.</main>;
}