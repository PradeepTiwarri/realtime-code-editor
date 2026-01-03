// components/VoiceChat.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff, ChevronDown, Loader2, Volume2 } from 'lucide-react';
import { useVoiceChat } from '@/hooks/useVoiceChat';

interface VoiceChatProps {
    roomId: string;
    username: string;
}

export default function VoiceChat({ roomId, username }: VoiceChatProps) {
    const {
        isInVoice,
        isMuted,
        voiceUsers,
        isConnecting,
        error,
        joinVoice,
        leaveVoice,
        toggleMute
    } = useVoiceChat({ roomId, username });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get button styles based on state
    const getButtonStyles = () => {
        if (isConnecting) {
            return 'bg-yellow-600 hover:bg-yellow-500';
        }
        if (isInVoice) {
            if (isMuted) {
                return 'bg-red-600 hover:bg-red-500';
            }
            return 'bg-emerald-600 hover:bg-emerald-500';
        }
        return 'bg-slate-700 hover:bg-slate-600';
    };

    // Get icon based on state
    const getIcon = () => {
        if (isConnecting) {
            return <Loader2 className="w-5 h-5 animate-spin" />;
        }
        if (isInVoice) {
            if (isMuted) {
                return <MicOff className="w-5 h-5" />;
            }
            return <Mic className="w-5 h-5" />;
        }
        return <Phone className="w-5 h-5" />;
    };

    // Get button text
    const getButtonText = () => {
        if (isConnecting) return 'Connecting...';
        if (isInVoice) {
            return `Voice (${voiceUsers.length})`;
        }
        return 'Voice';
    };

    const handleMainButtonClick = () => {
        if (isConnecting) return;

        if (isInVoice) {
            setIsDropdownOpen(!isDropdownOpen);
        } else {
            joinVoice();
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Main Voice Button */}
            <button
                onClick={handleMainButtonClick}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all ${getButtonStyles()}`}
                disabled={isConnecting}
            >
                {getIcon()}
                <span className="font-medium">{getButtonText()}</span>
                {isInVoice && !isConnecting && (
                    <ChevronDown
                        className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                )}

                {/* Pulse animation when in voice and not muted */}
                {isInVoice && !isMuted && !isConnecting && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && isInVoice && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-700 border border-slate-600 rounded-lg shadow-2xl overflow-hidden z-50">
                    {/* Header */}
                    <div className="p-3 border-b border-slate-600 bg-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Volume2 className="w-4 h-4 text-emerald-400" />
                                <p className="text-sm font-semibold text-white">Voice Chat</p>
                            </div>
                            <span className="text-xs text-emerald-400 bg-emerald-400/20 px-2 py-1 rounded-full">
                                {voiceUsers.length} {voiceUsers.length === 1 ? 'user' : 'users'}
                            </span>
                        </div>
                    </div>

                    {/* Voice Controls */}
                    <div className="p-3 border-b border-slate-600 flex gap-2">
                        <button
                            onClick={toggleMute}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${isMuted
                                    ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                    : 'bg-slate-600 text-white hover:bg-slate-500'
                                }`}
                        >
                            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            <span className="text-sm font-medium">{isMuted ? 'Unmute' : 'Mute'}</span>
                        </button>

                        <button
                            onClick={() => {
                                leaveVoice();
                                setIsDropdownOpen(false);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                        >
                            <PhoneOff className="w-4 h-4" />
                            <span className="text-sm font-medium">Leave</span>
                        </button>
                    </div>

                    {/* Users in Voice */}
                    <div className="max-h-48 overflow-y-auto">
                        {voiceUsers.length > 0 ? (
                            voiceUsers.map((user, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-3 hover:bg-slate-600 transition-colors flex items-center gap-3"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${user.isMuted ? 'bg-gray-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                        }`}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">
                                            {user.username}
                                            {user.username === username && (
                                                <span className="ml-2 text-xs text-emerald-400">(You)</span>
                                            )}
                                        </p>
                                    </div>
                                    {user.isMuted ? (
                                        <MicOff className="w-4 h-4 text-red-400" />
                                    ) : (
                                        <Mic className="w-4 h-4 text-emerald-400" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-gray-400">
                                No users in voice
                            </div>
                        )}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-3 bg-red-500/20 border-t border-red-500/30">
                            <p className="text-xs text-red-400 text-center">{error}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
