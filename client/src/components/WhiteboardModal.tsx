'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, Users, Maximize2, Minimize2 } from 'lucide-react';
import socket from '@/lib/socket';

// Dynamic import for Excalidraw (it doesn't work well with SSR)
import dynamic from 'next/dynamic';

const Excalidraw = dynamic(
    async () => (await import('@excalidraw/excalidraw')).Excalidraw,
    { ssr: false }
);

interface WhiteboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string;
    username: string;
}

interface ExcalidrawElement {
    id: string;
    type: string;
    [key: string]: unknown;
}

interface AppState {
    [key: string]: unknown;
}

export default function WhiteboardModal({ isOpen, onClose, roomId, username }: WhiteboardModalProps) {
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const excalidrawRef = useRef<any>(null);
    const isRemoteUpdate = useRef(false);

    // Handle receiving whiteboard updates from other users
    useEffect(() => {
        if (!isOpen || !roomId) return;

        // Join whiteboard room
        socket.emit('WHITEBOARD_JOIN', { roomId, username });

        // Handle receiving whiteboard data
        const handleWhiteboardData = ({ elements, appState }: { elements: ExcalidrawElement[], appState: AppState }) => {
            if (excalidrawRef.current) {
                isRemoteUpdate.current = true;
                excalidrawRef.current.updateScene({ elements });
                setTimeout(() => {
                    isRemoteUpdate.current = false;
                }, 100);
            }
        };

        // Handle initial whiteboard state
        const handleWhiteboardInit = ({ elements }: { elements: ExcalidrawElement[] }) => {
            if (excalidrawRef.current && elements?.length > 0) {
                isRemoteUpdate.current = true;
                excalidrawRef.current.updateScene({ elements });
                setTimeout(() => {
                    isRemoteUpdate.current = false;
                }, 100);
            }
        };

        // Handle collaborators list
        const handleWhiteboardUsers = ({ users }: { users: string[] }) => {
            setCollaborators(users);
        };

        socket.on('WHITEBOARD_UPDATE', handleWhiteboardData);
        socket.on('WHITEBOARD_INIT', handleWhiteboardInit);
        socket.on('WHITEBOARD_USERS', handleWhiteboardUsers);

        return () => {
            socket.emit('WHITEBOARD_LEAVE', { roomId });
            socket.off('WHITEBOARD_UPDATE', handleWhiteboardData);
            socket.off('WHITEBOARD_INIT', handleWhiteboardInit);
            socket.off('WHITEBOARD_USERS', handleWhiteboardUsers);
        };
    }, [isOpen, roomId, username]);

    // Handle local changes - using any to avoid complex Excalidraw type issues
    const handleChange = useCallback((elements: readonly any[], appState: any, files: any) => {
        if (isRemoteUpdate.current) return;

        // Debounce and send to server
        socket.emit('WHITEBOARD_UPDATE', {
            roomId,
            elements: [...elements], // Convert readonly to regular array
            username
        });
    }, [roomId, username]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <div
                className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all ${isFullscreen
                    ? 'w-full h-full rounded-none'
                    : 'w-full max-w-6xl h-[90vh]'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg sm:text-xl font-bold text-white">🎨 Whiteboard</h2>
                        <div className="hidden sm:flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-white">{collaborators.length} collaborating</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Collaborators - Mobile */}
                        <div className="sm:hidden flex items-center gap-1 bg-slate-700 px-2 py-1 rounded-full">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-white">{collaborators.length}</span>
                        </div>

                        {/* Fullscreen toggle */}
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-300 hover:text-white"
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-300 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Excalidraw Canvas */}
                <div className="flex-1 bg-white">
                    <Excalidraw
                        excalidrawAPI={(api: any) => { excalidrawRef.current = api; }}
                        onChange={handleChange}
                        theme="light"
                        UIOptions={{
                            canvasActions: {
                                loadScene: false,
                                saveToActiveFile: false,
                            },
                        }}
                        initialData={{
                            appState: {
                                viewBackgroundColor: '#ffffff',
                            },
                        }}
                    />
                </div>

                {/* Collaborators footer - visible on mobile */}
                {collaborators.length > 0 && (
                    <div className="sm:hidden px-4 py-2 bg-slate-800 border-t border-slate-700">
                        <div className="flex items-center gap-2 overflow-x-auto">
                            <span className="text-xs text-gray-400 whitespace-nowrap">Drawing with:</span>
                            {collaborators.slice(0, 5).map((user, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 bg-slate-700 text-white text-xs rounded-full whitespace-nowrap"
                                >
                                    {user}
                                </span>
                            ))}
                            {collaborators.length > 5 && (
                                <span className="text-xs text-gray-400">+{collaborators.length - 5} more</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
