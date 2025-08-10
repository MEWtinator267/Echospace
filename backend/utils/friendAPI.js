// utils/friendAPI.js
import axios from "axios";

export const sendFriendRequest = async (targetUserId, token) => {
  return axios.post(
    "/api/friends/send",
    { targetUserId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const acceptFriendRequest = async (requesterId, token) => {
  return axios.post(
    "/api/friends/accept",
    { requesterId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
