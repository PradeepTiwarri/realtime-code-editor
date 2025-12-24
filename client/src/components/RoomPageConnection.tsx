// components/RoomPageConnection.tsx
'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import socket from '@/lib/socket';
import { useUserStore } from '@/stores/userStore';

export default function RoomPageConnection() {
  const params = useParams();
  const roomId = params?.roomId as string;
  const user = useUserStore((state) => state.user);
  const setOnlineUsers = useUserStore((state) => state.setOnlineUsers);

  useEffect(() => {
    if (roomId && user) {
      // ✅ FIX: Backend expects 'username' (lowercase n)
      socket.emit('JOIN_ROOM', { 
        roomId, 
        username: user.fullName 
      });

      // ✅ LISTEN for user list updates from backend
      socket.on("ROOM_USERS", ({ users }: { users: string[] }) => {
        console.log("Updated online users:", users);
        setOnlineUsers(users);
      });

      return () => {
        socket.off("ROOM_USERS"); // Cleanup listener
        socket.emit('LEAVE_ROOM', { roomId });
      };
    }
  }, [roomId, user, setOnlineUsers]);

  return null; // Keep it invisible
}