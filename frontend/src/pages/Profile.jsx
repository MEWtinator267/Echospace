import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../components/ThemeContext";
import { toast } from "react-toastify";

const dashboardBg =
  "https://res.cloudinary.com/djjq6nbcn/image/upload/v1753623654/samples/cup-on-a-table.jpg";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const username = user?.name || "User";
  const userId = user?._id || "Unavailable";
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userId);
    toast.success("User ID copied to clipboard!");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("http://localhost:8000/auth/upload-avatar", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (data.success) {
  toast.success("Avatar updated!");

  const updatedUser = { ...user, profilePic: data.profilePic };
  localStorage.setItem("user", JSON.stringify(updatedUser));
  setUser(updatedUser); // if user is stored in state

      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeContext />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate("/")}
          className="btn btn-ghost btn-circle"
          aria-label="Back to Dashboard"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      </div>

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

      {/* Content */}
      <div className="relative z-10 min-h-screen backdrop-blur-none bg-base-200/60 flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          {/* Profile Header */}
          <div className="bg-base-100 rounded-2xl px-8 py-8 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture with Upload Button */}
              <div className="avatar relative">
                <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  <img
                    src={user?.profilePic || "https://placehold.co/200x200?text=User"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Upload Icon */}
                <label
                  htmlFor="avatarUpload"
                  className="absolute bottom-2 right-2 bg-base-100 p-2 rounded-full shadow cursor-pointer hover:bg-primary hover:text-white transition-all"
                  title="Upload Avatar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h3m10-3v-1a2 2 0 00-2-2h-3M12 12v-7m0 0L9 8m3-3l3 3" />
                  </svg>
                  <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{username}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-base-content/70">
                  <span className="font-mono text-base break-all">ID: {userId}</span>
                  <button
                    className="btn btn-xs btn-outline btn-square"
                    onClick={copyToClipboard}
                    aria-label="Copy User ID"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8l6 6v8a2 2 0 01-2 2h-2M8 16v2a2 2 0 002 2h6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="bg-base-100 rounded-2xl px-8 py-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Contact Information
              </h2>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-base-content/80">Email</span>
                  </div>
                  {showPrivateInfo ? (
                    <span className="text-base-content">{user.email}</span>
                  ) : (
                    <span className="text-base-content/60">Hidden</span>
                  )}
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span className="text-base-content/80">Phone</span>
                  </div>
                  <span className="text-base-content/60">Hidden</span>
                </div>

                {/* Location */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span className="text-base-content/80">Location</span>
                  </div>
                  <span className="text-base-content">Unknown</span>
                </div>

                <button
                  onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                  className="btn btn-outline btn-sm w-full mt-4"
                >
                  {showPrivateInfo ? "Hide" : "Show"} Private Info
                </button>
              </div>
            </div>

            {/* Account Detail */}
            <div className="bg-base-100 rounded-2xl px-8 py-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Account Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base-content/80">Member Since</span>
                  <span className="text-base-content">Jan 15, 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
