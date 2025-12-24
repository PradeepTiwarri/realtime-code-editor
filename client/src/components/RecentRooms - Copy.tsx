'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Room {
  id: string;
  name: string;
  lastAccessed: string;
  isActive?: boolean;
  avatar: string;
}

export default function RecentRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    // Mock data with more rooms to demonstrate scrolling
    setRooms([
      {
        id: 'room-02',
        name: 'room 02',
        lastAccessed: 'Yesterday',
        isActive: true,
        avatar: 'R'
      },
      {
        id: 'room-01',
        name: 'room 01',
        lastAccessed: 'Yesterday',
        isActive: false,
        avatar: 'R'
      },
      {
        id: 'kki',
        name: 'kki',
        lastAccessed: 'Yesterday',
        isActive: false,
        avatar: 'K'
      },
      {
        id: 'jdjd',
        name: 'jdjd',
        lastAccessed: '2 days ago',
        isActive: false,
        avatar: 'J'
      },
      {
        id: 'project-alpha',
        name: 'project-alpha',
        lastAccessed: '3 days ago',
        isActive: false,
        avatar: 'P'
      },
      {
        id: 'team-beta',
        name: 'team-beta',
        lastAccessed: '1 week ago',
        isActive: false,
        avatar: 'T'
      },
      {
        id: 'dev-session',
        name: 'dev-session',
        lastAccessed: '1 week ago',
        isActive: false,
        avatar: 'D'
      },
      {
        id: 'code-review',
        name: 'code-review',
        lastAccessed: '2 weeks ago',
        isActive: false,
        avatar: 'C'
      }
    ]);
  }, []);

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent rooms found.</p>
      </div>
    );
  }

  return (
    <div 
      className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide"
      style={{
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none'  /* Internet Explorer 10+ */
      }}
    >
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={`/room/${room.id}`}
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            {/* Room Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
              {room.avatar}
            </div>
            
            {/* Room Info */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{room.name}</h4>
                {room.isActive && (
                  <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{room.lastAccessed}</p>
            </div>
          </div>
          
          {/* Arrow */}
          <div className="text-gray-400 group-hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
