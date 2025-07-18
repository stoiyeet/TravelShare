const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");


exports.updateProfile = async (req, res) => {
  try {
    const { userId, username, avatar, color } = req.body;
    
    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const user = await User.findById(req.user._id);

    
    // Check if username is taken by another user
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser && existingUser.username != user.username) {
      return res.status(400).json({ error: 'Username already taken.' });
    }
        
    user.username = username;
    if (avatar !== undefined) {
      user.avatar = avatar;
    }
    
    await user.save();
    
    const userToReturn = {
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    };
    
    res.status(200).json({
      message: "Profile updated successfully",
      user: userToReturn,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }
    
    const user = await User.findById(req.user._id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAvailableColours = async (req, res) => {
  try {
    // Read files from data/Colours directory
    const coloursDir = path.join(__dirname, '../../public/Colours');    
    const files = fs.readdirSync(coloursDir);
    
    // Filter for .png files and convert to hex colors
    const allColors = files
      .filter(file => file.endsWith('.png'))
      .map(file => '#' + file.replace('.png', ''));
    
    res.status(200).json({
      colors: allColors,
    });
  } catch (err) {
    console.error("Get available colours error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllUsersColors = async (req, res) => {
  try {
    const users = await User.find({}, 'username color');
    const colors = users.map(user => ({ username: user.username}));
    res.status(200).json(colors);
  } catch (err) {
    console.error("Get users colors error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username email color avatar');
    res.status(200).json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
