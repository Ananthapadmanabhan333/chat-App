// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

// Enable socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store messages (in memory)
let messages = [];

// REST API → get all messages
app.get("/messages", (req, res) => {
  res.json(messages);
});

// Socket.io → realtime communication
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  // When someone sends a message
  socket.on("sendMessage", (msg) => {
    console.log("📩 Message from", msg.user, ":", msg.text);

    // Add to history
    const newMsg = { user: msg.user, text: msg.text };
    messages.push(newMsg);

    // Broadcast to all users
    io.emit("newMessage", newMsg);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
