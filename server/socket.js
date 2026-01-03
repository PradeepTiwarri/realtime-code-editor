// socket.js
const { Server } = require("socket.io");
const Document = require("./models/Document.js");
const DocumentVersion = require('./models/DocumentVersion');

const roomUsers = {};
const roomCodeMap = {};
const roomSaveTimers = {};
const roomChatHistory = {};
const roomVoiceUsers = {}; // Track users in voice chat: { roomId: [{ socketId, username }] }
const roomWhiteboardUsers = {}; // Track users viewing whiteboard: { roomId: [username] }
const roomWhiteboardData = {}; // Store whiteboard elements: { roomId: elements[] }

function startVersionSaver(roomId, getCurrentCodeFn) {
  const versionInterval = setInterval(async () => {
    try {
      const code = getCurrentCodeFn(roomId);
      if (code && code.trim() && roomUsers[roomId] && roomUsers[roomId].length > 0) {
        await DocumentVersion.create({ roomId, code });
        console.log(`📚 Version saved for room ${roomId}`);
      } else if (!roomUsers[roomId] || roomUsers[roomId].length === 0) {
        clearInterval(versionInterval);
      }
    } catch (err) {
      console.error(`❌ Version save error:`, err);
    }
  }, 5 * 60 * 1000);
  return versionInterval;
}

