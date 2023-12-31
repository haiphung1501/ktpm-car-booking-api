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
  "/update",
  authController.isAuthenticatedUser,
  userController.updateUserProfile
);

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
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUserById);
router.put("/delete/:id", userController.deleteUserById);

module.exports = router;
