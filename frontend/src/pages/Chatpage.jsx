// ChatPage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
} from "lucide-react";
import { useUser } from "../Utils/UserContext.jsx";

const ENDPOINT = "http://localhost:8000";

export default function ChatPage() {
  console.log("🎯 ChatPage component is rendering");
  
  const { user } = useUser();
  
  console.log("👤 Current user:", user);
  
  // Use useRef for socket and selectedChatCompare to persist across renders
  const socketRef = useRef(null);
  const selectedChatCompareRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const formatTime = (iso) =>
    iso
      ? new Date(iso).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  const otherUserFromChat = (chat) =>
    chat?.users?.find((u) => u._id !== (user?._id || user?.id)) || null;

  const mapServerMsgToUI = useCallback((m) => {
    // Handle sender ID - could be populated object or just an ID string
    const senderId = m?.sender?._id || m?.sender;
    const currentUserId = user?._id || user?.id;
    
    return {
      id: m._id || Date.now().toString(),
      content: m.content || m.text || "",
      timestamp: m.createdAt ? formatTime(m.createdAt) : formatTime(new Date()),
      isOwn: senderId === currentUserId,
      status: senderId === currentUserId ? "sent" : "read",
      raw: m,
    };
  }, [user]);

  // ---------- Socket ----------
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!user || !userId) {
      console.log("⚠️ No user or user ID available, skipping socket connection");
      return;
    }

    console.log("🔌 Initializing socket connection for user:", userId);
    
    socketRef.current = io(ENDPOINT, { 
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000
    });

    socketRef.current.emit("setup", user);

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id);
    });
    
    socketRef.current.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("🚫 Socket connection error:", error);
    });

    const onMessageReceived = (newMsgReceived) => {
      console.log("📨 Received message via Socket.IO:", newMsgReceived);
      console.log("📊 Current selectedChatCompareRef:", selectedChatCompareRef.current);
      console.log("📊 Current user:", user);
      
      // ✅ Validate message structure - check if sender is populated or just an ID
      if (!newMsgReceived || !newMsgReceived.chat) {
        console.warn("⚠️ Invalid message received - missing basic structure:", newMsgReceived);
        return;
      }

      // Handle case where sender might not be populated (just an ID)
      const senderId = newMsgReceived.sender?._id || newMsgReceived.sender?.id || newMsgReceived.sender;
      if (!senderId) {
        console.warn("⚠️ Invalid message received - no sender information:", newMsgReceived);
        return;
      }
      
      // ✅ only add if it's for the active chat
      if (
        !selectedChatCompareRef.current ||
        selectedChatCompareRef.current._id !== newMsgReceived.chat._id
      ) {
        console.log("🚫 Message not for active chat:", {
          messageChat: newMsgReceived.chat._id,
          activeChat: selectedChatCompareRef.current?._id
        });
        return;
      }
      
      // ✅ Don't add if it's from the current user (avoid duplicates)
      const currentUserId = user?._id || user?.id;
      if (senderId === currentUserId) {
        console.log("🚫 Own message received via socket, ignoring to prevent duplicate");
        return;
      }
      
      console.log("✅ Adding message from another user:", {
        senderId,
        currentUserId,
        content: newMsgReceived.content
      });
      
      // ✅ Check for duplicate message IDs
      setMessages((prev) => {
        const messageExists = prev.some(msg => msg.id === newMsgReceived._id);
        if (messageExists) {
          console.log("🚫 Duplicate message ID detected, skipping");
          return prev; // Don't add duplicate
        }
        console.log("📝 Adding new message to state");
        return [...prev, mapServerMsgToUI(newMsgReceived)];
      });
    };

    const onTyping = (chatId) => {
      if (selectedChat && selectedChat._id === chatId) setOtherTyping(true);
    };
    const onStopTyping = (chatId) => {
      if (selectedChat && selectedChat._id === chatId) setOtherTyping(false);
    };

    socketRef.current.on("message received", onMessageReceived);
    socketRef.current.on("typing", onTyping);
    socketRef.current.on("stop typing", onStopTyping);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("message received", onMessageReceived);
        socketRef.current.off("typing", onTyping);
        socketRef.current.off("stop typing", onStopTyping);
        socketRef.current.disconnect();
      }
    };
  }, [user, mapServerMsgToUI, selectedChat]);

  // ---------- Load chats ----------
  useEffect(() => {
    if (!user?.token) return;
    axios
      .get(`${ENDPOINT}/api/chat`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then(({ data }) => setChats(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("fetch chats error:", err?.response?.data || err.message);
        setChats([]);
      });
  }, [user?.token]);

  // ---------- Load friends ----------
  useEffect(() => {
    if (!user?.token) return;
    axios
      .get(`${ENDPOINT}/api/friends/list`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then(({ data }) => {
        if (Array.isArray(data?.friends)) setFriends(data.friends);
        else setFriends([]);
      })
      .catch((err) => {
        console.error("fetch friends error:", err?.response?.data || err.message);
        setFriends([]);
      });
  }, [user?.token]);

  // ---------- Load messages ----------
  useEffect(() => {
    if (!selectedChat || !user?.token) {
      setMessages([]);
      selectedChatCompareRef.current = null;
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `${ENDPOINT}/api/message/${selectedChat._id}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const uiMsgs = Array.isArray(data) ? data.map(mapServerMsgToUI) : [];
        setMessages(uiMsgs);

        // ✅ join chat room
        if (socketRef.current) {
          socketRef.current.emit("join chat", selectedChat._id);
        }
        selectedChatCompareRef.current = selectedChat;
      } catch (err) {
        console.error("fetch messages error:", err?.response?.data || err.message);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedChat, user?.token, mapServerMsgToUI]);

  // ---------- Auto scroll ----------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------- Access chat ----------
  const accessChat = async (friendId) => {
    if (!user?.token) return;

    try {
      const { data } = await axios.post(
        `${ENDPOINT}/api/chat`,
        { userId: friendId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setSelectedChat(data);

      if (socketRef.current && data?._id) {
        socketRef.current.emit("join chat", data._id);
      }

      setChats((prev) => {
        const exists = prev.find((c) => c._id === data._id);
        if (exists) {
          return [exists, ...prev.filter((c) => c._id !== data._id)];
        }
        return [data, ...prev];
      });
    } catch (err) {
      console.error("accessChat error:", err?.response?.data || err.message);
    }
  };

  // ---------- Typing ----------
  const emitTyping = () => {
    if (!selectedChat || !socketRef.current) return;
    socketRef.current.emit("typing", selectedChat._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("stop typing", selectedChat._id);
      }
    }, 1500);
  };

  // ---------- Send message ----------
  const sendMessage = async () => {
  if (!newMessage.trim() || !selectedChat || sending || !user?.token) return;
  try {
    setSending(true);
    const { data } = await axios.post(
      `${ENDPOINT}/api/message`,
      { content: newMessage.trim(), chatId: selectedChat._id },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    // ✅ local add (sender) - check for duplicates
    setMessages((prev) => {
      const messageExists = prev.some(msg => msg.id === data._id);
      if (messageExists) {
        return prev; // Don't add duplicate
      }
      return [...prev, mapServerMsgToUI(data)];
    });

    setNewMessage("");
  } catch (err) {
    console.error("sendMessage error:", err?.response?.data || err.message);
  } finally {
    setSending(false);
  }
};


  if (!user) {
    console.log("⚠️ No user found, showing loading screen");
    return (
      <div className="h-[92vh] flex items-center justify-center text-gray-500">
        Loading user data...
      </div>
    );
  }

  if (!user._id && !user.id) {
    console.log("⚠️ User found but no _id or id, showing login prompt");
    return (
      <div className="h-[92vh] flex items-center justify-center text-gray-500">
        Please log in to view chats.
      </div>
    );
  }

  console.log("✅ User is valid, continuing with chat page render");

  const other = selectedChat ? otherUserFromChat(selectedChat) : null;

  return (
    <div className="flex h-screen w-screen bg-base-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-base-100 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-base-100 sticky top-0 z-10">
          <h3 className="text-lg font-bold">Chats</h3>
        </div>

        {/* Friends list */}
        <div className="flex-1 overflow-y-auto p-2">
          {friends.length > 0 ? (
            friends.map((f) => (
              <div
                key={f._id}
                onClick={() => accessChat(f._id)}
                className={`p-2 cursor-pointer hover:bg-base-200 rounded flex items-center gap-2 ${
                  selectedChat &&
                  !selectedChat.isGroupChat &&
                  otherUserFromChat(selectedChat)?._id === f._id
                    ? "bg-base-300"
                    : ""
                }`}
              >
                <img
                  src={f.profilePic || "/default-avatar.png"} // ✅ fixed placeholder issue
                  alt={f.name}
                  className="w-8 h-8 rounded-full"
                />
                <span>{f.name}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No friends found</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-base-100">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img
                  src={other?.profilePic || "/default-avatar.png"} // ✅ fixed placeholder issue
                  alt="avatar"
                />
              </div>
            </div>
            <div>
              <div className="font-semibold">
                {selectedChat
                  ? selectedChat.isGroupChat
                    ? selectedChat.chatName
                    : other?.name || "Unknown"
                  : "Select a conversation"}
              </div>
              <div className="text-xs text-gray-500">
                {otherTyping ? "Typing..." : "Online"}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm">
              <Phone size={18} />
            </button>
            <button className="btn btn-ghost btn-sm">
              <Video size={18} />
            </button>
            <button className="btn btn-ghost btn-sm">
              <Info size={18} />
            </button>
            <button className="btn btn-ghost btn-sm">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-base-200 pb-28">
          {selectedChat ? (
            messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat ${msg.isOwn ? "chat-end" : "chat-start"}`}
                >
                  <div
                    className={`chat-bubble ${
                      msg.isOwn ? "chat-bubble-primary" : "chat-bubble-secondary"
                    }`}
                  >
                    {msg.content}
                    <div className="text-[10px] opacity-70 mt-1">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No messages yet</div>
            )
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a conversation
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-base-100 flex items-center gap-2 z-10">
          <button className="btn btn-ghost btn-circle" title="Attach">
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            placeholder={
              selectedChat
                ? "Type a message..."
                : "Select a chat to start messaging"
            }
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (selectedChat) emitTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={!selectedChat}
            className="input input-bordered flex-1"
          />

          <button className="btn btn-ghost btn-circle" title="Emoji">
            <Smile size={18} />
          </button>

          <button
            onClick={sendMessage}
            disabled={!selectedChat || !newMessage.trim() || sending}
            className="btn btn-primary"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
