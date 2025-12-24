'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface Version {
  _id: string;
  code: string;
  createdAt: string;
}

export default function VersionHistoryModal({
  roomId,
  onClose
}: {
  roomId: string;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/versions/${roomId}`, {
          credentials: "include"
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log("✅ Versions fetched:", data);
        setVersions(data.versions || []);
      } catch (err) {
        console.error("❌ Error fetching versions:", err);
      }
    };

    fetchVersions();
  }, [roomId]);

  const restoreVersion = async (versionId: string) => {
    await fetch('/api/versions/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, versionId })
    });
    alert('Version restored!');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Version History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Version List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            {versions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No versions found
              </div>
            ) : (
              versions.map((v) => (
                <button
                  key={v._id}
                  onClick={() => setSelectedCode(v.code)}
                  className={`w-full px-6 py-4 text-left border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                    selectedCode === v.code ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(v.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to preview
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Right: Code Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedCode ? (
              <>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-200">
                    {selectedCode}
                  </pre>
                </div>
                <div className="p-6 border-t border-gray-200 bg-white">
                  <button
                    onClick={() => {
                      const selected = versions.find(v => v.code === selectedCode);
                      if (selected) restoreVersion(selected._id);
                    }}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Restore This Version
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">Select a version to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
