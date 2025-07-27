'use client';

import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';

export default function HomePage() {
  const [sessions, setSessions] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" }
  ]);
  const [chatId, setChatId] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef(null);

  const fetchChats = async () => {
    try {
      const res = await fetch('https://localchatbotbackend.onrender.com/api/chats');
      const data = await res.json();
      const formatted = data.map(chat => ({
        ...chat,
        date: new Date(chat.createdAt).toLocaleString(),
      }));
      setSessions(formatted);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleNewChat = () => {
    setCurrentMessages([]);
    setChatId(null); // Start a new chat session
  };

  const handleSelectSession = async (index) => {
    const selectedChat = sessions[index];
    if (!selectedChat || !selectedChat.id) return;
    setChatId(selectedChat.id);
    try {
      const res = await fetch(`https://localchatbotbackend.onrender.com/api/chat/${selectedChat.id}`);
      const messages = await res.json();
      setCurrentMessages(messages.map(m => ({ role: m.role, content: m.content })));
    } catch (err) {
      setCurrentMessages([{ role: 'system', content: 'Failed to load chat messages.' }]);
      console.error('Failed to fetch chat messages:', err);
    }
  };

  const handleSend = async (message) => {
    setCurrentMessages((prev) => [...prev, { role: "user", content: message }]);
    let currentChatId = chatId;
    setIsStreaming(true);
    try {
      if (!currentChatId) {
        const chatRes = await fetch("https://localchatbotbackend.onrender.com/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: message }),
        });
        const chatData = await chatRes.json();
        currentChatId = chatData.id;
        setChatId(currentChatId);
        await fetchChats();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const response = await fetch(`https://localchatbotbackend.onrender.com/api/chat/${currentChatId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: abortController.signal,
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setCurrentMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(Boolean);
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.replace("data: ", "");
              if (data === "[DONE]") {
                done = true;
                break;
              }
              assistantMessage += data;
              setCurrentMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantMessage };
                return updated;
              });
            }
          }
        }
      }
    } catch (error) {
      
      if (!(error.name === 'AbortError')) {
        setCurrentMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, there was an error getting a response." }
        ]);
        console.error("Error in handleSend:", error);
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = async () => {
    if (abortControllerRef.current && chatId) {
      abortControllerRef.current.abort();
      try {
        await fetch(`https://localchatbotbackend.onrender.com/api/chat/${chatId}/stop`, {
          method: "POST",
        });
      } catch (err) {
        console.error("Error stopping stream:", err);
      }
      setIsStreaming(false);
      setCurrentMessages((prev) => [
        ...prev,
        { role: "system", content: "Response stopped by user." }
      ]);
    }
  };

  const handleDeleteChat = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      await fetch(`https://localchatbotbackend.onrender.com/api/chat/${id}`, {
        method: 'DELETE',
      });
      await fetchChats();
      if (chatId === id) {
        setCurrentMessages([]);
        setChatId(null);
      }
    } catch (err) {
      alert('Failed to delete chat.');
      console.error('Failed to delete chat:', err);
    }
  };

  const handleRenameChat = async (id, oldTitle) => {
    const newTitle = window.prompt('Enter new chat title:', oldTitle);
    if (!newTitle || newTitle.trim() === oldTitle) return;
    try {
      await fetch(`https://localchatbotbackend.onrender.com/api/chat/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      await fetchChats();
    } catch (err) {
      alert('Failed to rename chat.');
      console.error('Failed to rename chat:', err);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        sessions={sessions}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDelete={handleDeleteChat}
        onRename={handleRenameChat}
      />
      <div className="flex flex-col w-3/4">
        <ChatWindow messages={isStreaming ? [...currentMessages, { role: 'assistant', content: 'Typing...' }] : currentMessages} />
        <MessageInput onSend={handleSend} onStop={isStreaming ? handleStop : undefined} />
      </div>
    </div>
  );
}
