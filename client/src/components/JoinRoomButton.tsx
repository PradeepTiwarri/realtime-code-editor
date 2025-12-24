'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import JoinRoomModal from './JoinRoomModal';
import { useUserStore } from '@/stores/userStore';
import { Users } from 'lucide-react';
import { SERVER_URL } from '@/utils/config';

interface Props {
  /** Extra Tailwind classes supplied by the parent */
  className?: string;
  /** Optional children to render inside the button */
  children?: ReactNode;
}

export default function JoinRoomButton({ className = '', children }: Props): React.JSX.Element {
  const user = useUserStore((s) => s.user);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

const handleJoin = async (roomId: string): Promise<void> => {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'; // Add this line

    try {
      await fetch(`${SERVER_URL}/api/rooms/join`, { // Updated URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, roomId }),
      });
      router.push(`/room/${roomId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={className || `
          px-6 py-3 rounded-lg bg-blue-600 text-white font-medium
          hover:bg-blue-700 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
        `}
      >
        {children || (
          <>
            <Users className="w-5 h-5" />
            <span>Join Room</span>
          </>
        )}
      </button>

      {showModal && (
        <JoinRoomModal onClose={() => setShowModal(false)} onJoin={handleJoin} />
      )}
    </>
  );
}
