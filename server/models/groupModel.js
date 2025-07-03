const mongoose = require("mongoose");

const groupMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  color: {
    type: String,
    default: "#aaa",
  },
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A group must have a name"],
    trim: true,
  },
  members: [groupMemberSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
groupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
