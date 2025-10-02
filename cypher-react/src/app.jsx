import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
    <div className="container-main">
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
                  <li className="nav-item"><span className="nav-link">Welcome User 1!</span></li>
                  <li className="nav-item"><a className="nav-link" href="message.html">Messages</a></li>
                  <li className="nav-item"><a className="nav-link active" href="about.html">About</a></li>
                  <li className="nav-item"><a className="nav-link" href="https://github.com/atidepod/cypher-startup-cs260-2025">Github</a></li>
                </ul>
              </div>
            </div>
          </nav>
        </menu>


      </header>
      <main>
        stuff goes here
      </main>
      <footer className="footer">
        © 2025 Cypher
      </footer>
    </div>

  );
}