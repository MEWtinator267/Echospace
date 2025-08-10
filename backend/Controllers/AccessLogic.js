import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/users.js';
import cloudinary from './cloudinary.js';

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({ message: "User already present", success: false });
    }
    const userModel = new UserModel({ name, email, password });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    res.status(201).json({ message: "Signup successful", success: true });
  } catch (error) {
    return res.status(500).json({ message: "Problem in signup", success: false });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(409).json({ message: "User not present", success: false });
    }

    const passwordEqual = await bcrypt.compare(password, user.password);
    if (!passwordEqual) {
      return res.status(403).json({ message: "Password wrong", success: false });
    }

    const jwttoken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: "Login successful",
      success: true,
      token: jwttoken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profilePic: user.profilePic || "https://placehold.co/200x200?text=User"
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Problem in login", success: false });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        resource_type: 'image',
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { profilePic: result.secure_url },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          message: "Avatar uploaded successfully",
          profilePic: result.secure_url,
        });
      }
    );

    stream.end(file.buffer);
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, message: "Server error during avatar upload" });
  }
};

export { signup, login, uploadAvatar };
