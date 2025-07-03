const Group = require("../models/groupModel");
const User = require("../models/userModel");

// Get all groups for the authenticated user
const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      createdBy: req.user._id
    })
    .populate("members.user", "username email avatar")
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch groups",
    });
  }
};


// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Group name is required",
      });
    }

    // Validate and process members
    const processedMembers = [];

    if (members && Array.isArray(members)) {
      for (const memberData of members) {
        let userId;
        let color = "#000";

        // Handle both username strings and objects with user/color
        if (typeof memberData === "string") {
          // Find user by username
          const user = await User.findOne({ username: memberData });
          if (user) {
            userId = user._id;
          }
        } else if (memberData.user) {
          // Handle object format
          const user = await User.findOne({ username: memberData.user });
          if (user) {
            userId = user._id;
            color = memberData.color || "#000";
          }
        }

        if (userId) {
          processedMembers.push({
            user: userId,
            color: color,
          });
        }
      }
    }

    const newGroup = new Group({
      name: name.trim(),
      members: processedMembers,
      createdBy: req.user._id,
    });

    const savedGroup = await newGroup.save();
    
    // Populate the saved group before returning
    const populatedGroup = await Group.findById(savedGroup._id)
      .populate("members.user", "username email avatar")
      .populate("createdBy", "username email");

    res.status(201).json({
      status: "success",
      data: populatedGroup,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create group",
    });
  }
};

// Update a group
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, members } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "Group not found",
      });
    }

    // Check if user is the creator
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the group creator can update this group",
      });
    }

    // Update name if provided
    if (name && name.trim()) {
      group.name = name.trim();
    }

    // Update members if provided
    if (members && Array.isArray(members)) {
      const processedMembers = [];
      
      // Always keep the creator as the first member
      const creatorMember = group.members.find(member => 
        member.user.toString() === req.user._id.toString()
      );
      if (creatorMember) {
        processedMembers.push(creatorMember);
      } else {
        processedMembers.push({
          user: req.user._id,
          color: "#000",
        });
      }

      for (const memberData of members) {
        let userId;
        let color = "#000";

        if (typeof memberData === "string") {
          const user = await User.findOne({ username: memberData });
          if (user && user._id.toString() !== req.user._id.toString()) {
            userId = user._id;
          }
        } else if (memberData.user) {
          const user = await User.findOne({ username: memberData.user });
          if (user && user._id.toString() !== req.user._id.toString()) {
            userId = user._id;
            color = memberData.color || "#000";
          }
        }

        if (userId) {
          processedMembers.push({
            user: userId,
            color: color,
          });
        }
      }
      group.members = processedMembers;
    }

    const updatedGroup = await group.save();
    
    // Populate the updated group before returning
    const populatedGroup = await Group.findById(updatedGroup._id)
      .populate("members.user", "username email avatar")
      .populate("createdBy", "username email");

    res.status(200).json({
      status: "success",
      data: populatedGroup,
    });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update group",
    });
  }
};

// Delete a group
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "Group not found",
      });
    }

    // Check if user has permission to delete (only creator)
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "Only the group creator can delete this group",
      });
    }

    await Group.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete group",
    });
  }
};

// Get a specific group
const getGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id)
      .populate("members.user", "username email avatar")
      .populate("createdBy", "username email");

    if (!group) {
      return res.status(404).json({
        status: "error",
        message: "Group not found",
      });
    }

    // Check if user has access to this group
    const isMember = group.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );
    const isCreator = group.createdBy._id.toString() === req.user._id.toString();

    if (!isCreator && !isMember) {
      return res.status(403).json({
        status: "error",
        message: "You don't have access to this group",
      });
    }

    res.status(200).json({
      status: "success",
      data: group,
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch group",
    });
  }
};

module.exports = {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroup,
};
