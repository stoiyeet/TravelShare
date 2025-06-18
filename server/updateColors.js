const mongoose = require("mongoose");
const User = require("./models/userModel");
const { connectDB } = require("./connections/mongoDB");

async function updateColors() {
  try {
    await connectDB();
    console.log("Connected to DB");

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      const color = getColor(user.username);
      user.color = color;
      await user.save();
      console.log(`Updated ${user.username} to color ${color}`);
    }

    console.log("All users updated");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

function getColor(name) {
  if (!name) return "#ccc";
  const lower = name.toLowerCase();
  if (lower.includes("mark")) return "#3a2ef0";
  if (lower.includes("parth")) return "#1fbf2f";
  if (lower.includes("damien")) return "#c91a20";
  if (lower.includes("jad")) return "#b21ee8";
  if (lower.includes("derek")) return "#d68915";
  if (lower.includes("tuoyo")) return "#c4c21f";
  return "#aaa";
}

updateColors();
