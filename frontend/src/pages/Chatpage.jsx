import React from 'react';

const ChatPage = () => {
  return (
    <div className="flex h-screen bg-base-100">
      {/* Sidebar (Chats List) */}
      <aside className="w-full sm:w-1/3 md:w-1/4 border-r border-base-300 bg-base-200">
        <div className="p-4 font-bold text-lg border-b border-base-300">
          Chats
        </div>
        <ul className="overflow-y-auto h-[calc(100%-4rem)] divide-y divide-base-300">
          {/* Sample Chat List */}
          {[...Array(10)].map((_, i) => (
            <li key={i} className="p-4 cursor-pointer hover:bg-base-300">
              <div className="font-semibold">User {i + 1}</div>
              <div className="text-sm text-base-content/70 truncate">
                Last message preview...
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat Window */}
      <section className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 px-4 flex items-center border-b border-base-300 bg-base-200">
          <div className="font-semibold text-lg">User 1</div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
          {/* Incoming */}
          <div className="flex justify-start">
            <div className="bg-base-300 text-base-content px-4 py-2 rounded-2xl rounded-bl-none max-w-xs">
              Hello! How are you?
            </div>
          </div>
          {/* Outgoing */}
          <div className="flex justify-end">
            <div className="bg-primary text-white px-4 py-2 rounded-2xl rounded-br-none max-w-xs">
              I’m good, thanks! You?
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="h-20 px-4 py-2 border-t border-base-300 bg-base-100 flex items-center gap-4">
          <input
            type="text"
            placeholder="Type a message"
            className="input input-bordered w-full rounded-full"
          />
          <button className="btn btn-primary rounded-full px-6">Send</button>
        </div>
      </section>
    </div>
  );
};

export default ChatPage;
