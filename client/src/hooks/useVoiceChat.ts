// hooks/useVoiceChat.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'simple-peer';
import socket from '@/lib/socket';

interface VoiceUser {
    username: string;
    isMuted: boolean;
}

interface PeerConnection {
    peerId: string;
    username: string;
    peer: Peer.Instance;
}

interface UseVoiceChatProps {
    roomId: string;
    username: string;
}

interface UseVoiceChatReturn {
    isInVoice: boolean;
    isMuted: boolean;
    voiceUsers: VoiceUser[];
    isConnecting: boolean;
    error: string | null;
    joinVoice: () => Promise<void>;
    leaveVoice: () => void;
    toggleMute: () => void;
}

export function useVoiceChat({ roomId, username }: UseVoiceChatProps): UseVoiceChatReturn {
    const [isInVoice, setIsInVoice] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [voiceUsers, setVoiceUsers] = useState<VoiceUser[]>([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs to persist across renders
    const localStreamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<Map<string, PeerConnection>>(new Map());
    const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

    // Cleanup function for a single peer
    const cleanupPeer = useCallback((peerId: string) => {
        const peerConn = peersRef.current.get(peerId);
        if (peerConn) {
            peerConn.peer.destroy();
            peersRef.current.delete(peerId);
        }

        const audioEl = audioElementsRef.current.get(peerId);
        if (audioEl) {
            audioEl.srcObject = null;
            audioEl.remove();
            audioElementsRef.current.delete(peerId);
        }
    }, []);

    // Cleanup all peers
    const cleanupAllPeers = useCallback(() => {
        peersRef.current.forEach((_, peerId) => cleanupPeer(peerId));
        peersRef.current.clear();
        audioElementsRef.current.clear();
    }, [cleanupPeer]);

    // Stop local stream
    const stopLocalStream = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
    }, []);

    // Create a new peer connection
    const createPeer = useCallback((
        targetSocketId: string,
        targetUsername: string,
        initiator: boolean,
        stream: MediaStream
    ): Peer.Instance => {
        console.log(`🔗 Creating peer connection to ${targetUsername} (initiator: ${initiator})`);

        const peer = new Peer({
            initiator,
            trickle: true,
            stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                ]
            }
        });

        peer.on('signal', (data) => {
            if (data.type === 'offer') {
                socket.emit('VOICE_OFFER', { to: targetSocketId, offer: data });
            } else if (data.type === 'answer') {
                socket.emit('VOICE_ANSWER', { to: targetSocketId, answer: data });
            } else if ('candidate' in data) {
                // ICE candidate - data has candidate property (type is 'candidate')
                socket.emit('ICE_CANDIDATE', { to: targetSocketId, candidate: data });
            }
        });

        peer.on('stream', (remoteStream) => {
            console.log(`🔊 Received audio stream from ${targetUsername}`);

            // Create audio element to play remote stream
            let audioEl = audioElementsRef.current.get(targetSocketId);
            if (!audioEl) {
                audioEl = document.createElement('audio');
                audioEl.autoplay = true;
                audioEl.id = `audio-${targetSocketId}`;
                document.body.appendChild(audioEl);
                audioElementsRef.current.set(targetSocketId, audioEl);
            }
            audioEl.srcObject = remoteStream;
        });

        peer.on('connect', () => {
            console.log(`✅ Connected to ${targetUsername}`);
        });

        peer.on('error', (err) => {
            console.error(`❌ Peer error with ${targetUsername}:`, err);
            cleanupPeer(targetSocketId);
        });

        peer.on('close', () => {
            console.log(`🔌 Connection closed with ${targetUsername}`);
            cleanupPeer(targetSocketId);
        });

        // Store the peer connection
        peersRef.current.set(targetSocketId, {
            peerId: targetSocketId,
            username: targetUsername,
            peer
        });

        return peer;
    }, [cleanupPeer]);

    // Join voice chat
    const joinVoice = useCallback(async () => {
        if (isInVoice || isConnecting) return;

        setIsConnecting(true);
        setError(null);

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });

            localStreamRef.current = stream;
            setIsInVoice(true);
            setIsConnecting(false);

            // Tell server we're joining voice
            socket.emit('VOICE_JOIN', { roomId });

            console.log('🎤 Joined voice chat');
        } catch (err) {
            console.error('❌ Failed to get microphone access:', err);
            setError('Microphone access denied');
            setIsConnecting(false);
        }
    }, [isInVoice, isConnecting, roomId]);

    // Leave voice chat
    const leaveVoice = useCallback(() => {
        if (!isInVoice) return;

        // Tell server we're leaving
        socket.emit('VOICE_LEAVE', { roomId });

        // Cleanup
        cleanupAllPeers();
        stopLocalStream();

        setIsInVoice(false);
        setIsMuted(false);
        setError(null);

        console.log('🎤 Left voice chat');
    }, [isInVoice, roomId, cleanupAllPeers, stopLocalStream]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        if (!localStreamRef.current) return;

        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
            const newMutedState = !isMuted;
            audioTrack.enabled = !newMutedState;
            setIsMuted(newMutedState);

            // Notify server
            socket.emit('VOICE_TOGGLE_MUTE', { roomId, isMuted: newMutedState });
        }
    }, [isMuted, roomId]);

    // Socket event handlers
    useEffect(() => {
        if (!roomId) return;

        // Receive list of existing voice users when joining
        const handleVoiceUsersList = ({ users }: { users: Array<{ socketId: string; username: string; isMuted: boolean }> }) => {
            if (!localStreamRef.current) return;

            console.log('📋 Existing voice users:', users);

            // Create peer connections to all existing users (as initiator)
            users.forEach(user => {
                if (!peersRef.current.has(user.socketId)) {
                    createPeer(user.socketId, user.username, true, localStreamRef.current!);
                }
            });
        };

        // A new user joined voice - they will initiate connection to us
        const handleVoiceUserJoined = ({ socketId, username }: { socketId: string; username: string }) => {
            console.log(`👋 ${username} joined voice chat`);
            // Don't create peer here - the joining user will initiate
        };

        // Receive offer from another peer
        const handleVoiceOffer = ({ from, offer, username }: { from: string; offer: Peer.SignalData; username: string }) => {
            if (!localStreamRef.current) return;

            console.log(`📥 Received offer from ${username}`);

            // Create peer (not initiator) and signal the offer
            const peer = createPeer(from, username, false, localStreamRef.current);
            peer.signal(offer);
        };

        // Receive answer from another peer
        const handleVoiceAnswer = ({ from, answer }: { from: string; answer: Peer.SignalData }) => {
            const peerConn = peersRef.current.get(from);
            if (peerConn) {
                console.log(`📥 Received answer from ${peerConn.username}`);
                peerConn.peer.signal(answer);
            }
        };

        // Receive ICE candidate
        const handleIceCandidate = ({ from, candidate }: { from: string; candidate: Peer.SignalData }) => {
            const peerConn = peersRef.current.get(from);
            if (peerConn) {
                peerConn.peer.signal(candidate);
            }
        };

        // User left voice
        const handleVoiceUserLeft = ({ socketId, username }: { socketId: string; username: string }) => {
            console.log(`👋 ${username} left voice chat`);
            cleanupPeer(socketId);
        };

        // Voice users list update
        const handleVoiceUsers = ({ users }: { users: VoiceUser[] }) => {
            setVoiceUsers(users);
        };

        // Mute state changed
        const handleMuteChange = ({ username: user, isMuted: muted }: { username: string; isMuted: boolean }) => {
            setVoiceUsers(prev =>
                prev.map(u => u.username === user ? { ...u, isMuted: muted } : u)
            );
        };

        // Register event listeners
        socket.on('VOICE_USERS_LIST', handleVoiceUsersList);
        socket.on('VOICE_USER_JOINED', handleVoiceUserJoined);
        socket.on('VOICE_OFFER', handleVoiceOffer);
        socket.on('VOICE_ANSWER', handleVoiceAnswer);
        socket.on('ICE_CANDIDATE', handleIceCandidate);
        socket.on('VOICE_USER_LEFT', handleVoiceUserLeft);
        socket.on('VOICE_USERS', handleVoiceUsers);
        socket.on('VOICE_USER_MUTE_CHANGED', handleMuteChange);

        return () => {
            socket.off('VOICE_USERS_LIST', handleVoiceUsersList);
            socket.off('VOICE_USER_JOINED', handleVoiceUserJoined);
            socket.off('VOICE_OFFER', handleVoiceOffer);
            socket.off('VOICE_ANSWER', handleVoiceAnswer);
            socket.off('ICE_CANDIDATE', handleIceCandidate);
            socket.off('VOICE_USER_LEFT', handleVoiceUserLeft);
            socket.off('VOICE_USERS', handleVoiceUsers);
            socket.off('VOICE_USER_MUTE_CHANGED', handleMuteChange);
        };
    }, [roomId, createPeer, cleanupPeer]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isInVoice) {
                socket.emit('VOICE_LEAVE', { roomId });
            }
            cleanupAllPeers();
            stopLocalStream();
        };
    }, []);

    return {
        isInVoice,
        isMuted,
        voiceUsers,
        isConnecting,
        error,
        joinVoice,
        leaveVoice,
        toggleMute
    };
}
