import { MongoClient } from "mongodb";
import fs from "fs";

const config = JSON.parse(fs.readFileSync(new URL("./dbConfig.json", import.meta.url)));

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db("cypher");

const usersCollection = db.collection("users");
const messagesCollection = db.collection("messages");

// --- Test Connection ---
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log("✅ Connected to MongoDB");
  } catch (ex) {
    console.error(`❌ BBBBBBBBBB Unable to connect to database with ${url}: ${ex.message}`);
    process.exit(1);
  }
})();

// --- User functions ---
export async function getUser(username) {
  return usersCollection.findOne({ username });
}

export async function addUser(user) {
  return usersCollection.insertOne(user);
}

export async function updateUser(username, update) {
  return usersCollection.updateOne({ username }, { $set: update });
}

// --- Message functions ---
export async function addMessage(message) {
  return messagesCollection.insertOne(message);
}

export async function getMessages(username, chat) {
  return messagesCollection.find({ username, chat }).toArray();
}
