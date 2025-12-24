'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JoinRoomModal from './JoinRoomModal';
import { useUserStore } from '@/stores/userStore';

type Props = {
  /** Extra Tailwind classes supplied by the parent card */
  className?: string;
};

export default function JoinRoomButton({ className = '' }: Props): React.JSX.Element {
  const user = useUserStore((s) => s.user);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleJoin = async (roomId: string): Promise<void> => {
    try {
      await fetch('http://localhost:5000/api/rooms/join', {
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
        type="button"
        onClick={() => setShowModal(true)}
        className={`
          rounded-lg bg-blue-600 text-white font-medium
          hover:bg-blue-700 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        Join Room
      </button>

      {showModal && (
        <JoinRoomModal onClose={() => setShowModal(false)} onJoin={handleJoin} />
      )}
    </>
  );
}
