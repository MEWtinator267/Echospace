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
  FileText,
  Download,
} from "lucide-react";
import { useUser } from "../Utils/UserContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import Picker from "emoji-picker-react";
import { Menu, Transition } from "@headlessui/react";

const ENDPOINT = "http://localhost:8000";

// --- Sub-components ---

const FileBubble = ({ file, isOwn }) => (
  <div className="flex items-center gap-3">
    <div
      className={`p-3 rounded-full ${
        isOwn ? "bg-primary-focus/30" : "bg-base-300"
      }`}
    >
      <FileText size={20} className={isOwn ? "text-primary-content" : ""} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold truncate max-w-xs">{file.name}</p>
      <p className="text-xs opacity-60">{file.mimeType}</p>
    </div>
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      download={file.name}
      className="btn btn-ghost btn-circle btn-sm"
      title="Download"
    >
      <Download size={18} />
    </a>
  </div>
);

const MessageBubble = ({ msg }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`chat ${msg.isOwn ? "chat-end" : "chat-start"}`}
    >
      <div
        className={`chat-bubble ${
          msg.isOwn ? "chat-bubble-primary" : ""
        } shadow-md`}
      >
        {msg.file ? (
          <FileBubble file={msg.file} isOwn={msg.isOwn} />
        ) : (
          <p className="text-sm break-words">{msg.content}</p>
        )}
        <div className="text-right text-[10px] opacity-60 mt-1">
          {msg.timestamp}
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Chat Page Component ---

