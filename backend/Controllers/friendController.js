// controllers/friendController.js

import User from "../models/users.js";
import Notification from '../models/notification.js';

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: "You can't send request to yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (targetUser.friendRequests.includes(currentUserId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    if (targetUser.friends.includes(currentUserId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    targetUser.friendRequests.push(currentUserId);
    await targetUser.save();

await Notification.create({
  type: 'friend_request',
  sender: currentUserId,
  receiver: targetUserId,
});


    res.status(200).json({ message: "Friend request sent!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/friendController.js

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterId);

    if (!requesterUser) return res.status(404).json({ message: "Requesting user not found" });

    if (!currentUser.friendRequests.includes(requesterId)) {
      return res.status(400).json({ message: "No friend request from this user" });
    }

    // Add each other as friends
    currentUser.friends.push(requesterId);
    requesterUser.friends.push(currentUserId);

    // Remove from friendRequests
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== requesterId
    );

    await currentUser.save();
    await requesterUser.save();

    await Notification.deleteOne({
  type: 'friend_request',
  sender: requesterId,
  receiver: currentUserId
});


    res.status(200).json({ message: "Friend request accepted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectFriendRequest = async (req, res) => {
  const { senderId } = req.body;
  const receiverId = req.user.id;

  try {
    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sender from receiver's friendRequests
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== senderId
    );
    await receiver.save();

    await Notification.deleteOne({
  type: 'friend_request',
  sender: senderId,
  receiver: receiverId
});

    res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject friend request" });
  }
};

// controllers/userController.js
export const searchUsers = async (req, res) => {
  const query = req.query.query;
  try {
    const users = await User.find({
      name: { $regex: query, $options: "i" }
    }).select("_id name profilePic");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Search failed" });
  }
};

