const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// Apply auth middleware to all routes below

router.use(authController.auth);

router.put("/profile", userController.updateProfile);
router.put("/password", userController.updatePassword);
router.get("/colors", userController.getAllUsersColors);
router.get("/available-colours", userController.getAvailableColours); 


module.exports = router;
