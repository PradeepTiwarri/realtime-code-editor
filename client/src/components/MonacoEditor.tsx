// src/components/MonacoEditor.tsx
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
  const { setCode } = useEditorStore();

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Apply code if it was received before mount
    if (initialCodeRef.current !== null) {
      preventEmitRef.current = true;
      editor.setValue(initialCodeRef.current);
      setCode(initialCodeRef.current);
      initialCodeRef.current = null; 
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
      if (editorRef.current && data.code !== editorRef.current.getValue()) {
        preventEmitRef.current = true;
        editorRef.current.setValue(data.code);
        setCode(data.code);
      }
    };

    // ✅ FIXED: Listen for LOAD_CODE
    const handleLoadCode = (code: string) => {
      if (editorRef.current) {
        preventEmitRef.current = true;
        editorRef.current.setValue(code);
        setCode(code);
      } else {
        initialCodeRef.current = code;
      }
    };

    socket.on('CODE_CHANGE', handleRemoteCodeChange);
    socket.on('LOAD_CODE', handleLoadCode);

    // Request current state from server
    socket.emit('GET_DOCUMENT', { roomId });

    return () => {
      socket.off('CODE_CHANGE', handleRemoteCodeChange);
      socket.off('LOAD_CODE', handleLoadCode);
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