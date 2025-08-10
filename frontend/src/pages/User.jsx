import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const dashboardBg =
  "https://res.cloudinary.com/dpki2sd5o/image/upload/v1754573098/joe-woods-4Zaq5xY5M_c-unsplash_wcuzb5.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user"));
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [userId, setUserId] = useState("Loading...");

  useEffect(() => {
    // Fetch full user info from backend (with user ID)
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${localUser?.token}`,
          },
        });
        setUserId(res.data._id);
      } catch (err) {
        console.error(err);
        setUserId("Unavailable");
      }
    };
    if (localUser?.token) fetchUser();
  }, [localUser]);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    try {
      const res = await axios.get(`/api/user/search?query=${searchValue}`, {
        headers: {
          Authorization: `Bearer ${localUser.token}`,
        },
      });

      if (res.data.length === 0) {
        toast.warn("User not found.");
        return;
      }

      const foundUser = res.data[0];
      if (foundUser._id === userId) {
        toast.info("You cannot add yourself.");
        return;
      }

      // Send friend request
      await axios.post(
  "/api/friends/send",
  { targetUserId: foundUser._id },
  {
    headers: { Authorization: `Bearer ${localUser.token}` },
  }
);

      toast.success(`Friend request sent to ${foundUser.name}`);
      setSearchValue("");
      setShowSearch(false);
    } catch (err) {
      console.error(err);
      toast.error("Error sending friend request.");
    }
  };

  const handleCancel = () => {
    setSearchValue("");
    setShowSearch(false);
  };

  const handleGoToChat = () => {
    navigate("/user/chat");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 animate-scroll-background bg-base-200/60"
        style={{
          backgroundImage: `url('${dashboardBg}')`,
          backgroundRepeat: "repeat-y",
          backgroundSize: "100% auto",
          backgroundPosition: "0 0",
        }}
      ></div>

      {/* Foreground */}
      <div className="relative z-10 min-h-screen backdrop-blur-none bg-base-200/60 flex items-center justify-center px-4">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl gap-10 items-center justify-center">
          {/* Left Panel */}
          <div className="w-full lg:w-1/2">
            <div className="bg-base-100 rounded-2xl min-h-[520px] flex flex-col items-center justify-center px-8 py-8 text-center">
              <div className="avatar mb-4">
                <div className="w-28 h-28 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={
                      localUser?.profilePic ||
                      "https://placehold.co/100x100?text=User"
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
              </div>
              <h1 className="text-5xl font-bold">
                Welcome, {localUser?.name || "User"}!
              </h1>
              <p className="text-base-content/70 text-lg mt-4">
                Let’s get you started 👋
              </p>

              {/* Display User ID */}
              <p className="text-sm text-base-content/60 mt-2 break-all">
                Your ID: <span className="font-mono">{userId}</span>
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-10">
                <div className="stat bg-base-200 text-base-content rounded-xl shadow-sm">
                  <div className="stat-title">Messages</div>
                  <div className="stat-value text-xl">12</div>
                </div>
                <div className="stat bg-base-200 text-base-content rounded-xl shadow-sm">
                  <div className="stat-title">Friends</div>
                  <div className="stat-value text-xl">8</div>
                </div>
                <div className="stat bg-base-200 text-base-content rounded-xl shadow-sm">
                  <div className="stat-title">Active</div>
                  <div className="stat-value text-xl">5</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-1/2">
            <div className="bg-base-100 rounded-2xl min-h-[520px] flex flex-col justify-center px-8 py-8">
              {!showSearch ? (
                <div className="flex flex-col space-y-6">
                  <button
                    onClick={handleGoToChat}
                    className="btn btn-neutral w-full text-lg px-10 py-4 rounded-xl"
                  >
                    Go to Chat
                  </button>

                  <button
                    onClick={() => setShowSearch(true)}
                    className="btn btn-outline w-full text-lg px-10 py-4 rounded-xl"
                  >
                    Add Friend
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-lg font-medium">
                        Find a friend
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-lg w-full text-lg rounded-xl"
                      placeholder="Enter User ID or Name"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-6">
                    <button
                      onClick={handleSearch}
                      className="btn btn-neutral btn-lg text-lg flex-1 rounded-xl"
                      disabled={!searchValue.trim()}
                    >
                      Search
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn btn-outline btn-lg text-lg rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Dashboard;
