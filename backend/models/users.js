import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "", // Optional, shown as Hidden in UI
    },

    location: {
      type: String,
      default: "Unknown", // Shown in profile
    },

    profilePic: {
      type: String,
      default: "https://placehold.co/200x200?text=User", // Placeholder image
    },

    password: {
      type: String,
      required: true,
      select: false, // don't return on queries unless explicitly asked
    },

    // ✅ Friend system
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "AllUser" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "AllUser" }],

    // Meta
    joinedOn: {
      type: Date,
      default: Date.now, // Used in 'Member Since'
    },
  },
  {
    timestamps: true,
    collection: "allusers" // Adds createdAt and updatedAt automatically
  }
);

// 👇 "AllUser" is your current model name
const User = mongoose.model("AllUser", userSchema);

export default User;
