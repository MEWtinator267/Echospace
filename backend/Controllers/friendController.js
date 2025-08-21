import mongoose from "mongoose";
import User from "../models/users.js";
import Notification from '../models/notification.js';
import { use } from "react";
import AllUser from '../models/users.js'

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user.id;

    if (!targetUserId || !currentUserId) {
      return res.status(400).json({ message: "Missing user IDs" });
    }

    const trimmedTargetUserId = targetUserId.trim();
    const trimmedCurrentUserId = currentUserId.trim();

    console.log("sendFriendRequest - targetUserId:", trimmedTargetUserId);

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(trimmedTargetUserId)) {
      return res.status(400).json({ message: "Invalid target user ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(trimmedCurrentUserId)) {
      return res.status(400).json({ message: "Invalid current user ID" });
    }

    if (trimmedCurrentUserId === trimmedTargetUserId) {
      return res.status(400).json({ message: "You can't send request to yourself" });
    }

    const targetUser = await User.findById(trimmedTargetUserId);
    const currentUser = await User.findById(trimmedCurrentUserId);

    if (!targetUser) return res.status(404).json({ message: "Target user not found" });
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });

    if (targetUser.friendRequests.includes(trimmedCurrentUserId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    if (targetUser.friends.includes(trimmedCurrentUserId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    targetUser.friendRequests.push(trimmedCurrentUserId);
    await targetUser.save();

    await Notification.create({
      type: 'friend_request',
      sender: trimmedCurrentUserId,
      receiver: trimmedTargetUserId,
    });

    res.status(200).json({ message: "Friend request sent!" });
  } catch (err) {
    console.error("sendFriendRequest error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const currentUserId = req.user.id;

    if (!requesterId || !currentUserId) {
      return res.status(400).json({ message: "Missing user IDs" });
    }

    const trimmedRequesterId = requesterId.trim();
    const trimmedCurrentUserId = currentUserId.trim();

    if (!mongoose.Types.ObjectId.isValid(trimmedRequesterId)) {
      return res.status(400).json({ message: "Invalid requester user ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(trimmedCurrentUserId)) {
      return res.status(400).json({ message: "Invalid current user ID" });
    }

    const currentUser = await User.findById(trimmedCurrentUserId);
    const requesterUser = await User.findById(trimmedRequesterId);

    if (!requesterUser) return res.status(404).json({ message: "Requesting user not found" });
    if (!currentUser) return res.status(404).json({ message: "Current user not found" });

    if (!currentUser.friendRequests.includes(trimmedRequesterId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    currentUser.friends.push(trimmedRequesterId);
    requesterUser.friends.push(trimmedCurrentUserId);

    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== trimmedRequesterId
    );

    await currentUser.save();
    await requesterUser.save();

    await Notification.deleteOne({
      type: 'friend_request',
      sender: trimmedRequesterId,
      receiver: trimmedCurrentUserId,
    });

    res.status(200).json({ message: "Friend request accepted!" });
  } catch (err) {
    console.error("acceptFriendRequest error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.id;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Missing user IDs" });
    }

    const trimmedSenderId = senderId.trim();
    const trimmedReceiverId = receiverId.trim();

    if (!mongoose.Types.ObjectId.isValid(trimmedSenderId)) {
      return res.status(400).json({ message: "Invalid sender user ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(trimmedReceiverId)) {
      return res.status(400).json({ message: "Invalid receiver user ID" });
    }

    const receiver = await User.findById(trimmedReceiverId);
    const sender = await User.findById(trimmedSenderId);

    if (!receiver) return res.status(404).json({ message: "Receiver user not found" });
    if (!sender) return res.status(404).json({ message: "Sender user not found" });

    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== trimmedSenderId
    );
    await receiver.save();

    await Notification.deleteOne({
      type: 'friend_request',
      sender: trimmedSenderId,
      receiver: trimmedReceiverId,
    });

    res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    console.error("rejectFriendRequest error:", err);
    res.status(500).json({ message: "Failed to reject friend request" });
  }
};

// search the user 
export const searchUsers = async (req, res) => {
  const query = req.query.query.trim();

  try {
    let users;

    if (mongoose.Types.ObjectId.isValid(query)) {
      // If query looks like an ObjectId, search by _id or name
      users = await User.find({
        $or: [
          { _id: query },
          { name: { $regex: query, $options: "i" } },
        ],
      }).select("_id name profilePic");
    } else {
      // Otherwise search only by name
      users = await User.find({
        name: { $regex: query, $options: "i" },
      }).select("_id name profilePic");
    }

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
};

// friend counter on the dashboard
export const getFriendCount = async (req, res) => {
  try {
    console.log("req.user from middleware:", req.user);

    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const user = await AllUser.findById(userId).select("friends");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalFriends = Array.isArray(user.friends) ? user.friends.length : 0;
    return res.json({ count: totalFriends });

  } catch (error) {
    console.error("Error fetching friend count:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// the friend list getter
export const getFriendsList = async (req, res) => {
  try {
    console.log("Auth user:", req.user);  // 👈 log here
    const user = await AllUser.findById(req.user.id)
      .populate("friends", "id name email profilePic")
      .select("friends");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ friends: user.friends });
  } catch (error) {
    console.error("Error fetching friends list:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