export default function ChatPage() {
  const { user } = useUser();
  const socketRef = useRef(null);
  const selectedChatCompareRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // --- Helper Functions ---

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

  const mapServerMsgToUI = useCallback(
    (m) => {
      const senderId = m?.sender?._id || m?.sender;
      const currentUserId = user?._id || user?.id;

      return {
        id: m._id || Date.now().toString(),
        content: m.content || "",
        timestamp: m.createdAt
          ? formatTime(m.createdAt)
          : formatTime(new Date()),
        isOwn: senderId === currentUserId,
        file: m.file || null,
        raw: m,
      };
    },
    [user]
  );

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // --- Effects ---

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!user || !userId) return;

    socketRef.current = io(ENDPOINT, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    socketRef.current.emit("setup", user);
    socketRef.current.on("connect", () =>
      console.log("✅ Socket connected:", socketRef.current.id)
    );

    const onMessageReceived = (newMsgReceived) => {
      if (!newMsgReceived || !newMsgReceived.chat) return;
      const senderId =
        newMsgReceived.sender?._id ||
        newMsgReceived.sender?.id ||
        newMsgReceived.sender;
      if (!senderId) return;
      if (
        !selectedChatCompareRef.current ||
        selectedChatCompareRef.current._id !== newMsgReceived.chat._id
      )
        return;
      const currentUserId = user?._id || user?.id;
      if (senderId === currentUserId) return;
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === newMsgReceived._id);
        if (messageExists) return prev;
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
        socketRef.current.disconnect();
      }
    };
  }, [user, mapServerMsgToUI, selectedChat]);

  useEffect(() => {
    if (!user?.token) return;
    axios
      .get(`${ENDPOINT}/api/chat`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then(({ data }) => setChats(Array.isArray(data) ? data : []))
      .catch((err) => setChats([]));
  }, [user?.token]);

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
      .catch((err) => setFriends([]));
  }, [user?.token]);

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
        setMessages(Array.isArray(data) ? data.map(mapServerMsgToUI) : []);
        if (socketRef.current) {
          socketRef.current.emit("join chat", selectedChat._id);
        }
        selectedChatCompareRef.current = selectedChat;
      } catch (err) {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [selectedChat, user?.token, mapServerMsgToUI]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, otherTyping]);

  // --- API Call Functions ---

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
        if (exists) return [exists, ...prev.filter((c) => c._id !== data._id)];
        return [data, ...prev];
      });
    } catch (err) {
      console.error("accessChat error:", err?.response?.data || err.message);
    }
  };

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

  const sendMessage = async (messageData = {}) => {
    const isTextMessage = messageData.content && messageData.content.trim();
    const isFileMessage = messageData.file;
    if ((!isTextMessage && !isFileMessage) || !selectedChat || sending || !user?.token) return;

    try {
      setSending(true);
      const payload = {
        chatId: selectedChat._id,
        content: isTextMessage ? messageData.content.trim() : "",
        file: isFileMessage ? messageData.file : undefined,
      };
      const { data } = await axios.post(
        `${ENDPOINT}/api/message`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data._id)) return prev;
        return [...prev, mapServerMsgToUI(data)];
      });
      if (isTextMessage) setNewMessage("");
    } catch (err) {
      console.error("sendMessage error:", err?.response?.data || err.message);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelectAndUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        `${ENDPOINT}/api/upload/file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (data.success && data.file) {
        await sendMessage({ file: data.file });
      }
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // --- Render Logic ---

  if (!user || (!user._id && !user.id)) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-300 text-base-content">
        Loading...
      </div>
    );
  }

  const other = selectedChat ? otherUserFromChat(selectedChat) : null;
  const isChatSelected = !!selectedChat;

  return (
    <div className="flex h-screen w-screen bg-base-300 text-base-content overflow-hidden font-sans">
      <aside className="w-96 bg-base-100 flex flex-col transition-all duration-300">
        <div className="p-6 border-b border-base-200">
          <h2 className="text-2xl font-bold">Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
          {friends.length > 0 ? (
            friends.map((f) => {
              const isActive =
                selectedChat && otherUserFromChat(selectedChat)?._id === f._id;
              return (
                <div
                  key={f._id}
                  onClick={() => accessChat(f._id)}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-primary/20 text-primary-content"
                      : "hover:bg-base-200"
                  }`}
                >
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img
                        src={f.profilePic || "/default-avatar.png"}
                        alt={f.name}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-xs opacity-60">
                      Last message snippet...
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-center p-10 opacity-50">
              No friends found
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-base-200">
        <AnimatePresence>
          {isChatSelected ? (
            <motion.div
              key={selectedChat._id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <header className="p-4 flex items-center justify-between bg-base-100 shadow-sm z-20">
                <div className="flex items-center gap-4">
                  <div className="avatar relative">
                    <div className="w-12 rounded-full">
                      <img
                        src={other?.profilePic || "/default-avatar.png"}
                        alt="avatar"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-base-100"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {other?.name || "Unknown"}
                    </h3>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={otherTyping ? "typing" : "online"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs text-green-500 font-semibold"
                      >
                        {otherTyping ? "Typing..." : "Online"}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[Phone, Video, Info, MoreVertical].map((Icon, i) => (
                    <button key={i} className="btn btn-ghost btn-circle">
                      <Icon size={20} />
                    </button>
                  ))}
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-200">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <footer className="p-4 bg-base-100 z-10">
                <AnimatePresence>
                  {isUploading && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-xs text-center p-2 text-primary"
                    >
                      Uploading file, please wait...
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="relative flex items-center gap-2 bg-base-200 rounded-full p-2 shadow-inner">
                  <div ref={emojiPickerRef}>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="btn btn-ghost btn-circle"
                      title="Emoji"
                    >
                      <Smile size={22} className="opacity-60" />
                    </button>
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="absolute bottom-full mb-2"
                        >
                          <Picker onEmojiClick={onEmojiClick} theme="dark" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      emitTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage({ content: newMessage });
                      }
                    }}
                    className="input w-full bg-transparent focus:outline-none placeholder:text-base-content/50"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelectAndUpload}
                    style={{ display: "none" }}
                  />
                  <Menu as="div" className="relative">
                    <Menu.Button
                      className="btn btn-ghost btn-circle"
                      title="Attach File"
                    >
                      <Paperclip size={22} className="opacity-60" />
                    </Menu.Button>
                    <Transition
                      as={React.Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute bottom-full right-0 mb-2 w-48 origin-bottom-right rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => fileInputRef.current.click()}
                                className={`${
                                  active ? "bg-base-300" : ""
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                              >
                                <FileText
                                  className="mr-2 h-5 w-5"
                                  aria-hidden="true"
                                />
                                Upload a File
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                  <button
                    onClick={() => sendMessage({ content: newMessage })}
                    disabled={!newMessage.trim() || sending}
                    className="btn btn-primary btn-circle shadow-lg disabled:bg-base-300"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </footer>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-base-content/50">
              <div className="text-center">
                <img
                  src="/chat-placeholder.svg"
                  alt="Select a conversation"
                  className="w-64 h-64 mx-auto mb-4"
                />
                <h3 className="text-2xl font-semibold">
                  Welcome, {user.name}!
                </h3>
                <p>Select a conversation to start chatting.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}