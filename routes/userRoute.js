const express = require("express");
const userController = require("../controllers/userController.js");
const authController = require("../middlewares/auth");
const router = express.Router();
const multer = require("multer");

const upload = multer({
  limits: { fieldSize: 25 * 1024 * 1024 },
});

router.post("/register", userController.createUser);

router.post("/login", userController.loginUser);

router.post("/logout", userController.logoutUser);

router.post("/verify", userController.verifyUser);

router.post(
  "/updatepassword",
  authController.isAuthenticatedUser,
  userController.updateUserPassword
);
router.get(
  "/me",
  authController.isAuthenticatedUser,
  userController.getUserDetail
);

//ADMIN
router.get("/all", userController.getAllUsers);

module.exports = router;
