import Notification from '../models/notification.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notifications = await Notification.find({ receiver: userId })
      .populate('sender', 'name profilePic')
      .sort({ createdAt: -1 });

    const formatted = notifications.map(n => ({
      _id: n._id,
      senderName: n.sender?.name || "Unknown",
      senderId: n.sender?._id,
      type: n.type,
    }));

    res.json({ notifications: formatted });
  } catch (err) {
    console.error("Error getting notifications:", err);
    res.status(500).json({ message: "Error getting notifications" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ message: 'Notification removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove notification' });
  }
};
