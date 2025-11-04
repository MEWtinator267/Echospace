import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useUser } from "../Utils/UserContext.jsx";
import {
  User,
  MessageSquare,
  Settings,
  Copy,
  UploadCloud,
  Mail,
  Search,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ENDPOINT = import.meta.env.VITE_API_URL || "https://echospace-backend-z188.onrender.com";

const UnifiedDashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [searchValue, setSearchValue] = useState("");
  const [totalFriends, setTotalFriends] = useState(0);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [friendsList, setFriendsList] = useState([]);
  const [showFriends, setShowFriends] = useState(false);

  // --- Theme ---
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeChange = () => setTheme(theme === "dark" ? "light" : "dark");

  // --- Fetch Friends + Count ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;
      try {
        const [countRes, listRes] = await Promise.all([
          axios.get(`${ENDPOINT}/api/friends/count`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${ENDPOINT}/api/friends/list`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);
        setTotalFriends(countRes.data.count || 0);
        setFriendsList(listRes.data.friends || []);
      } catch (err) {
        console.error("Friend data fetch failed:", err);
      }
    };
    fetchData();
  }, [user?.token]);

  // --- Add Friend ---
  const handleAddFriend = async () => {
    if (!searchValue.trim()) return;
    try {
      const { data } = await axios.get(`${ENDPOINT}/api/friends/search?query=${searchValue}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (data.length === 0) return toast.warn("User not found.");
      const foundUser = data[0];
      if (foundUser._id === (user.id || user._id)) return toast.info("You cannot add yourself.");
      
      console.log("📤 Sending friend request to:", foundUser._id);
      const response = await axios.post(
        `${ENDPOINT}/api/friends/send`,
        { targetUserId: foundUser._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log("✅ Friend request sent:", response.data);
      toast.success(`Friend request sent to ${foundUser.name}`);
      setSearchValue("");
    } catch (err) {
      console.error("❌ Error sending friend request:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Error sending friend request.");
    }
  };

  // --- Avatar Upload ---
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const { data } = await axios.post(`${ENDPOINT}/auth/upload-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (data.success) {
        toast.success("Avatar updated!");
        const updatedUser = { ...user, profilePic: data.profilePic };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      toast.error("Avatar upload failed.");
    }
  };

  const copyToClipboard = () => {
    const userId = user?.id || user?._id || "";
    navigator.clipboard.writeText(userId);
    toast.success("User ID copied!");
  };

  const handleStartChat = async (friendId) => {
    try {
      const { data } = await axios.post(
        `${ENDPOINT}/api/chat`,
        { userId: friendId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      localStorage.setItem("selectedChatId", data._id);
      navigate("/user/chat");
    } catch (err) {
      console.error("❌ Error starting chat:", err.response?.data || err.message);
      toast.error("Failed to start chat.");
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      await axios.delete(`${ENDPOINT}/api/friends/remove/${friendId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success("Friend removed successfully.");
      setFriendsList((prev) => prev.filter((f) => f._id !== friendId));
      setTotalFriends((prev) => prev - 1);
    } catch (err) {
      console.error("❌ Remove friend error:", err.response?.data || err.message);
      toast.error("Failed to remove friend.");
    }
  };

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="min-h-screen w-full bg-base-200 text-base-content overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* --- Hero Banner --- */}
          <motion.div
  variants={itemVariants}
  className="relative h-64 bg-base-300 rounded-2xl shadow-lg overflow-visible "
>
  <img
    src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2940&auto=format&fit=crop"
    alt="Profile banner"
    className="w-full h-full object-cover opacity-60"
  />

  {/* Avatar properly positioned */}
  <div className="absolute -bottom-16 left-10">
    <div className="avatar relative group">
      <div className="w-36 h-36 rounded-full ring-4 ring-base-100 shadow-2xl">
        <img
          src={
            user?.profilePic ||
            `https://ui-avatars.com/api/?name=${user?.name || "U"}&background=random`
          }
          alt="Profile"
          className="object-cover w-full h-full"
        />
      </div>
      <label
        htmlFor="avatarUpload"
        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <UploadCloud size={32} />
        <input
          id="avatarUpload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
      </label>
    </div>
  </div>
</motion.div>


          {/* --- Info Bar --- */}
          <motion.div
            variants={itemVariants}
            className="bg-base-100 rounded-b-2xl shadow-lg pt-24 pb-10 px-10"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">{user?.name}</h1>
                <div className="flex items-center gap-1 text-base-content/60 mt-1">
                  <span className="font-mono text-sm">
                    ID: {user?.id || user?._id || "Unavailable"}
                  </span>
                  <button
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={copyToClipboard}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="stat bg-transparent p-0">
                  <div className="stat-title">Friends</div>
                  <div className="stat-value text-2xl">{totalFriends}</div>
                </div>
                <button
                  onClick={() => navigate("/user/chat")}
                  className="btn btn-primary btn-md"
                >
                  Go to Chat <MessageSquare size={18} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* --- Main Content Grid --- */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
          >
            {/* Left: Search Section */}
            <div className="lg:col-span-2 h-full">
              <div className="bg-base-100 rounded-2xl shadow-lg p-8 min-h-[20rem] flex flex-col items-center justify-center text-center space-y-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <Users size={20} /> Connect with Friends
                  </h2>
                  <p className="text-sm text-base-content/70 mb-4">
                    Find new friends by searching their User ID or Name.
                  </p>
                </div>
                <div className="join w-full">
                  <input
                    type="text"
                    className="input input-bordered join-item w-full text-base"
                    placeholder="Enter User ID or Name"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <button
                    onClick={handleAddFriend}
                    className="btn btn-neutral join-item text-base"
                    disabled={!searchValue.trim()}
                  >
                    <Search size={18} /> Send
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-base-100 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <User size={20} /> Profile Details
                </h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-base-content/70">
                      <Mail size={16} /> Email
                    </span>
                    <span className="font-mono">
                      {showPrivateInfo ? user.email : "••••••••••"}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                    className="btn btn-outline btn-sm w-full mt-4"
                  >
                    {showPrivateInfo ? "Hide" : "Show"} Email
                  </button>
                </div>
              </div>

              <div className="bg-base-100 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <Settings size={20} /> Settings
                </h2>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={theme === "dark"}
                      onChange={handleThemeChange}
                    />
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* --- Friends Dropdown --- */}
          <motion.div
            variants={itemVariants}
            className="mt-10 bg-base-100 rounded-2xl shadow-lg overflow-hidden"
          >
            <button
              onClick={() => setShowFriends((prev) => !prev)}
              className="w-full flex items-center justify-between px-6 py-5 text-xl font-semibold hover:bg-base-200 transition"
            >
              <span>Friends List</span>
              {showFriends ? <ChevronUp /> : <ChevronDown />}
            </button>

            <AnimatePresence>
              {showFriends && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6 space-y-3 overflow-hidden"
                >
                  {friendsList.length > 0 ? (
                    friendsList.map((friend, i) => (
                      <div
                        key={friend._id}
                        className="flex items-center justify-between bg-base-200 rounded-xl px-4 py-3 hover:bg-base-300 transition"
                      >
                        <div>
                          <p className="font-semibold">
                            {i + 1}. {friend.name}
                          </p>
                          <p className="text-xs opacity-70">
                            Friends since{" "}
                            {new Date(friend.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStartChat(friend._id)}
                          >
                            Chat
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => handleRemoveFriend(friend._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-center opacity-70 py-4">
                      No friends yet — add some!
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default UnifiedDashboard;
