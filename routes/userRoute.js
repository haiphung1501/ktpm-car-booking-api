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

//Todo: will be removed in the future, testing purpose only
router.get("/check", authController.isAuthenticatedUser, (req, res) => {
  console.log(req.user);
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
