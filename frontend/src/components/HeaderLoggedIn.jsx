import React, { useContext, useEffect, useState } from 'react';
import ThemeContext from './ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function HeaderLoggedIn() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications", err);
      // Removed alert for better UX
    }
  };

  const acceptFriendRequest = async (notificationId, requesterId) => {
    try {
      await axios.post(
        `/api/friends/accept`,
        { requesterId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      alert("Friend request accepted!");
    } catch (err) {
      console.error("Error accepting friend request", err);
      alert("Failed to accept friend request.");
    }
  };

  const rejectFriendRequest = async (notificationId, senderId) => {
    try {
      await axios.post(
        `/api/friends/reject`,
        { senderId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      alert("Friend request rejected.");
    } catch (err) {
      console.error("Error rejecting friend request", err);
      alert("Failed to reject friend request.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="w-full">
      <nav>
        {/* ✅ FIX: Reduced height from h-20 to h-16 for a more compact look */}
        <div className="navbar bg-base-100 shadow-sm h-20 px-4">
          <div className="navbar-start min-w-[220px]">
            <a className="text-xl font-bold cursor-pointer" onClick={() => navigate('/user')}>
              EchoSpace
            </a>
          </div>

          <div className="navbar-end flex items-center gap-4 pr-4">
            {/* Notification Dropdown */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <div className="indicator">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-base-content hover:text-primary transition"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="badge badge-xs badge-primary indicator-item" />
                  )}
                </div>
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content menu p-4 shadow bg-base-100 rounded-box w-80 mt-3 z-[1] space-y-2"
              >
                <li className="font-semibold text-base-content">Notifications</li>

                {notifications.length === 0 ? (
                  <li><span className="text-sm">🎉 No new notifications</span></li>
                ) : (
                  notifications.map((notif) => (
                    <li
                      key={notif._id}
                      className="text-sm border p-2 rounded space-y-2"
                    >
                      <div>👤 <strong>{notif.senderName}</strong> sent a friend request</div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => acceptFriendRequest(notif._id, notif.senderId)}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-xs btn-error text-white"
                          onClick={() => rejectFriendRequest(notif._id, notif.senderId)}
                        >
                          Reject
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Profile Dropdown */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img src={loggedInUser?.profilePic || "https://placehold.co/100x100?text=User"} alt="Profile" />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content p-4 shadow bg-base-100 rounded-box w-56 z-10 space-y-3 mt-3"
              >
                <li className="flex justify-center">
                  <label className="flex items-center gap-2 cursor-pointer" htmlFor="theme-toggle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                    </svg>
                    <input
                      type="checkbox"
                      id="theme-toggle"
                      className="toggle theme-controller"
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  </label>
                </li>
                <li><button onClick={handleLogout} className="btn btn-error btn-sm w-full text-white">Logout</button></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default HeaderLoggedIn;