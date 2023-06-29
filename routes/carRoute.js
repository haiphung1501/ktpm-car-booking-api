const express = require("express");
const carController = require("../controllers/carController.js");
const authController = require("../middlewares/auth.js");
const router = express.Router();

router.post(
  "/register",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("driver"),
  carController.createCar
);

module.exports = router;
