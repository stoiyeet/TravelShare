// // Single-use script to update existing users with colors based on hardcoded logic
// const dotenv = require("dotenv");
// const mongoose = require("mongoose");
// const User = require("../models/userModel");

// // Load environment variables
// dotenv.config();

// // Connect to MongoDB using the same connection as the server
// async function connectDB() {
//   if (!process.env.MONGODB_URI) {
//     console.error("❌ MONGODB_URI is not defined in .env");
//     process.exit(1);
//   }

//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("✅ Connected to MongoDB");
//   } catch (err) {
//     console.error("❌ MongoDB connection error:", err.message);
//     process.exit(1);
//   }
// }

// const getcolorFromUsername = (username) => {
//   if (!username) return "#aaa";
//   const lower = username.toLowerCase();
//   if (lower.includes("mark")) return "#3a2ef0";
//   if (lower.includes("parth")) return "#1fbf2f";
//   if (lower.includes("damien")) return "#c91a20";
//   if (lower.includes("jad")) return "#b21ee8";
//   if (lower.includes("derek")) return "#d68915";
//   if (lower.includes("tuoyo")) return "#c4c21f";
//   return "#aaa";
// };

// async function updateUsercolors() {
//   try {
//     // Connect to database first
//     await connectDB();
    
//     console.log("Starting user color update...");
    
//     // Get all users
//     const users = await User.find({});
//     console.log(`Found ${users.length} users to update`);
    
//     // Update each user with their color based on username
//     for (const user of users) {
//       const color = getcolorFromUsername(user.username);
//       user.color = color;
//       await user.save();
//       console.log(`Updated ${user.username} with color ${color}`);
//     }
    
//     console.log("All users updated successfully!");
//     process.exit(0);
//   } catch (error) {
//     console.error("Error updating user colors:", error);
//     process.exit(1);
//   }
// }

// updateUsercolors();

//This was run on June 20, 2025
