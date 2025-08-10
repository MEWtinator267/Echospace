import Notification from '../models/notification.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ receiver: userId })
      .populate('sender', 'name') // for senderName
      .sort({ createdAt: -1 });

    const formatted = notifications.map(n => ({
      _id: n._id,
      senderName: n.sender.name,
      senderId: n.sender._id,
      type: n.type,
    }));

    res.json({ notifications: formatted });
  } catch (err) {
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
