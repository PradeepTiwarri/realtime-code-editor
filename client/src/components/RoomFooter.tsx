'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoomFooterProps {
  roomId: string;
}

export default function RoomFooter({ roomId }: RoomFooterProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-full px-6 py-3 border-t border-gray-200 bg-white flex justify-between items-center text-sm">
      {/* Left side: Room ID & Copy Button */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-700">Room ID:</span>
        <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
          {roomId}
        </span>
        <Button variant="outline" className='bg-blue-500'  onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-1" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      {/* Right side: Leave Button */}
      <Button className='bg-blue-500' variant="outline"  onClick={handleLeave}>
        <LogOut className="w-4 h-4 mr-1" />
        Leave Room
      </Button>
    </div>
  );
}
