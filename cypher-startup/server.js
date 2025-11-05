// server.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // your React dev server
  credentials: true,
}));

// In-memory storage (for demo only)
let users = {}; // { username: { id, username } }
let messages = {}; // { username: [{ from, to, text, time }] }

// 🧑 Register/Login (simplified for demo)
app.post("/api/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  let user = users[username];
  if (!user) {
    user = { id: uuidv4(), username };
    users[username] = user;
  }

  res.cookie("cypherUser", username, {
    httpOnly: false, // so client JS can access for now
    sameSite: "strict",
  });
  res.json({ success: true, username });
});

// 🧾 Logout
app.post("/api/logout", (req, res) => {
  const username = req.cookies.cypherUser;
  if (username) delete users[username];
  res.clearCookie("cypherUser");
  res.json({ success: true });
});

// 📩 Send Message
app.post("/api/message", (req, res) => {
  const { from, to, text } = req.body;
  if (!from || !to || !text)
    return res.status(400).json({ error: "Missing required fields" });

  const message = { from, to, text, time: new Date().toISOString() };

  if (!messages[from]) messages[from] = [];
  if (!messages[to]) messages[to] = [];

  messages[from].push(message);
  messages[to].push(message);

  res.json({ success: true, message });
});

// 💬 Get Messages for a User
app.get("/api/messages/:username", (req, res) => {
  const { username } = req.params;
  res.json(messages[username] || []);
});

// 🧠 Get Active Users
app.get("/api/users", (_req, res) => {
  res.json(Object.keys(users));
});

// 🧩 3rd Party Example: Random Quote
app.get("/api/quote", async (_req, res) => {
  try {
    const response = await fetch("https://api.quotable.io/random");
    const data = await response.json();
    res.json({ text: data.content, author: data.author });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

app.listen(PORT, () => console.log(`✅ Cypher backend running on port ${PORT}`));
