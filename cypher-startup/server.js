import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
const PORT = 3001;

// --- Middleware setup ---
app.use(cors({
  origin: "http://localhost:5173", // your frontend dev server
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "x-session-id"],
  credentials: true
}));
app.use(bodyParser.json());

// --- In-memory storage ---
const users = {};     // { username: { password, chats: { chatName: [{ encrypted, otp }] } } }
const sessions = {};  // { sessionId: username }

// --- Helper: generate random session ID ---
const generateSessionId = () => crypto.randomBytes(16).toString("hex");

// --- Middleware: check if user is logged in ---
const requireAuth = (req, res, next) => {
  const sessionId = req.headers["x-session-id"];

  if (!sessionId) {
    console.warn("⚠️ Missing session ID header");
    return res.status(401).json({ error: "Missing session ID" });
  }

  const username = sessions[sessionId];
  if (!username) {
    console.warn("⚠️ Invalid session ID:", sessionId);
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.username = username;
  next();
};

// --- LOGIN / REGISTER ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || username.trim() === "") {
    return res.status(400).json({ error: "Username required" });
  }

  // Create user if doesn't exist
  if (!users[username]) {
    users[username] = { password: password || "", chats: {} };
    console.log(`🆕 Created new user: ${username}`);
  }

  // Generate new session
  const sessionId = generateSessionId();
  sessions[sessionId] = username;

  console.log(`✅ ${username} logged in with session ${sessionId}`);

  res.json({ sessionId, username });
});

// --- LOGOUT ---
app.post("/api/logout", (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && sessions[sessionId]) {
    const username = sessions[sessionId];
    delete sessions[sessionId];
    console.log(`👋 ${username} logged out`);
  }
  res.json({ success: true });
});

// --- GET MESSAGES ---
app.get("/api/messages/:chat", requireAuth, (req, res) => {
  const { chat } = req.params;
  const username = req.username;

  const userData = users[username];
  const chatMessages = userData.chats[chat] || [];

  console.log(`📨 Fetched ${chatMessages.length} messages for ${username} in chat '${chat}'`);
  res.json(chatMessages);
});

// --- POST MESSAGE ---
app.post("/api/messages/:chat", requireAuth, (req, res) => {
  const { chat } = req.params;
  const { encrypted, otp } = req.body;
  const username = req.username;

  if (!encrypted || !otp) {
    console.warn("⚠️ Missing encrypted or otp in request body");
    return res.status(400).json({ error: "Missing data" });
  }

  const userData = users[username];
  if (!userData.chats[chat]) userData.chats[chat] = [];

  userData.chats[chat].push({ encrypted, otp });

  console.log(`💬 Message stored for ${username} in chat '${chat}'`);
  res.json({ success: true });
});

// --- Server start ---
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
