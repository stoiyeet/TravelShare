const express = require("express");
const {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroup,
} = require("../controllers/groupController");
const authController = require("../controllers/authController");

const router = express.Router();

// Protect all routes - user must be authenticated
router.use(authController.auth);

// Routes
router.route("/")
  .get(getGroups)
  .post(createGroup);

router.route("/:id")
  .get(getGroup)
  .put(updateGroup)
  .delete(deleteGroup);

module.exports = router;
