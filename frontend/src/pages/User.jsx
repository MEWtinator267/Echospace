// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../Utils/UserContext.jsx";
import { Users, Search, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

const dashboardBg =
  "https://res.cloudinary.com/dpki2sd5o/image/upload/v1754573098/joe-woods-4Zaq5xY5M_c-unsplash_wcuzb5.jpg";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [searchValue, setSearchValue] = useState("");
  const [userId, setUserId] = useState("Loading...");
  const [totalFriends, setTotalFriends] = useState(0);
  const [friendsList, setFriendsList] = useState([]);
  const [showFriendsPanel, setShowFriendsPanel] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    console.log("[Dashboard] mounted"); // debug: shows in devtools
    if (user) setUserId(user.id || user._id || "Unavailable");
    else setUserId("Unavailable");
  }, [user]);

  // fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        if (!user?.token) return;
        const res = await axios.get("/api/friends/list", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFriendsList(res.data.friends || []);
      } catch (error) {
        console.error("[Dashboard] fetchFriends error:", error);
      }
    };
    fetchFriends();
  }, [user?.token]);

  useEffect(() => {
    const handleCount = async () => {
      try {
        if (!user?.token) return;
        const res = await axios.get("/api/user/count", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTotalFriends(res.data.count || 0);
      } catch (error) {
        console.error("[Dashboard] friend count error:", error);
      }
    };
    handleCount();
  }, [user?.token]);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    try {
      const res = await axios.get(`/api/friends/search?query=${encodeURIComponent(searchValue)}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.data || res.data.length === 0) {
        toast.warn("User not found.");
        return;
      }
      const foundUser = res.data[0];
      if (foundUser._id === userId) {
        toast.info("You cannot add yourself.");
        return;
      }
      await axios.post("/api/friends/send", { targetUserId: foundUser._id }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success(`Friend request sent to ${foundUser.name}`);
      setSearchValue("");
      setShowSearch(false);
    } catch (err) {
      console.error("[Dashboard] handleSearch error:", err?.response?.data || err?.message);
      toast.error("Error sending friend request.");
    }
  };

  const handleStartChat = async (friendId) => {
    try {
      if (!user?.token) return;
      const { data } = await axios.post("/api/chat", { userId: friendId }, { headers: { Authorization: `Bearer ${user.token}` } });
      localStorage.setItem("selectedChatId", data._id);
      toast.success("Chat started");
      navigate("/user/chat");
    } catch (error) {
      console.error("[Dashboard] start chat error:", error);
      toast.error("Failed to start chat.");
    }
  };

  const handleGoToChat = () => navigate("/user/chat");

  return (
    <div className="relative min-h-screen bg-base-200 text-base-content">
      {/* DEBUG BANNER - you can't miss this */}
      <div className="w-full bg-red-600 text-white p-2 text-center font-bold z-50">
        DEBUG: If you see this banner, this Dashboard component is loaded ✅
      </div>

      {/* Fixed background image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url('${dashboardBg}')`, backgroundAttachment: "fixed" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-6 pb-24">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-base-100 rounded-2xl overflow-hidden shadow-lg border border-base-300">
          <div className="h-36 bg-gradient-to-r from-pink-600 via-green-400 to-blue-500" />
          <div className="px-8 pb-8 -mt-12 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-full ring ring-primary overflow-hidden">
                <img src={user?.profilePic || "https://placehold.co/120x120?text=User"} alt="profile" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{user?.name || "User"}</h2>
                <div className="text-sm text-base-content/70 mt-1">
                  ID: <span className="font-mono">{userId}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-base-content/60">Friends</div>
              <div className="text-2xl font-semibold">{totalFriends}</div>
              <div className="mt-4">
                <button onClick={handleGoToChat} className="btn btn-primary">
                  <MessageCircle size={16} /> &nbsp; Go to Chat
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left: Connect Card (spans 2 cols on large) */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-2 bg-base-100 rounded-2xl p-6 shadow border border-base-300">
            <h3 className="text-xl font-semibold mb-3">Connect with Friends</h3>
            <p className="text-sm text-base-content/70 mb-4">Find new friends by searching their User ID or Name.</p>
            <div className="flex gap-3">
              <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Enter User ID or Name" className="input input-bordered flex-1" />
              <button onClick={handleSearch} disabled={!searchValue.trim()} className="btn btn-primary"><Search size={16} /></button>
            </div>
            <div className="mt-6 p-6 rounded-lg bg-base-200 text-sm text-base-content/60">Recent activity / tips area (optional)</div>
          </motion.div>

          {/* Right column: small cards */}
          <div className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-base-100 rounded-2xl p-4 shadow border border-base-300">
              <h4 className="font-semibold">Profile Details</h4>
              <div className="mt-3 text-sm text-base-content/70">Email: <span className="ml-2">••••••••</span></div>
              <button className="btn btn-outline btn-sm mt-4">Show Email</button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-base-100 rounded-2xl p-4 shadow border border-base-300">
              <h4 className="font-semibold">Settings</h4>
              <div className="mt-3">Dark Mode &nbsp; <span className="badge">On</span></div>
            </motion.div>
          </div>
        </div>

        {/* FULL-WIDTH Friends Panel (the big div you asked for) */}
        <motion.div layout className="mt-8 bg-base-100 rounded-2xl shadow-inner border border-base-300 overflow-hidden">
          <button
            onClick={() => setShowFriendsPanel((s) => !s)}
            className="w-full px-6 py-6 bg-base-200 flex items-center justify-between text-lg font-semibold hover:bg-base-300 transition"
          >
            <div className="flex items-center gap-3"><Users /> Friends List</div>
            <div>{showFriendsPanel ? <ChevronUp /> : <ChevronDown />}</div>
          </button>

          <AnimatePresence>
            {showFriendsPanel && (
              <motion.div
                key="friends-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="px-6 py-6 max-h-[520px] overflow-y-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {friendsList.length === 0 ? (
                  <div className="col-span-full text-center text-base-content/60 py-20">No friends yet. Add some!</div>
                ) : (
                  friendsList.map((f, i) => (
                    <motion.div key={f._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-base-200 rounded-lg p-4 flex flex-col justify-between border border-base-300">
                      <div>
                        <div className="font-semibold">{i + 1}. {f.name}</div>
                        <div className="text-xs text-base-content/70 mt-1">Friends since {new Date(f.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="mt-4">
                        <button onClick={() => handleStartChat(f._id)} className="btn btn-sm btn-primary w-full">Chat</button>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <ToastContainer />
    </div>
  );
}
