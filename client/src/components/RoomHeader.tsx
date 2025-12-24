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
  onShowHistory?: () => void;
}

export default function RoomHeader({ onlineUsers = [], onShowHistory }: RoomHeaderProps) {
  const params = useParams();
  const roomId = params?.roomId as string;

  return (
    <div>
      <Navbar 
        onlineUsers={onlineUsers} 
        roomId={roomId}
        onShowHistory={onShowHistory}
      />
    </div>
  );
}
