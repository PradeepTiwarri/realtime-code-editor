'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, Users, Maximize2, Minimize2, Download } from 'lucide-react';
import socket from '@/lib/socket';
import dynamic from 'next/dynamic';

// Import tldraw CSS
import 'tldraw/tldraw.css';

// Dynamic import for tldraw (CSR only)
const Tldraw = dynamic(
    async () => {
        const mod = await import('tldraw');
        return mod.Tldraw;
    },
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full bg-white">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-500">Loading whiteboard...</p>
                </div>
            </div>
        )
    }
);

interface WhiteboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string;
    username: string;
}

export default function WhiteboardModal({ isOpen, onClose, roomId, username }: WhiteboardModalProps) {
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const editorRef = useRef<any>(null);
    const isRemoteUpdate = useRef(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Export whiteboard as PNG
    const handleDownload = async () => {
        if (!editorRef.current) return;

        setIsExporting(true);
        try {
            const editor = editorRef.current;

            // Get all shape IDs on the current page
            const shapeIds = editor.getCurrentPageShapeIds();

            if (shapeIds.size === 0) {
                alert('Nothing to export! Draw something first.');
                setIsExporting(false);
                return;
            }

            // In tldraw v4, we use a different approach - render the canvas content
            // Get the canvas element from the editor
            const container = document.querySelector('.tl-canvas');

            if (container) {
                // Use html2canvas approach by capturing the SVG content
                const svgElement = container.querySelector('svg');

                if (svgElement) {
                    // Clone the SVG to avoid modifying the original
                    const clonedSvg = svgElement.cloneNode(true) as SVGElement;

                    // Get the bounding box of all shapes
                    const bounds = editor.getSelectionPageBounds() || editor.getCurrentPageBounds();

                    if (bounds) {
                        // Set viewBox to capture content
                        const padding = 20;
                        clonedSvg.setAttribute('viewBox', `${bounds.x - padding} ${bounds.y - padding} ${bounds.width + padding * 2} ${bounds.height + padding * 2}`);
                        clonedSvg.setAttribute('width', String(bounds.width + padding * 2));
                        clonedSvg.setAttribute('height', String(bounds.height + padding * 2));
                    }

                    // Add white background
                    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    rect.setAttribute('x', bounds ? String(bounds.x - 20) : '0');
                    rect.setAttribute('y', bounds ? String(bounds.y - 20) : '0');
                    rect.setAttribute('width', '100%');
                    rect.setAttribute('height', '100%');
                    rect.setAttribute('fill', 'white');
                    clonedSvg.insertBefore(rect, clonedSvg.firstChild);

                    const svgString = new XMLSerializer().serializeToString(clonedSvg);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();

                    img.onload = () => {
                        canvas.width = img.width * 2; // Scale for better quality
                        canvas.height = img.height * 2;
                        ctx?.scale(2, 2);
                        ctx?.drawImage(img, 0, 0);

                        // Download as PNG
                        const link = document.createElement('a');
                        link.download = `whiteboard-${roomId}-${Date.now()}.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                        setIsExporting(false);
                    };

                    img.onerror = () => {
                        // Fallback: download as SVG
                        const blob = new Blob([svgString], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = `whiteboard-${roomId}-${Date.now()}.svg`;
                        link.href = url;
                        link.click();
                        URL.revokeObjectURL(url);
                        setIsExporting(false);
                    };

                    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
                } else {
                    alert('Could not find canvas content to export.');
                    setIsExporting(false);
                }
            } else {
                alert('Could not find whiteboard canvas.');
                setIsExporting(false);
            }
        } catch (e) {
            console.error('Export error:', e);
            alert('Failed to export. Please try again.');
            setIsExporting(false);
        }
    };

    // Handle socket events for collaboration
    useEffect(() => {
        if (!isOpen || !roomId) return;

        // Join whiteboard room
        socket.emit('WHITEBOARD_JOIN', { roomId, username });

        // Handle receiving whiteboard data from others
        const handleWhiteboardUpdate = (data: { records: any[], senderUsername: string }) => {
            if (data.senderUsername === username) return;

            if (editorRef.current && data.records) {
                isRemoteUpdate.current = true;
                try {
                    // Apply the records to the store
                    const editor = editorRef.current;
                    editor.store.mergeRemoteChanges(() => {
                        for (const record of data.records) {
                            if (record.deleted) {
                                editor.store.remove([record.id]);
                            } else {
                                editor.store.put([record]);
                            }
                        }
                    });
                } catch (e) {
                    console.error('Error applying remote changes:', e);
                }
                setTimeout(() => {
                    isRemoteUpdate.current = false;
                }, 50);
            }
        };

        // Handle initial whiteboard state
        const handleWhiteboardInit = (data: { records: any[] }) => {
            if (editorRef.current && data.records && data.records.length > 0) {
                isRemoteUpdate.current = true;
                try {
                    const editor = editorRef.current;
                    editor.store.mergeRemoteChanges(() => {
                        for (const record of data.records) {
                            editor.store.put([record]);
                        }
                    });
                } catch (e) {
                    console.error('Error loading initial state:', e);
                }
                setTimeout(() => {
                    isRemoteUpdate.current = false;
                }, 50);
            }
        };

        // Handle collaborators list
        const handleWhiteboardUsers = ({ users }: { users: string[] }) => {
            setCollaborators(users);
        };

        socket.on('WHITEBOARD_UPDATE', handleWhiteboardUpdate);
        socket.on('WHITEBOARD_INIT', handleWhiteboardInit);
        socket.on('WHITEBOARD_USERS', handleWhiteboardUsers);

        return () => {
            socket.emit('WHITEBOARD_LEAVE', { roomId });
            socket.off('WHITEBOARD_UPDATE', handleWhiteboardUpdate);
            socket.off('WHITEBOARD_INIT', handleWhiteboardInit);
            socket.off('WHITEBOARD_USERS', handleWhiteboardUsers);
        };
    }, [isOpen, roomId, username]);

    // Handle editor mount
    const handleMount = useCallback((editor: any) => {
        editorRef.current = editor;

        // Listen for local changes and send to others
        const handleStoreChange = (changes: any) => {
            if (isRemoteUpdate.current) return;

            // Debounce the updates
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            debounceTimer.current = setTimeout(() => {
                const records: any[] = [];

                // Get added and updated records
                if (changes.changes.added) {
                    Object.values(changes.changes.added).forEach((record: any) => {
                        records.push(record);
                    });
                }
                if (changes.changes.updated) {
                    Object.values(changes.changes.updated).forEach(([, record]: any) => {
                        records.push(record);
                    });
                }
                if (changes.changes.removed) {
                    Object.values(changes.changes.removed).forEach((record: any) => {
                        records.push({ ...record, deleted: true });
                    });
                }

                if (records.length > 0) {
                    socket.emit('WHITEBOARD_UPDATE', {
                        roomId,
                        records,
                        username
                    });
                }
            }, 50);
        };

        // Subscribe to store changes
        const unsubscribe = editor.store.listen(handleStoreChange, { source: 'user' });

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            unsubscribe();
        };
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
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg sm:text-xl font-bold text-white">🎨 Whiteboard</h2>
                        <div className="hidden sm:flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-white">{collaborators.length} online</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Collaborators - Mobile */}
                        <div className="sm:hidden flex items-center gap-1 bg-slate-700 px-2 py-1 rounded-full">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-white">{collaborators.length}</span>
                        </div>

                        {/* Download button */}
                        <button
                            onClick={handleDownload}
                            disabled={isExporting}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-gray-300 hover:text-white disabled:opacity-50"
                            title="Download as PNG"
                        >
                            {isExporting ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Download className="w-5 h-5" />
                            )}
                        </button>

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

                {/* Tldraw Canvas */}
                <div className="flex-1 relative">
                    <Tldraw
                        onMount={handleMount}
                        autoFocus
                    />
                </div>

                {/* Collaborators footer - visible on mobile */}
                {collaborators.length > 0 && (
                    <div className="sm:hidden px-4 py-2 bg-slate-800 border-t border-slate-700 shrink-0">
                        <div className="flex items-center gap-2 overflow-x-auto">
                            <span className="text-xs text-gray-400 whitespace-nowrap">Online:</span>
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
