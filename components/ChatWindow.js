"use client"
import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

const ChatWindow = ({ messages }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
      {messages.map((msg, index) => (
        <ChatMessage key={index} role={msg.role} content={msg.content} />
      ))}
    </div>
  );
};

export default ChatWindow;
