import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

import { getUser, addUser, updateUser, addMessage, getMessages } from "./database.js";

const app = express();
const server = http.createServer(app);

// --- Setup __dirname for ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- WebSocket Server ---
const wss = new WebSocketServer({ server });

// Store connected clients: { username → ws }
const connectedUsers = new Map();
console.log("start");
function verifySession(sessionId) {
  return sessions[sessionId] || null;
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data);

      // --- Identify users on connect ---
      if (msg.type === "identify") {
        const username = verifySession(msg.sessionId);

        if (!username || username !== msg.username) {
          console.log("❌ WebSocket authentication failed");
          ws.send(JSON.stringify({ type: "auth_error", error: "Invalid session" }));
          ws.close();
          return;
        }

        ws.username = username;
        ws.sessionId = msg.sessionId;

        connectedUsers.set(username, ws);
        console.log(`🔐 WebSocket authenticated: ${username}`);
        return;
      }

      // --- Incoming chat message (real-time) ---
      if (msg.type === "new_message") {
        const { chat, encrypted, otp, username } = msg;

        // Save to MongoDB
        await addMessage({ chat, encrypted, otp, username });

        // Broadcast to ALL other connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "new_message",
              chat,
              encrypted,
              otp,
              username
            }));
          }
        });

        console.log(`Broadcast message from ${username} → ${chat}`);
      }
    } catch (err) {
      console.error("WebSocket message error:", err);
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      connectedUsers.delete(ws.username);
      console.log(` ${ws.username} disconnected`);
    }
  });
});

// --- Express Middleware ---
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

// --- Require authentication ---
const requireAuth = (req, res, next) => {
  const sessionId = req.headers["x-session-id"];
  if (!sessionId || !sessions[sessionId]) {
    return res.status(401).json({ error: "Unauthorized cuz youre gay" });
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

// --- Send message via REST (fallback) ---
app.post("/api/messages/:chat", requireAuth, async (req, res) => {
  const { chat } = req.params;
  const { encrypted, otp } = req.body;
  const username = req.username;

  if (!encrypted || !otp) return res.status(400).json({ error: "Missing data" });

  await addMessage({ chat, encrypted, otp, username });
  res.json({ success: true });
});

// --- Serve frontend ---
app.use(express.static(path.join(__dirname, "public")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// --- Start server (Express + WebSocket) ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));