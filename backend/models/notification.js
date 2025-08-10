import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. 'friend_request'
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'AllUser' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'AllUser' },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
