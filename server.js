// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins (you can restrict to Vercel frontend later)
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Temporary message storage
let messages = [];

// API endpoint → fetch chat history
app.get("/messages", (req, res) => {
  res.json(messages);
});

// socket.io realtime chat
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join", (username) => {
    console.log(`👤 ${username} joined`);
    socket.username = username;
    io.emit("newMessage", {
      user: "System",
      text: `${username} joined the chat`
    });
  });

  socket.on("sendMessage", (msg) => {
    const message = {
      user: socket.username || "Anonymous",
      text: msg
    };
    messages.push(message);
    io.emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("newMessage", {
        user: "System",
        text: `${socket.username} left the chat`
      });
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
