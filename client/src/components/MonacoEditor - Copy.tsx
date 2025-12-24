'use client';

import { Editor } from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import socket from '@/lib/socket';
import { useEditorStore } from '@/stores/Editorstore';

interface MonacoEditorProps {
  language: string;
}

export default function MonacoEditor({ language }: MonacoEditorProps) {
  const editorRef = useRef<any>(null);
  const preventEmitRef = useRef(false);
  const initialCodeRef = useRef<string | null>(null);
  const { roomId } = useParams();
  const { code, setCode } = useEditorStore();
  const [isEditorReady, setIsEditorReady] = useState(false);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // If code was received before editor was mounted, apply it now
    if (initialCodeRef.current !== null) {
      preventEmitRef.current = true;
      editor.setValue(initialCodeRef.current);
      setCode(initialCodeRef.current);
      initialCodeRef.current = null; // clear it
    }

    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();

      if (preventEmitRef.current) {
        preventEmitRef.current = false;
        return;
      }

      socket.emit('CODE_CHANGE', { roomId, code: value });
      setCode(value);
    });
  };

  useEffect(() => {
    const handleRemoteCodeChange = (data: { code: string }) => {
      if (editorRef.current) {
        preventEmitRef.current = true;
        editorRef.current.setValue(data.code);
        setCode(data.code);
      }
    };

    const handleLoadDocument = ({ code }: { code: string }) => {
      if (editorRef.current) {
        preventEmitRef.current = true;
        editorRef.current.setValue(code);
        setCode(code);
      } else {
        // Editor not ready yet: store temporarily
        initialCodeRef.current = code;
      }
    };

    socket.on('CODE_CHANGE', handleRemoteCodeChange);
    socket.on('LOAD_DOCUMENT', handleLoadDocument);

    socket.emit('GET_DOCUMENT', { roomId });

    return () => {
      socket.off('CODE_CHANGE', handleRemoteCodeChange);
      socket.off('LOAD_DOCUMENT', handleLoadDocument);
    };
  }, [roomId, setCode]);

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      defaultLanguage={language}
      onMount={handleEditorDidMount}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
      }}
    />
  );
}
