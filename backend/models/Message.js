// backend/models/messageModel.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "AllUser" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    
    file: {
      url: { type: String },
      name: { type: String },
      mimeType: { type: String },
    },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "AllUser" }],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);