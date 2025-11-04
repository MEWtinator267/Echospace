// ChatPage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import io from "socket.io-client";
import { createPortal } from "react-dom";
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
  Trash2,
  Users,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useUser } from "../Utils/UserContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import Picker from "emoji-picker-react";
import { Menu, Transition } from "@headlessui/react";
import { useTheme } from "../components/ThemeContext.jsx"; // Make sure this path is correct

const ENDPOINT = "https://echospace-backend-z188.onrender.com";

// -----------------------------
// ConfirmationModal (top-level, high z-index)
// -----------------------------
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, customActions = [] }) => {
  if (!isOpen) return null;

  const modalContent = (
    <motion.div
      key="confirm-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999999] p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-base-100 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center border border-base-300"
      >
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="py-3 text-sm opacity-80">{message}</p>
        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>

          {customActions.length > 0 ? (
            customActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={action.style || "btn btn-primary"}
              >
                {action.label}
              </button>
            ))
          ) : (
            <button onClick={onConfirm} className="btn btn-error">Confirm Delete</button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};


// -----------------------------
// FilePreviewModal (top-level, high z-index but below confirmation)
// -----------------------------
const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;
  const isImage = file.mimeType?.startsWith("image/");
  const isVideo = file.mimeType?.startsWith("video/");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99998] p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-base-300 rounded-lg overflow-hidden"
      >
        {isImage && (
          <img
            src={file.url}
            alt={file.name}
            className="object-contain w-full h-full max-h-[90vh]"
          />
        )}
        {isVideo && (
          <video
            src={file.url}
            controls
            autoPlay
            className="object-contain w-full h-full max-h-[90vh]"
          >
            Your browser does not support the video tag.
          </video>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 btn btn-circle btn-sm z-50"
        >
          <X size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
};

// -----------------------------
// CreateGroupModal (top-level)
// -----------------------------
const CreateGroupModal = ({ isOpen, onClose, friends, onCreate }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setGroupName("");
      setSelectedUsers([]);
    }
  }, [isOpen]);

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };
  const handleSubmit = () => {
    if (!groupName.trim() || selectedUsers.length < 2) {
      alert("Group name is required and you must select at least 2 other members.");
      return;
    }
    onCreate({ name: groupName, users: selectedUsers });
  };
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99990] p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-base-100 rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <h3 className="font-bold text-xl mb-4">Create a new EchoZone</h3>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Group Name</span>
          </label>
          <input
            type="text"
            placeholder="Enter a cool group name..."
            className="input input-bordered w-full"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
        <p className="mt-4 mb-2 font-semibold">Select Members</p>
        <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-base-200 rounded-lg scrollbar-thin">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend._id} className="form-control">
                <label className="label cursor-pointer p-2 hover:bg-base-300 rounded-md">
                  <span className="label-text">{friend.name}</span>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(friend._id)}
                    onChange={() => handleUserSelect(friend._id)}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-center opacity-60 p-4">No friends to add.</p>
          )}
        </div>
        <div className="modal-action mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary">Create Zone</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// -----------------------------
// Variants for message animations
// -----------------------------
const outgoingVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 20, scale: 0.98 },
};

const incomingVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.98 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.98 },
};

// -----------------------------
// FileBubble
// -----------------------------
const FileBubble = ({ file, isOwn, onPreviewClick }) => {
  const isImage = file.mimeType?.startsWith("image/");
  const isVideo = file.mimeType?.startsWith("video/");

  if (isImage) {
    return (
      <div className="w-64 cursor-pointer" onClick={() => onPreviewClick(file)}>
        <img src={file.url} alt={file.name} className="rounded-lg object-cover w-full h-full" />
      </div>
    );
  }
  if (isVideo) {
    return (
      <div className="w-64 rounded-lg overflow-hidden relative">
        <video src={file.url} className="w-full pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <button onClick={() => onPreviewClick(file)} className="btn btn-primary btn-circle pointer-events-auto">
            <Video size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-2">
      <div className={`p-3 rounded-full ${isOwn ? "bg-primary-focus/30" : "bg-base-300"}`}>
        <FileText size={20} className={isOwn ? "text-primary-content" : ""} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold truncate max-w-xs">{file.name}</p>
        <p className="text-xs opacity-60">{file.mimeType}</p>
      </div>
      <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name} className="btn btn-ghost btn-circle btn-sm" title="Download">
        <Download size={18} />
      </a>
    </div>
  );
};

