import React from 'react';
import ChatApp from './ChatApp';

function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ backgroundColor: '#333', color: 'white', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div><b>Cypher</b></div>
        <div>
          Welcome User 1! | 
          <a href="/" style={{ color: 'white', margin: '0 5px' }}>Home</a> | 
          <a href="/about" style={{ color: 'white', margin: '0 5px' }}>About</a> | 
          <a href="https://github.com/atidepod/cypher-startup-cs260-2025" style={{ color: 'white', margin: '0 5px' }}>Github</a>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', backgroundImage: 'url(background.jpg)', backgroundSize: 'cover' }}>
        <ChatApp />
      </main>

      <footer style={{ backgroundColor: '#333', color: 'white', textAlign: 'center', padding: '10px' }}>
        © 2025 Cypher.
      </footer>
    </div>
  );
}

export default App;
