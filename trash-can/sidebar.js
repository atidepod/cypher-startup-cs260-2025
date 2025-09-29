import React from "react";

function Sidebar({ conversations, setActiveChat }) {
  return (
    <aside className="sidebar">
      <h2>Messages</h2>
      <button>+ New Message</button>
      {Object.keys(conversations).map((name) => (
        <button key={name} onClick={() => setActiveChat(name)}>
          {name}
        </button>
      ))}
    </aside>
  );
}

export default Sidebar;