// -----------------------------
// MessageBubble (with dedicated dot area, no overlap)
// -----------------------------
const MessageBubble = ({ msg, onPreviewClick, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`chat group ${msg.isOwn ? "chat-end" : "chat-start"}`}
    >
      {/* ✅ remove overflow-hidden */}
      <div
        className={`chat-bubble relative ${
          msg.isOwn ? "chat-bubble-primary" : ""
        } shadow-md flex gap-2 items-start overflow-visible`}
      >
        <div className="flex-1 min-w-0">
          {msg.file ? (
            <FileBubble
              file={msg.file}
              isOwn={msg.isOwn}
              onPreviewClick={onPreviewClick}
            />
          ) : (
            <p className="text-sm break-words">{msg.content}</p>
          )}
          <div className="text-right text-[10px] opacity-60 mt-1">
            {msg.timestamp}
          </div>
        </div>

        {/* ✅ fix menu positioning */}
        {msg.isOwn && (
          <div className="relative self-start">
            <Menu as="div" className="relative z-[2000]">
              <Menu.Button className="btn btn-ghost btn-circle btn-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={14} />
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
                {/* ✅ ensure it’s not cut off and stays above bubble */}
                <Menu.Items className="absolute right-0 top-full mt-1 w-40 origin-top-right rounded-md bg-base-100 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[3000] overflow-visible">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onDelete(msg.id)}
                          className={`${
                            active
                              ? "bg-error text-error-content"
                              : "text-error"
                          } flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete for me
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        )}
      </div>
    </motion.div>
  );
};


// -----------------------------
// Typing dots small helper
// -----------------------------
const TypingDots = ({ size = 8 }) => (
  <div className="flex items-center gap-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        initial={{ y: 0, opacity: 0.6 }}
        animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.12 }}
        className="bg-current rounded-full"
        style={{ width: size, height: size, display: "inline-block" }}
      />
    ))}
  </div>
);

// -----------------------------
// Main ChatPage component
// -----------------------------
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
  const [previewFile, setPreviewFile] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [chatView, setChatView] = useState("chats");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isGroupControlOpen, setIsGroupControlOpen] = useState(false);
  const [confirmation, setConfirmation] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const { theme, toggleTheme } = useTheme();

  // --- Helper Functions ---
  const handleCloseConfirmation = () => setConfirmation({ ...confirmation, isOpen: false });
  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }) : "";
  const otherUserFromChat = (chat) => chat?.users?.find((u) => u._id !== (user?._id || user?.id)) || null;

  const mapServerMsgToUI = useCallback((m) => {
    const senderId = m?.sender?._id || m?.sender;
    const currentUserId = user?._id || user?.id;
    return {
      id: m._id || Date.now().toString(),
      content: m.content || "",
      timestamp: m.createdAt ? formatTime(m.createdAt) : formatTime(new Date()),
      isOwn: senderId === currentUserId,
      file: m.file || null,
      raw: m,
    };
  }, [user]);

  const onEmojiClick = (emojiObject) => { setNewMessage((prev) => prev + emojiObject.emoji); setShowEmojiPicker(false); };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) setShowEmojiPicker(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ SETUP SOCKET CONNECTION (only once)
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!user || !userId) return;

    socketRef.current = io(ENDPOINT, { 
      withCredentials: true, 
      reconnection: true, 
      reconnectionDelay: 1000, 
      reconnectionAttempts: 5, 
      timeout: 20000 
    });

    socketRef.current.emit("setup", user);
    socketRef.current.on("connect", () => console.log("✅ Socket connected:", socketRef.current.id));

    return () => { 
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // ✅ SETUP MESSAGE LISTENER (only once, uses ref so doesn't re-create)
  useEffect(() => {
    if (!socketRef.current) return;

    const onMessageReceived = (newMsgReceived) => {
      console.log("📨 Message received event:", newMsgReceived);
      
      if (!newMsgReceived || !newMsgReceived.chat) {
        console.warn("⚠️ Invalid message or chat:", newMsgReceived);
        return;
      }
      
      const currentChatId = selectedChatCompareRef.current?._id;
      const messageChatId = newMsgReceived.chat?._id || newMsgReceived.chat;
      
      console.log("Current chat:", currentChatId, "Message chat:", messageChatId);
      
      if (!currentChatId || currentChatId.toString() !== messageChatId.toString()) {
        console.log("Message is not for current chat, ignoring");
        return;
      }
      
      console.log("✅ Message is for current chat, adding to state");
      
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === newMsgReceived._id);
        if (messageExists) {
          console.log("Message already exists, skipping duplicate");
          return prev;
        }
        const mappedMsg = mapServerMsgToUI(newMsgReceived);
        console.log("Adding message:", mappedMsg);
        return [...prev, mappedMsg];
      });
    };

    socketRef.current.on("message received", onMessageReceived);

    return () => { 
      socketRef.current?.off("message received", onMessageReceived);
    };
  }, [mapServerMsgToUI]);

  // ✅ SETUP TYPING LISTENERS (separate from message listener)
  useEffect(() => {
    if (!socketRef.current) return;

    const onTyping = (chatId) => {
      console.log("User typing in:", chatId);
      if (selectedChat && selectedChat._id === chatId) setOtherTyping(true);
    };
    
    const onStopTyping = (chatId) => {
      console.log("User stopped typing in:", chatId);
      if (selectedChat && selectedChat._id === chatId) setOtherTyping(false);
    };

    socketRef.current.on("typing", onTyping);
    socketRef.current.on("stop typing", onStopTyping);

    return () => {
      socketRef.current?.off("typing", onTyping);
      socketRef.current?.off("stop typing", onStopTyping);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!user?.token) return;
    axios.get(`${ENDPOINT}/api/chat`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(({ data }) => {
        setChats(Array.isArray(data) ? data : []);
        const savedId = localStorage.getItem("selectedChatId");
        if (savedId && Array.isArray(data)) {
          const found = data.find((c) => c._id === savedId);
          if (found) setSelectedChat(found);
          localStorage.removeItem("selectedChatId");
        }
      })
      .catch((err) => setChats([]));
  }, [user?.token]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        if (!user?.token) return;
        const res = await axios.get(`${ENDPOINT}/api/friends/list`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFriends(res.data.friends || []);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [user?.token]);

  useEffect(() => {
    if (!selectedChat || !user?.token) { setMessages([]); selectedChatCompareRef.current = null; return; }
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`${ENDPOINT}/api/message/${selectedChat._id}`, { headers: { Authorization: `Bearer ${user.token}` } });
        setMessages(Array.isArray(data) ? data.map(mapServerMsgToUI) : []);
        if (socketRef.current) socketRef.current.emit("join chat", selectedChat._id);
        selectedChatCompareRef.current = selectedChat;
      } catch (err) { setMessages([]); }
    };
    fetchMessages();
  }, [selectedChat, user?.token, mapServerMsgToUI]);

  useEffect(() => {
    const timer = setTimeout(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, 120);
    return () => clearTimeout(timer);
  }, [messages, otherTyping]);

  const sendMessage = async (messageData = {}) => {
    const isTextMessage = messageData.content && messageData.content.trim();
    const isFileMessage = messageData.file;
    if ((!isTextMessage && !isFileMessage) || !selectedChat || sending || !user?.token) return;

    try {
      setSending(true);
      // optimistic push
      const optimistic = { id: `tmp_${Date.now()}`, content: isTextMessage ? messageData.content.trim() : "", timestamp: formatTime(new Date().toISOString()), isOwn: true, file: isFileMessage ? messageData.file : null };
      setMessages((prev) => [...prev, optimistic]);

      const payload = { chatId: selectedChat._id, content: isTextMessage ? messageData.content.trim() : "", file: isFileMessage ? messageData.file : undefined };
      const { data } = await axios.post(`${ENDPOINT}/api/message`, payload, { headers: { Authorization: `Bearer ${user.token}` } });

      setMessages((prev) => {
        const replaced = prev.map((m) => (m.id === optimistic.id ? mapServerMsgToUI(data) : m));
        if (!replaced.some((m) => m.id === data._id)) return replaced.map(m => m.id === optimistic.id ? mapServerMsgToUI(data) : m).concat();
        return replaced;
      });

      // Don't emit "new message" - the backend already handles this via socket in messageController.js
      // The message will be received via the "message received" socket event

      if (isTextMessage) setNewMessage("");
    } catch (err) {
      console.error("sendMessage error:", err?.response?.data || err.message);
    } finally {
      setSending(false);
    }
  };

 const deleteMessage = (messageId) => {
  setConfirmation({
    isOpen: true,
    title: "Delete Message",
    message: "Do you want to delete this message for yourself or for everyone?",
    onConfirm: async () => {}, // We'll handle inside custom buttons
  });

  // dynamically build modal buttons instead of single confirm
  setConfirmation({
    isOpen: true,
    title: "Delete Message",
    message: "Choose how you want to delete this message:",
    onConfirm: null,
    customActions: [
      {
        label: "Delete for Me",
        style: "btn btn-warning",
        async onClick() {
          await axios.put(`${ENDPOINT}/api/message/soft/${messageId}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
          handleCloseConfirmation();
        },
      },
      {
        label: "Delete for Everyone",
        style: "btn btn-error",
        async onClick() {
          await axios.delete(`${ENDPOINT}/api/message/${messageId}`, { headers: { Authorization: `Bearer ${user.token}` } });
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
          handleCloseConfirmation();
        },
      },
    ],
  });
};

