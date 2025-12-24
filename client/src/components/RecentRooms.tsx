'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { Calendar, Users, Loader2, ArrowRight } from 'lucide-react';
import { SERVER_URL } from '@/utils/config';
interface Room {
  _id: string;
  name: string;
  description: string;
  roomId: string;
  joinedAt: string;
}

interface RecentRoomsProps {
  onRoomCountChange?: (count: number) => void;
}

export default function RecentRooms({ onRoomCountChange }: RecentRoomsProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  

  useEffect(() => {
    const fetchRecentRooms = async () => {
      if (!user?.id) {
        setLoading(false);
        onRoomCountChange?.(0);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
       const response = await fetch(`${SERVER_URL}/api/rooms/recent/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }

        const data = await response.json();
        setRooms(data);
        onRoomCountChange?.(data.length);
      } catch (err) {
        console.error('Error fetching recent rooms:', err);
        setError('Failed to load rooms');
        onRoomCountChange?.(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentRooms();
  }, [user?.id, onRoomCountChange]);

  const handleRoomClick = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
        <p className="text-gray-500 mb-6">
          Create or join a room to start collaborating with your team
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => (
        <div
          key={room._id}
          onClick={() => handleRoomClick(room.roomId)}
          className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group bg-white"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {room.name}
              </h4>
              {room.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {room.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(room.joinedAt)}
                </span>
                <span className="font-mono">
                  {room.roomId.substring(0, 8)}
                </span>
              </div>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
