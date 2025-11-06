import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
const PORT = 3001;

app.use(cors({
  origin: "http://localhost:5173", // allow your frontend
  credentials: true // if you send cookies
}));
app.use(bodyParser.json());

// --- In-memory storage ---
const users = {}; // { username: { password, chats: { chatName: [{encrypted, otp}] } } }
const sessions = {}; // { sessionId: username }

// --- Helper to generate session IDs ---
const generateSessionId = () => crypto.randomBytes(16).toString("hex");

// --- Login endpoint ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  if (!users[username]) {
    users[username] = { password: password || "", chats: {} }; // create new user
  }

  const sessionId = generateSessionId();
  sessions[sessionId] = username;

  res.json({ sessionId, username });
});

// --- Logout endpoint ---
app.post("/api/logout", (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && sessions[sessionId]) {
    delete sessions[sessionId];
  }
  res.json({ success: true });
});

// --- Middleware to check session ---
const requireAuth = (req, res, next) => {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId || !sessions[sessionId]) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.username = sessions[sessionId];
  next();
};

// --- Get messages for a chat ---
app.get("/api/messages/:chat", requireAuth, (req, res) => {
  const { chat } = req.params;
  const username = req.username;

  const userData = users[username];
  const chatMessages = userData.chats[chat] || [];
  res.json(chatMessages);
});

// --- Add a new message to a chat ---
app.post("/api/messages/:chat", requireAuth, (req, res) => {
  const { chat } = req.params;
  const { encrypted, otp } = req.body;
  const username = req.username;

  if (!encrypted || !otp) return res.status(400).json({ error: "Missing data" });

  const userData = users[username];
  if (!userData.chats[chat]) userData.chats[chat] = [];
  userData.chats[chat].push({ encrypted, otp });

  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
