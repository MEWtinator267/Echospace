import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "AllUser" }], // ✅ fixed
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "AllUser" }, // ✅ fixed
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
