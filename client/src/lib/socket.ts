// lib/socket.ts
import io from "socket.io-client";
import type { Socket as ClientSocket } from "socket.io-client";
import { SERVER_URL } from "@/utils/config";

const socket: ReturnType<typeof io> = io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000", {
  transports: ['websocket', 'polling'],
  autoConnect: false, // ✅ Keep this false like the original
  timeout: 20000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Global debug logging
socket.on('connect', () => {
  console.log('🔌 Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('🔌 Socket connection error:', error);
});

export default socket;
