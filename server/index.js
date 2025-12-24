const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
const Document = require("./models/Document.js");
const DocumentVersion = require('./models/DocumentVersion');
const getVersion = require("./routes/getversion.js");
const cookieParser = require("cookie-parser");
const roomRoutes = require("./routes/roomRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Enhanced Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Track users, code, and chat history per room
const roomUsers = {};
const roomCodeMap = {};
const roomSaveTimers = {};
const roomChatHistory = {}; // ✅ NEW: Store chat messages per room

app.locals.roomCodeMap = roomCodeMap;
app.locals.io = io;

// ✅ Cleanup function to remove existing nulls
function cleanupRoomUsers() {
  console.log("🧹 Cleaning up room users...");
  for (const roomId in roomUsers) {
    const initialLength = roomUsers[roomId].length;
    
    // ✅ Remove null/undefined users
    roomUsers[roomId] = roomUsers[roomId].filter(
      user => user && user.socketId && user.username
    );
    
    // If room is now empty, delete it
    if (roomUsers[roomId].length === 0) {
      console.log(`🗑️ Removing empty room: ${roomId}`);
      delete roomUsers[roomId];
      delete roomCodeMap[roomId];
      delete roomChatHistory[roomId]; // ✅ NEW: Clear chat history
      if (roomSaveTimers[roomId]) {
        clearTimeout(roomSaveTimers[roomId]);
        delete roomSaveTimers[roomId];
      }
    } else if (roomUsers[roomId].length !== initialLength) {
      // Update users in room if list changed
      const validUsers = roomUsers[roomId]
        .filter(user => user && user.username)
        .map(user => user.username);
      console.log(`📋 Updated users in room ${roomId}:`, validUsers);
      io.to(roomId).emit("ROOM_USERS", { users: validUsers });
    }
  }
}

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  // ✅ JOIN_ROOM handler - FIXED to accept username directly
  socket.on("JOIN_ROOM", async ({ roomId, username }) => {
    try {
      socket.join(roomId);
      socket.username = username; // ✅ FIX: Set username directly from parameter
      socket.roomId = roomId;
      console.log(`👤 ${username} joined room ${roomId} with socket ${socket.id}`);

      // Initialize room if needed
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
        startVersionSaver(roomId, (rid) => roomCodeMap[rid] || "");
      }

      // ✅ NEW: Initialize chat history for room
      if (!roomChatHistory[roomId]) {
        roomChatHistory[roomId] = [];
      }

      // ✅ Check for existing user to prevent duplicates
      const existingUserIndex = roomUsers[roomId].findIndex(
        user => user && user.username === username
      );
      
      if (existingUserIndex !== -1) {
        // Update existing user's socket ID
        roomUsers[roomId][existingUserIndex].socketId = socket.id;
      } else {
        // Add new user
        roomUsers[roomId].push({ socketId: socket.id, username });
      }

      // Load existing code
      if (roomCodeMap[roomId]) {
        socket.emit("LOAD_CODE", roomCodeMap[roomId]);
      } else {
        try {
          const existingDoc = await Document.findOne({ roomId });
          const code = existingDoc?.code || "";
          roomCodeMap[roomId] = code;
          socket.emit("LOAD_CODE", code);
        } catch (err) {
          console.error("Error fetching code for JOIN:", err);
          socket.emit("LOAD_CODE", "");
        }
      }

      // ✅ NEW: Send chat history to newly joined user
      socket.emit("CHAT_HISTORY", roomChatHistory[roomId]);
      console.log(`📜 Sent ${roomChatHistory[roomId].length} messages to ${username}`);

      // ✅ Send clean, filtered user list
      const validUsers = roomUsers[roomId]
        .filter(user => user && user.username && user.socketId)
        .map(user => user.username);
      console.log(`📋 Sending user list for room ${roomId}:`, validUsers);
      io.to(roomId).emit("ROOM_USERS", {
        users: validUsers
      });

      socket.emit("JOINED_ROOM");
    } catch (error) {
      console.error("❌ Error in JOIN_ROOM:", error);
      socket.emit("JOIN_ERROR", { message: "Failed to join room" });
    }
  });

  // ✅ GET_ROOM_USERS handler
  socket.on("GET_ROOM_USERS", ({ roomId }) => {
    try {
      if (roomUsers[roomId]) {
        const validUsers = roomUsers[roomId]
          .filter(user => user && user.username && user.socketId)
          .map(user => user.username);
        socket.emit("ROOM_USERS", {
          users: validUsers
        });
      } else {
        socket.emit("ROOM_USERS", { users: [] });
      }
    } catch (error) {
      console.error("❌ Error in GET_ROOM_USERS:", error);
      socket.emit("ROOM_USERS", { users: [] });
    }
  });

  // ✅ CHAT_MESSAGE handler - REFACTORED with history storage
  socket.on("CHAT_MESSAGE", ({ roomId, text }) => {
    try {
      if (!text || !text.trim()) return;
      
      const msg = {
        id: Date.now().toString(),
        sender: socket.username || "Anonymous", // ✅ Now correctly gets username
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString(),
      };
      
      // ✅ NEW: Store message in room history
      if (!roomChatHistory[roomId]) {
        roomChatHistory[roomId] = [];
      }
      roomChatHistory[roomId].push(msg);
      
      // ✅ NEW: Limit history to last 100 messages to prevent memory issues
      if (roomChatHistory[roomId].length > 100) {
        roomChatHistory[roomId].shift();
      }
      
      // Broadcast to all users in room
      io.to(roomId).emit("CHAT_MESSAGE", msg);
      console.log(`💬 Chat message in room ${roomId} from ${msg.sender}: ${msg.text}`);
    } catch (error) {
      console.error("❌ Error in CHAT_MESSAGE:", error);
    }
  });

  // ✅ GET_DOCUMENT handler
  socket.on("GET_DOCUMENT", async ({ roomId }) => {
    try {
      const document = await Document.findOne({ roomId });
      socket.emit("LOAD_DOCUMENT", {
        code: document?.code || "",
      });
    } catch (err) {
      console.error("❌ Error loading document:", err.message);
      socket.emit("LOAD_DOCUMENT", { code: "" });
    }
  });

  // ✅ CODE_CHANGE handler
  socket.on("CODE_CHANGE", async ({ roomId, code }) => {
    try {
      if (!code || code.trim() === "") return;
      
      roomCodeMap[roomId] = code;
      socket.to(roomId).emit("CODE_CHANGE", { code });

      // Debounced save
      if (roomSaveTimers[roomId]) {
        clearTimeout(roomSaveTimers[roomId]);
      }

      roomSaveTimers[roomId] = setTimeout(async () => {
        try {
          await Document.findOneAndUpdate(
            { roomId },
            { $set: { code, updatedAt: new Date() } },
            { upsert: true }
          );
          console.log(`💾 Code auto-saved for room: ${roomId}`);
        } catch (err) {
          console.error("❌ Failed to save code:", err.message);
        }
        roomSaveTimers[roomId] = null;
      }, 10000);
    } catch (error) {
      console.error("❌ Error in CODE_CHANGE:", error);
    }
  });

  // ✅ LEAVE_ROOM handler - OPTIONAL but recommended
  socket.on("LEAVE_ROOM", ({ roomId, userId }) => {
    try {
      console.log(`👋 User leaving room: ${roomId}`);
      socket.leave(roomId);
      handleUserDisconnect(socket);
    } catch (error) {
      console.error("❌ Error in LEAVE_ROOM:", error);
    }
  });

  // ✅ DISCONNECT handler - Fixed to prevent null accumulation
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    handleUserDisconnect(socket);
  });
});

