import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

import { getUser, addUser, updateUser, addMessage, getMessages } from "./database.js";

const app = express();
// --- Helpers for __dirname in ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://startup.cypherw.click"
  ],
  credentials: true
}));

app.use(bodyParser.json());

// --- In-memory session storage ---
const sessions = {};

// --- Helper to generate session IDs ---
const generateSessionId = () => crypto.randomBytes(16).toString("hex");

// --- Login endpoint ---
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username) return res.status(400).json({ error: "Username required" });

  let user = await getUser(username);

  if (!user) {
    // Create new user if doesn't exist
    await addUser({ username, password: password || "", chats: {} });
    user = await getUser(username);
  } else if (password && user.password !== password) {
    return res.status(401).json({ error: "Incorrect password" });
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
app.get("/api/messages/:chat", requireAuth, async (req, res) => {
  const { chat } = req.params;
  const username = req.username;

  const messages = await getMessages(username, chat);
  res.json(messages);
});

// --- Add a new message to a chat ---
app.post("/api/messages/:chat", requireAuth, async (req, res) => {
  const { chat } = req.params;
  const { encrypted, otp } = req.body;
  const username = req.username;

  if (!encrypted || !otp) return res.status(400).json({ error: "Missing data" });

  await addMessage({ chat, encrypted, otp, username });
  res.json({ success: true });
});

// --- Serve frontend via static middleware ---
app.use(express.static(path.join(__dirname, "public")));

// --- Catch-all for React Router ---
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Start server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
