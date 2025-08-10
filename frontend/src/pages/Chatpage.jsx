import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000"; // Update if deployed
let socket;
let selectedChatCompare;

const ChatPage = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };

  // Setup socket
  useEffect(() => {
    socket = io(ENDPOINT);
    if (user) {
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
    }

    return () => socket.disconnect();
  }, [user]);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await axios.get(`${ENDPOINT}/api/chat`, config);
        setChats(data);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    fetchChats();
  }, []);

  // Fetch messages when chat selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      try {
        const { data } = await axios.get(`${ENDPOINT}/api/message/${selectedChat._id}`, config);
        setMessages(data);
        socket.emit("join chat", selectedChat._id);
        selectedChatCompare = selectedChat;
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Receive message
  useEffect(() => {
    socket.on("message received", (newMsgReceived) => {
      if (
        !selectedChatCompare || // if chat not selected
        selectedChatCompare._id !== newMsgReceived.chat._id
      ) {
        // Optional: show notification
      } else {
        setMessages((prev) => [...prev, newMsgReceived]);
      }
    });
  });

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data } = await axios.post(
        `${ENDPOINT}/api/message`,
        {
          content: newMessage,
          chatId: selectedChat._id,
        },
        config
      );

      socket.emit("new message", data);
      setMessages([...messages, data]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
  if (!socket) return;

  socket.on("message received", (newMessage) => {
    // If the new message is for the selected chat
    if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
      // Optional: show notification or something
      return;
    } else {
      setMessages((prev) => [...prev, newMessage]);
    }
  });
});


  return (
    <div className="flex h-[92vh]">
      {/* Sidebar */}
      <div className="w-1/3 bg-base-200 overflow-y-auto">
        <h2 className="text-xl font-bold p-4">Chats</h2>
        <ul>
          {chats.map((chat) => (
            <li
              key={chat._id}
              className={`p-4 cursor-pointer hover:bg-base-300 ${
                selectedChat?._id === chat._id ? "bg-base-300" : ""
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="font-semibold">
                {chat.isGroupChat
                  ? chat.chatName
                  : chat.users.find((u) => u._id !== user._id)?.name}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        {/* Chat Header */}
        <div className="bg-base-300 p-4 font-bold">
          {selectedChat
            ? selectedChat.isGroupChat
              ? selectedChat.chatName
              : selectedChat.users.find((u) => u._id !== user._id)?.name
            : "Select a chat"}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`chat ${
                msg.sender._id === user._id ? "chat-end" : "chat-start"
              }`}
            >
              <div className="chat-bubble">{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="p-4 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Type a message"
            className="input input-bordered w-full rounded-full"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="btn btn-primary rounded-full px-6" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
