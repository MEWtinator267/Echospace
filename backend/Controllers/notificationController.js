import Notification from '../models/notification.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    console.log("🔔 getNotifications called for userId:", userId);
    
    if (!userId) {
      console.warn("⚠️ No userId found in req.user");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const notifications = await Notification.find({ receiver: userId })
      .populate('sender', 'name profilePic email')
      .sort({ createdAt: -1 });

    console.log("📬 Found notifications:", notifications.length);
    
    if (notifications.length === 0) {
      console.log("   No notifications found for this user");
    }

    const formatted = notifications.map(n => {
      console.log("   Notification:", { type: n.type, sender: n.sender?.name, senderId: n.sender?._id });
      return {
        _id: n._id,
        senderName: n.sender?.name || "Unknown User",
        senderId: n.sender?._id,
        senderProfilePic: n.sender?.profilePic,
        type: n.type,
        createdAt: n.createdAt,
      };
    });

    res.json({ notifications: formatted });
  } catch (err) {
    console.error("❌ Error getting notifications:", err);
    res.status(500).json({ message: "Error getting notifications", error: err.message });
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
