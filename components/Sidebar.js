"use client"
const Sidebar = ({ sessions, onNewChat, onSelectSession, onDelete, onRename }) => {
    
    const truncateTitle = (title) => {
      if (!title) return '';
      const words = title.split(' ');
      if (words.length <= 5) return title;
      return words.slice(0, 5).join(' ') + '...';
    };
    return (
      <div className="w-1/4 bg-gray-800 text-white p-4 flex flex-col h-full">
        <button
          onClick={onNewChat}
          className="bg-blue-600 rounded px-4 py-2 mb-4 hover:bg-blue-700"
        >
          + New Chat 
        </button>
        <div className="flex-1 overflow-y-auto space-y-2">
          {sessions.map((s, i) => (
            <div
              key={i}
              onClick={() => onSelectSession(i)}
              className="cursor-pointer hover:bg-gray-700 p-2 flex justify-between rounded items-center"
            >
              <div>
                <p className="text-sm font-semibold">{truncateTitle(s.title)}</p>
                <p className="text-xs text-gray-400">{s.date}</p>
              </div>
              <div className="flex space-x-1">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                  onClick={e => { e.stopPropagation(); onDelete && onDelete(s.id); }}
                  title="Delete"
                >
                  Delete
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                  onClick={e => { e.stopPropagation(); onRename && onRename(s.id, s.title); }}
                  title="Rename"
                >
                  Rename
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default Sidebar;
  