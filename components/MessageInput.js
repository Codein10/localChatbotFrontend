"use client"
import React from 'react';
const MessageInput = ({ onSend, onStop }) => {
    const [input, setInput] = React.useState('');
  
    const handleSend = () => {
      if (input.trim()) {
        onSend(input);
        setInput('');
      }
    };
  
    return (
      <div className="p-4 border-t flex items-center bg-white">
        <input
          className="flex-1 border rounded p-2 mr-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
        >
          Send
        </button>
        <button
          onClick={onStop}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          disabled={!onStop}
        >
          Stop
        </button>
      </div>
    );
  };
  
  export default MessageInput;
  