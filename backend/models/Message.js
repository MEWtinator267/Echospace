import mongoose from "mongoose";
import AllUser from "../models/users.js";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "AllUser" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
