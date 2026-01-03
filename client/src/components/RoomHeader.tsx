'use client';

import { useParams } from 'next/navigation';
import Navbar from './Navbar';

interface User {
  id: string;
  name: string;
  isYou?: boolean;
}

interface RoomHeaderProps {
  onlineUsers?: User[];
  username?: string;
  onShowHistory?: () => void;
  onShowWhiteboard?: () => void;
}

export default function RoomHeader({ onlineUsers = [], username, onShowHistory, onShowWhiteboard }: RoomHeaderProps) {
  const params = useParams();
  const roomId = params?.roomId as string;

  return (
    <div>
      <Navbar
        onlineUsers={onlineUsers}
        roomId={roomId}
        username={username}
        onShowHistory={onShowHistory}
        onShowWhiteboard={onShowWhiteboard}
      />
    </div>
  );
}

