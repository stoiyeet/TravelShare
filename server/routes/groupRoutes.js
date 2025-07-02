const express = require("express");
const {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroup,
} = require("../controllers/groupController");
const { auth } = require("../controllers/authController");

const router = express.Router();

// Protect all routes - user must be authenticated
router.use(auth);

// Routes
router.route("/")
  .get(getGroups)
  .post(createGroup);

router.route("/:id")
  .get(getGroup)
  .put(updateGroup)
  .delete(deleteGroup);

module.exports = router;