const initSocket = (server) => {
  // Allowed origins for Socket.io CORS
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    },
    transports: ['websocket', 'polling'],
  });

  function handleUserDisconnect(socket) {
    // Clean up voice chat
    for (const roomId in roomVoiceUsers) {
      const voiceUser = roomVoiceUsers[roomId]?.find(u => u.socketId === socket.id);
      if (voiceUser) {
        roomVoiceUsers[roomId] = roomVoiceUsers[roomId].filter(u => u.socketId !== socket.id);
        io.to(roomId).emit("VOICE_USER_LEFT", {
          roomId,
          username: voiceUser.username
        });
        io.to(roomId).emit("VOICE_USERS", {
          users: roomVoiceUsers[roomId].map(u => u.username)
        });
        if (roomVoiceUsers[roomId].length === 0) {
          delete roomVoiceUsers[roomId];
        }
      }
    }

    // Clean up room users
    for (const roomId in roomUsers) {
      const initialLength = roomUsers[roomId].length;
      roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);

      if (roomUsers[roomId].length < initialLength) {
        if (roomUsers[roomId].length === 0) {
          delete roomUsers[roomId];
          delete roomCodeMap[roomId];
          delete roomChatHistory[roomId];
        } else {
          const validUsers = roomUsers[roomId].map(u => u.username);
          io.to(roomId).emit("ROOM_USERS", { users: validUsers });
        }
        break;
      }
    }
  }

  io.on("connection", (socket) => {
    socket.on("JOIN_ROOM", async ({ roomId, username }) => {
      try {
        socket.join(roomId);
        socket.username = username;
        socket.roomId = roomId;

        if (!roomUsers[roomId]) {
          roomUsers[roomId] = [];
          startVersionSaver(roomId, (rid) => roomCodeMap[rid] || "");
        }
        if (!roomChatHistory[roomId]) roomChatHistory[roomId] = [];

        // 1. Prioritize memory then fallback to DB
        let currentCode = "";
        if (roomCodeMap[roomId] !== undefined) {
          currentCode = roomCodeMap[roomId];
        } else {
          const doc = await Document.findOne({ roomId });
          currentCode = doc?.code || "";
          roomCodeMap[roomId] = currentCode;
        }

        // 2. ✅ EMIT Unified Event
        socket.emit("LOAD_CODE", currentCode);
        socket.emit("CHAT_HISTORY", roomChatHistory[roomId]);

        // 3. Update User Tracking
        const exists = roomUsers[roomId].findIndex(u => u.username === username);
        if (exists !== -1) roomUsers[roomId][exists].socketId = socket.id;
        else roomUsers[roomId].push({ socketId: socket.id, username });

        io.to(roomId).emit("ROOM_USERS", { users: roomUsers[roomId].map(u => u.username) });
      } catch (err) { console.error(err); }
    });

    // ✅ Match the Frontend request and use unified 'LOAD_CODE'
    socket.on("GET_DOCUMENT", async ({ roomId }) => {
      const code = roomCodeMap[roomId] || (await Document.findOne({ roomId }))?.code || "";
      socket.emit("LOAD_CODE", code);
    });

    socket.on("CODE_CHANGE", ({ roomId, code }) => {
      roomCodeMap[roomId] = code;
      socket.to(roomId).emit("CODE_CHANGE", { code });

      if (roomSaveTimers[roomId]) clearTimeout(roomSaveTimers[roomId]);
      roomSaveTimers[roomId] = setTimeout(async () => {
        await Document.findOneAndUpdate({ roomId }, { $set: { code } }, { upsert: true });
        roomSaveTimers[roomId] = null;
      }, 10000); // 10s auto-save
    });

    socket.on("CHAT_MESSAGE", ({ roomId, text }) => {
      if (!text?.trim()) return;
      const msg = {
        id: Date.now().toString(),
        sender: socket.username || "Anonymous",
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString(),
      };
      roomChatHistory[roomId].push(msg);
      if (roomChatHistory[roomId].length > 100) roomChatHistory[roomId].shift();
      io.to(roomId).emit("CHAT_MESSAGE", msg);
    });

    // ==================== VOICE CHAT SIGNALING ====================

    // User joins voice chat
    socket.on("VOICE_JOIN", ({ roomId }) => {
      console.log(`🎤 ${socket.username} joining voice in room ${roomId}`);

      if (!roomVoiceUsers[roomId]) {
        roomVoiceUsers[roomId] = [];
      }

      // Check if already in voice
      const exists = roomVoiceUsers[roomId].find(u => u.socketId === socket.id);
      if (!exists) {
        roomVoiceUsers[roomId].push({
          socketId: socket.id,
          username: socket.username,
          isMuted: false
        });
      }

      // Get list of other voice users (for the joining user to connect to)
      const otherVoiceUsers = roomVoiceUsers[roomId]
        .filter(u => u.socketId !== socket.id)
        .map(u => ({ socketId: u.socketId, username: u.username, isMuted: u.isMuted }));

      // Send existing voice users to the joining user
      socket.emit("VOICE_USERS_LIST", { users: otherVoiceUsers });

      // Notify others that a new user joined voice
      socket.to(roomId).emit("VOICE_USER_JOINED", {
        socketId: socket.id,
        username: socket.username
      });

      // Broadcast updated voice users list
      io.to(roomId).emit("VOICE_USERS", {
        users: roomVoiceUsers[roomId].map(u => ({
          username: u.username,
          isMuted: u.isMuted
        }))
      });
    });

    // User leaves voice chat
    socket.on("VOICE_LEAVE", ({ roomId }) => {
      console.log(`🎤 ${socket.username} leaving voice in room ${roomId}`);

      if (roomVoiceUsers[roomId]) {
        roomVoiceUsers[roomId] = roomVoiceUsers[roomId].filter(u => u.socketId !== socket.id);

        socket.to(roomId).emit("VOICE_USER_LEFT", {
          socketId: socket.id,
          username: socket.username
        });

        io.to(roomId).emit("VOICE_USERS", {
          users: roomVoiceUsers[roomId].map(u => ({
            username: u.username,
            isMuted: u.isMuted
          }))
        });

        if (roomVoiceUsers[roomId].length === 0) {
          delete roomVoiceUsers[roomId];
        }
      }
    });

    // Forward WebRTC offer to specific peer
    socket.on("VOICE_OFFER", ({ to, offer }) => {
      console.log(`📡 Forwarding offer from ${socket.id} to ${to}`);
      io.to(to).emit("VOICE_OFFER", {
        from: socket.id,
        offer,
        username: socket.username
      });
    });

    // Forward WebRTC answer to specific peer
    socket.on("VOICE_ANSWER", ({ to, answer }) => {
      console.log(`📡 Forwarding answer from ${socket.id} to ${to}`);
      io.to(to).emit("VOICE_ANSWER", {
        from: socket.id,
        answer
      });
    });

    // Forward ICE candidate to specific peer
    socket.on("ICE_CANDIDATE", ({ to, candidate }) => {
      io.to(to).emit("ICE_CANDIDATE", {
        from: socket.id,
        candidate
      });
    });

    // Handle mute/unmute toggle
    socket.on("VOICE_TOGGLE_MUTE", ({ roomId, isMuted }) => {
      if (roomVoiceUsers[roomId]) {
        const user = roomVoiceUsers[roomId].find(u => u.socketId === socket.id);
        if (user) {
          user.isMuted = isMuted;
          io.to(roomId).emit("VOICE_USER_MUTE_CHANGED", {
            username: socket.username,
            isMuted
          });
        }
      }
    });

    // ==================== END VOICE CHAT ====================

    // ==================== WHITEBOARD EVENTS ====================

    // User joins whiteboard
    socket.on("WHITEBOARD_JOIN", ({ roomId, username }) => {
      if (!roomWhiteboardUsers[roomId]) {
        roomWhiteboardUsers[roomId] = [];
      }
      if (!roomWhiteboardUsers[roomId].includes(username)) {
        roomWhiteboardUsers[roomId].push(username);
      }

      // Send current whiteboard state to joining user
      if (roomWhiteboardData[roomId] && roomWhiteboardData[roomId].length > 0) {
        socket.emit("WHITEBOARD_INIT", {
          records: roomWhiteboardData[roomId]
        });
      }

      // Broadcast updated user list
      io.to(roomId).emit("WHITEBOARD_USERS", {
        users: roomWhiteboardUsers[roomId]
      });

      console.log(`🎨 ${username} joined whiteboard in room ${roomId}`);
    });

    // User leaves whiteboard
    socket.on("WHITEBOARD_LEAVE", ({ roomId }) => {
      if (roomWhiteboardUsers[roomId]) {
        roomWhiteboardUsers[roomId] = roomWhiteboardUsers[roomId].filter(
          u => u !== socket.username
        );

        io.to(roomId).emit("WHITEBOARD_USERS", {
          users: roomWhiteboardUsers[roomId]
        });

        // Clean up if no users
        if (roomWhiteboardUsers[roomId].length === 0) {
          delete roomWhiteboardUsers[roomId];
          // Keep whiteboard data for a while in case users rejoin
        }
      }
      console.log(`🎨 ${socket.username} left whiteboard in room ${roomId}`);
    });

    // Whiteboard update from user (records-based for tldraw)
    socket.on("WHITEBOARD_UPDATE", ({ roomId, records, username }) => {
      // Initialize records array if needed
      if (!roomWhiteboardData[roomId]) {
        roomWhiteboardData[roomId] = [];
      }

      // Merge records - update existing or add new
      if (records && Array.isArray(records)) {
        for (const record of records) {
          if (record.deleted) {
            // Remove deleted records
            roomWhiteboardData[roomId] = roomWhiteboardData[roomId].filter(
              r => r.id !== record.id
            );
          } else {
            // Update or add record
            const existingIndex = roomWhiteboardData[roomId].findIndex(
              r => r.id === record.id
            );
            if (existingIndex >= 0) {
              roomWhiteboardData[roomId][existingIndex] = record;
            } else {
              roomWhiteboardData[roomId].push(record);
            }
          }
        }
      }

      // Broadcast to other users in the room
      socket.to(roomId).emit("WHITEBOARD_UPDATE", {
        records,
        senderUsername: username
      });
    });

    // ==================== END WHITEBOARD ====================

    socket.on("disconnect", () => handleUserDisconnect(socket));
  });

  return io;
};

module.exports = { initSocket };