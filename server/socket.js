// socket.js
const { Server } = require("socket.io");
const Document = require("./models/Document.js");
const DocumentVersion = require('./models/DocumentVersion');

const roomUsers = {};
const roomCodeMap = {};
const roomSaveTimers = {};
const roomChatHistory = {};

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
  const io = new Server(server, {
    cors: {
origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true },
    transports: ['websocket', 'polling'],
  });

  function handleUserDisconnect(socket) {
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

    socket.on("disconnect", () => handleUserDisconnect(socket));
  });

  return io;
};

module.exports = { initSocket };