// ✅ NEW: Extract disconnect logic into reusable function
function handleUserDisconnect(socket) {
  try {
    for (const roomId in roomUsers) {
      const initialLength = roomUsers[roomId].length;
      
      // ✅ Filter out the disconnected user and any nulls
      roomUsers[roomId] = roomUsers[roomId].filter(
        (user) => user && user.socketId && user.socketId !== socket.id
      );

      // If user was removed from this room
      if (roomUsers[roomId].length < initialLength) {
        console.log(`👋 User left room ${roomId}. Remaining: ${roomUsers[roomId].length}`);
        
        if (roomUsers[roomId].length === 0) {
          // Last user left - clean up room completely
          console.log(`🗑️ Cleaning up empty room: ${roomId}`);
          delete roomUsers[roomId];
          delete roomCodeMap[roomId];
          delete roomChatHistory[roomId]; // ✅ NEW: Clear chat history
          if (roomSaveTimers[roomId]) {
            clearTimeout(roomSaveTimers[roomId]);
            delete roomSaveTimers[roomId];
          }
        } else {
          // ✅ Send updated user list with double filtering
          const validUsers = roomUsers[roomId]
            .filter(user => user && user.username && user.socketId)
            .map(user => user.username);
          console.log(`📋 Updated user list for room ${roomId}:`, validUsers);
          io.to(roomId).emit("ROOM_USERS", {
            users: validUsers
          });
        }
        break; // User can only be in one room
      }
    }
  } catch (error) {
    console.error("❌ Error in disconnect handler:", error);
  }
}

// ✅ Enhanced version saver function
function startVersionSaver(roomId, getCurrentCodeFn) {
  const versionInterval = setInterval(async () => {
    try {
      const code = getCurrentCodeFn(roomId);
      if (code && code.trim() && roomUsers[roomId] && roomUsers[roomId].length > 0) {
        await DocumentVersion.create({ roomId, code });
        console.log(`📚 Version saved for room ${roomId}`);
      } else if (!roomUsers[roomId] || roomUsers[roomId].length === 0) {
        // Stop version saving if room is empty
        console.log(`⏹️ Stopping version saver for empty room: ${roomId}`);
        clearInterval(versionInterval);
      }
    } catch (err) {
      console.error(`❌ Failed to save version for room ${roomId}:`, err);
    }
  }, 5 * 60 * 1000); // 5 minutes
  return versionInterval;
}

// ✅ Clean up existing data on server start
cleanupRoomUsers();

// ✅ Optional: Run periodic cleanup every 10 minutes
setInterval(cleanupRoomUsers, 10 * 60 * 1000);

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ✅ Routes
app.options(/.*/, cors());
app.use("/api/auth", authRoutes);
app.use('/api/versions', getVersion);
app.use("/api/rooms", roomRoutes);

// ✅ Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🧹 Room cleanup scheduled every 10 minutes`);
  console.log(`💬 Chat history enabled with 100 message limit per room`);
});
