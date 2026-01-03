// index.js
const express = require("express");
const http = require("http");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { initSocket } = require("./socket");

// Routes
const authRoutes = require("./routes/authRoutes");
const getVersion = require("./routes/getversion.js");
const roomRoutes = require("./routes/roomRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS (both local and production)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

// App Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for development flexibility
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/versions', getVersion);
app.use("/api/rooms", roomRoutes);

// Initialize Socket.io
const io = initSocket(server);
app.locals.io = io; // Used by some routes internally

// Graceful Shutdown
const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});