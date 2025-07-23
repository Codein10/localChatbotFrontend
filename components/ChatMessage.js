"use client"
const ChatMessage = ({ role, content }) => {
    const isUser = role === "user";
    const isSystem = role === "system";
    if (isSystem) {
      return (
        <div className="mb-4 flex justify-center">
          <div className="max-w-md px-4 py-2 rounded-lg bg-gray-300 text-gray-700 italic text-center">
            {content}
          </div>
        </div>
      );
    }
    return (
      <div className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-md px-4 py-2 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
          {content}
        </div>
      </div>
    );
  };
  
  export default ChatMessage;
  