const deleteChat = (chatId) => {
  setConfirmation({
    isOpen: true,
    title: "Delete Chat",
    message: "Do you want to hide this chat for yourself or delete it for everyone?",
    customActions: [
      {
        label: "Hide for Me",
        style: "btn btn-warning",
        async onClick() {
          try {
            await axios.put(
              `${ENDPOINT}/api/chat/soft/${chatId}`,
              {},
              { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setChats((prev) => prev.filter((c) => c._id !== chatId));
            if (selectedChat?._id === chatId) setSelectedChat(null);
          } catch (err) {
            console.error("Soft delete (hide) failed:", err);
          } finally {
            handleCloseConfirmation();
          }
        },
      },
      {
        label: "Delete for Everyone",
        style: "btn btn-error",
        async onClick() {
          try {
            await axios.delete(`${ENDPOINT}/api/chat/${chatId}`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            setChats((prev) => prev.filter((c) => c._id !== chatId));
            if (selectedChat?._id === chatId) setSelectedChat(null);
          } catch (err) {
            console.error("Hard delete failed:", err);
          } finally {
            handleCloseConfirmation();
          }
        },
      },
    ],
  });
};


  const handleGroupUpdate = async (updatedData) => {
    try {
      const { data } = await axios.put(`${ENDPOINT}/api/chat/group/${selectedChat._id}`, updatedData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSelectedChat(data);
      setChats((prev) => prev.map((c) => (c._id === data._id ? data : c)));
      setIsGroupControlOpen(false);
    } catch (err) {
      console.error("Error updating group:", err);
    }
  };

  const handleGroupLeave = async () => {
    try {
      await axios.put(`${ENDPOINT}/api/chat/group/leave/${selectedChat._id}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setChats((prev) => prev.filter((c) => c._id !== selectedChat._id));
      setSelectedChat(null);
      setIsGroupControlOpen(false);
    } catch (err) {
      console.error("Error leaving group:", err);
    }
  };

  const createGroupChat = async ({ name, users }) => {
    try {
      const { data } = await axios.post(`${ENDPOINT}/api/chat/group`, { name, users: JSON.stringify(users) }, { headers: { Authorization: `Bearer ${user.token}` } });
      setChats((prev) => [data, ...prev]);
      setSelectedChat(data);
      setChatView("groups");
      setIsGroupModalOpen(false);
      if (socketRef.current) {
        try { socketRef.current.emit("group created", data); } catch (e) { console.warn("Socket emit failed (group created):", e); }
      }
    } catch (err) { console.error("Failed to create group chat:", err); }
  };

  const handleFileSelectAndUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(`${ENDPOINT}/api/upload/file`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${user.token}` } });
      if (data.success && data.file) {
        await sendMessage({ file: data.file });
      }
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const emitTyping = () => {
    if (!selectedChat || !socketRef.current) return;
    socketRef.current.emit("typing", selectedChat._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { if (socketRef.current) socketRef.current.emit("stop typing", selectedChat._id); }, 1500);
  };

  if (!user || (!user._id && !user.id)) {
    return (<div className="h-screen flex items-center justify-center bg-base-300 text-base-content">Loading...</div>);
  }

  const isChatSelected = !!selectedChat;
  const other = isChatSelected && !selectedChat.isGroupChat ? otherUserFromChat(selectedChat) : null;
  const chatDisplayName = isChatSelected ? (selectedChat.isGroupChat ? selectedChat.chatName : other?.name) : "Select Chat";
  const chatDisplayPic = isChatSelected ? (selectedChat.isGroupChat ? (selectedChat.profilePic || "/group-avatar.png") : other?.profilePic) : "/default-avatar.png";
  const filteredChats = chats.filter((chat) => chatView === "groups" ? chat.isGroupChat : !chat.isGroupChat);

  // GroupControlModal definition
  const GroupControlModal = ({
    isOpen,
    onClose,
    group,
    friends,
    onUpdate,
    onLeave,
  }) => {
    const [name, setName] = useState(group?.chatName || "");
    const [profilePic, setProfilePic] = useState(group?.profilePic || "/group-avatar.png");
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [members, setMembers] = useState(group?.users || []);
    const [removing, setRemoving] = useState({});
    const [adding, setAdding] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      if (isOpen) {
        setName(group?.chatName || "");
        setProfilePic(group?.profilePic || "/group-avatar.png");
        setProfilePicFile(null);
        setMembers(group?.users || []);
        setRemoving({});
        setAdding({});
        setSaving(false);
      }
    }, [isOpen, group]);

    const handleProfilePicChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setProfilePicFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setProfilePic(ev.target.result);
        reader.readAsDataURL(file);
      }
    };

    const handleRemoveMember = (userId) => {
      setMembers((prev) => prev.filter((u) => u._id !== userId));
      setRemoving((prev) => ({ ...prev, [userId]: true }));
    };

    const handleAddMember = (userObj) => {
      setMembers((prev) => [...prev, userObj]);
      setAdding((prev) => ({ ...prev, [userObj._id]: true }));
    };

    // Only show friends not already in group
    const currentMemberIds = members.map((u) => u._id);
    const addableFriends = friends.filter((f) => !currentMemberIds.includes(f._id));
    const currentUserId = user?._id || user?.id;

    const handleSave = async () => {
      setSaving(true);
      let uploadedPic = null;
      if (profilePicFile) {
        // Upload the new profile picture
        const formData = new FormData();
        formData.append("file", profilePicFile);
        try {
          const { data } = await axios.post(`${ENDPOINT}/api/upload/file`, formData, {
            headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${user.token}` },
          });
          if (data.success && data.file) {
            uploadedPic = data.file.url;
          }
        } catch (err) {
          alert("Failed to upload profile picture.");
        }
      }
      // Prepare update payload
      const updatePayload = {
        name: name.trim(),
        users: members.map((u) => u._id),
      };
      if (uploadedPic) {
        updatePayload.profilePic = uploadedPic;
      }
      await onUpdate(updatePayload);
      setSaving(false);
    };

    if (!isOpen) return null;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99991] p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-base-100 rounded-lg shadow-xl w-full max-w-lg p-6"
        >
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Users size={22} /> Edit EchoZone
          </h3>
          <div className="flex gap-6 mb-6">
            <div className="flex flex-col items-center">
              <div className="avatar mb-2">
                <div className="w-20 h-20 rounded-full border border-base-300">
                  <img src={profilePic} alt="Group" className="object-cover w-full h-full" />
                </div>
              </div>
              <label className="btn btn-xs btn-outline mt-1">
                Change Picture
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
              </label>
            </div>
            <div className="flex-1">
              <label className="label">
                <span className="label-text">Group Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-4">
            <p className="font-semibold mb-1">Members</p>
            <div className="max-h-36 overflow-y-auto bg-base-200 rounded-lg p-2 space-y-1 scrollbar-thin">
              {members.length > 0 ? members.map((member) => (
                <div key={member._id} className="flex items-center gap-3 p-2 rounded hover:bg-base-300">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img src={member.profilePic || "/default-avatar.png"} alt={member.name} />
                    </div>
                  </div>
                  <span className="flex-1 truncate">{member.name}</span>
                  {member._id !== currentUserId && (
                    <button
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={removing[member._id]}
                    >
                      Remove
                    </button>
                  )}
                  {member._id === currentUserId && (
                    <span className="text-xs opacity-60">(You)</span>
                  )}
                </div>
              )) : (
                <div className="text-xs text-center opacity-60 py-2">No members</div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <p className="font-semibold mb-1">Add Members</p>
            <div className="max-h-24 overflow-y-auto bg-base-200 rounded-lg p-2 space-y-1 scrollbar-thin">
              {addableFriends.length > 0 ? addableFriends.map((f) => (
                <div key={f._id} className="flex items-center gap-3 p-2 rounded hover:bg-base-300">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img src={f.profilePic || "/default-avatar.png"} alt={f.name} />
                    </div>
                  </div>
                  <span className="flex-1 truncate">{f.name}</span>
                  <button
                    className="btn btn-ghost btn-xs text-primary"
                    onClick={() => handleAddMember(f)}
                    disabled={adding[f._id]}
                  >
                    Add
                  </button>
                </div>
              )) : (
                <div className="text-xs text-center opacity-60 py-2">No friends to add.</div>
              )}
            </div>
          </div>
          <div className="modal-action mt-6 flex flex-wrap gap-3 justify-end">
            <button onClick={onClose} className="btn btn-ghost">Close</button>
            <button onClick={onLeave} className="btn btn-warning">Leave Group</button>
            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      {/* ---------------------------
          Main app layout (no modals here)
          --------------------------- */}
      <div className="flex h-screen w-screen bg-base-300 text-base-content overflow-hidden font-sans">
        {/* Sidebar */}
        <aside className="w-96 bg-base-100 flex flex-col transition-all duration-300">
          <div className="p-6 border-b border-base-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Chats</h2>
            <button onClick={() => setIsGroupModalOpen(true)} className="btn btn-primary btn-sm gap-2"><Users size={16} /> EchoZone</button>
          </div>

          <div className="p-3 border-b border-base-200">
            <div className="grid grid-cols-2 gap-2 p-1 bg-base-200 rounded-lg relative">
              <button
                onClick={() => setChatView("chats")}
                className="relative px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
              >
                {chatView === "chats" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-md shadow-md z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                )}
                <span className="relative z-10">Chats</span>
              </button>
              <button
                onClick={() => setChatView("groups")}
                className="relative px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
              >
                {chatView === "groups" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-md shadow-md z-0"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  />
                )}
                <span className="relative z-10">EchoZones</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => {
                const otherP = !chat.isGroupChat ? otherUserFromChat(chat) : null;
                const name = chat.isGroupChat ? chat.chatName : otherP?.name;
                const pic = chat.isGroupChat ? (chat.profilePic || "/group-avatar.png") : otherP?.profilePic;
                const isActive = selectedChat?._id === chat._id;

                return (
                  <div key={chat._id} onClick={() => setSelectedChat(chat)} className={`group relative flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 ${isActive ? "bg-primary/20 text-primary-content" : "hover:bg-base-200"}`}>
                    <div className="avatar">
                      <div className="w-12 rounded-full"><img src={pic || "/default-avatar.png"} alt={name} /></div>
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-semibold">{name}</p>
                      <p className="text-xs opacity-60 truncate">{chat.latestMessage?.content || "No messages yet."}</p>
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Menu as="div" className="relative">
                        <Menu.Button onClick={(e) => e.stopPropagation()} className="btn btn-ghost btn-circle btn-xs"><MoreVertical size={16} /></Menu.Button>
                        <Transition as={React.Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                          <Menu.Items onClick={(e) => e.stopPropagation()} className="absolute right-0 bottom-full z-30 mb-1 w-48 origin-bottom-right rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="p-1">
                              <Menu.Item>{({ active }) => (
                                <button onClick={() => deleteChat(chat._id)} className={`${active ? "bg-error text-error-content" : "text-error"} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                  <Trash2 className="mr-2 h-5 w-5" aria-hidden="true" /> Delete Chat
                                </button>
                              )}</Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-center p-10 opacity-50">{`No ${chatView === "groups" ? "EchoZones" : "chats"} found.`}</div>
            )}
          </div>
        </aside>

        {/* Main chat area */}
        <main className="flex-1 flex flex-col bg-base-200">
          <AnimatePresence>
            {isChatSelected ? (
              <motion.div key={selectedChat._id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col overflow-hidden">
                <header className="p-4 flex items-center justify-between bg-base-100 shadow-sm z-20">
                  <div className="flex items-center gap-4">
                    <div className="avatar relative">
                      <div className="w-12 rounded-full"><img src={chatDisplayPic} alt="avatar" /></div>
                      {!selectedChat.isGroupChat && <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-base-100"></span>}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{chatDisplayName}</h3>
                      {!selectedChat.isGroupChat && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green-500 font-semibold">
                          {otherTyping ? <div className="flex items-center gap-2"><TypingDots /> Typing...</div> : "Online"}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-circle"><Phone size={20} /></button>
                    <button className="btn btn-ghost btn-circle"><Video size={20} /></button>
                    {selectedChat.isGroupChat && (
                      <button onClick={() => setIsGroupControlOpen(true)} className="btn btn-ghost btn-circle">
                        <Info size={20} />
                      </button>
                    )}
                    <Menu as="div" className="relative">
                      <Menu.Button className="btn btn-ghost btn-circle"><MoreVertical size={20} /></Menu.Button>
                      <Transition as={React.Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-base-200 rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                          <div className="p-1">
                            <Menu.Item>{({ active }) => (
                              <button onClick={toggleTheme} className={`${active ? "bg-base-200" : ""} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                {theme === "night" ? <Sun className="mr-2 h-5 w-5" /> : <Moon className="mr-2 h-5 w-5" />}
                                {theme === "night" ? "Light Mode (Winter)" : "Dark Mode (Night)"}
                              </button>
                            )}</Menu.Item>
                          </div>
                          <div className="p-1">
                            <Menu.Item>{({ active }) => (
                              <button onClick={() => deleteChat(selectedChat._id)} className={`${active ? "bg-error text-error-content" : "text-error"} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                <Trash2 className="mr-2 h-5 w-5" aria-hidden="true" /> Delete Chat
                              </button>
                            )}</Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-200">
                  <motion.div initial="hidden" animate="visible" className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} onPreviewClick={setPreviewFile} onDelete={deleteMessage} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 bg-base-100 z-10">
                  <AnimatePresence>
                    {isUploading && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-xs text-center p-2 text-primary">
                        Uploading file, please wait...
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative flex items-center gap-2 bg-base-200 rounded-full p-2 shadow-inner">
                    <div ref={emojiPickerRef} className="relative">
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="btn btn-ghost btn-circle" title="Emoji">
                        <Smile size={22} className="opacity-60" />
                      </button>
                      <AnimatePresence>
                        {showEmojiPicker && (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-full mb-2 z-40">
                            <Picker onEmojiClick={onEmojiClick} theme={theme === 'night' ? 'dark' : 'light'} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <input type="text" placeholder="Type a message..." value={newMessage} onChange={(e) => { setNewMessage(e.target.value); emitTyping(); }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage({ content: newMessage }); } }} className="input w-full bg-transparent focus:outline-none placeholder:text-base-content/50" />

                    <input type="file" ref={fileInputRef} onChange={handleFileSelectAndUpload} style={{ display: "none" }} />
                    <Menu as="div" className="relative">
                      <Menu.Button className="btn btn-ghost btn-circle" title="Attach File"><Paperclip size={22} className="opacity-60" /></Menu.Button>
                      <Transition as={React.Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                        <Menu.Items className="absolute bottom-full right-0 mb-2 w-48 origin-bottom-right rounded-md bg-base-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40">
                          <div className="py-1">
                            <Menu.Item>{({ active }) => (
                              <button onClick={() => fileInputRef.current.click()} className={`${active ? "bg-base-300" : ""} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                <FileText className="mr-2 h-5 w-5" aria-hidden="true" /> Upload a File
                              </button>
                            )}</Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>

                    <button onClick={() => sendMessage({ content: newMessage })} disabled={!newMessage.trim() || sending} className="btn btn-primary btn-circle shadow-lg disabled:bg-base-300">
                      <Send size={20} />
                    </button>
                  </div>
                </footer>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-base-content/50">
                <div className="text-center">
                  <img src="/chat-placeholder.svg" alt="Select a conversation" className="w-64 h-64 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold">Welcome, {user.name}!</h3>
                  <p>Select a conversation to start chatting.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ---------------------------
          Top-level modals (rendered outside main layout)
          --------------------------- */}
      <AnimatePresence>
        {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isGroupModalOpen && <CreateGroupModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} friends={friends} onCreate={createGroupChat} />}
      </AnimatePresence>

      <AnimatePresence>
        {isGroupControlOpen && (
          <GroupControlModal
            isOpen={isGroupControlOpen}
            onClose={() => setIsGroupControlOpen(false)}
            group={selectedChat}
            friends={friends}
            onUpdate={handleGroupUpdate}
            onLeave={handleGroupLeave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmation.isOpen && (
          <ConfirmationModal
            {...confirmation}
            onClose={handleCloseConfirmation}
          />
        )}
      </AnimatePresence>

    </>
  );
}
