const express = require("express");
const bookingController = require("../controllers/bookingController.js");
const authController = require("../middlewares/auth.js");
const router = express.Router();

//USER
router.post(
  "/create",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("user", "vip"),
  bookingController.createBooking
);
router.get(
  "/me",
  authController.isAuthenticatedUser,
  bookingController.myBookings
);
router.put(
  "/msg/:bookingId",
  authController.isAuthenticatedUser,
  bookingController.sendMessageBooking
);
router.put(
  "/cancel/:bookingId",
  authController.isAuthenticatedUser,
  bookingController.cancelBooking
);

//DRIVER
router.put(
  "/accept/:bookingId",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("driver"),
  bookingController.acceptBooking
);

//ADMIN
router.get("/all", bookingController.getAllBooking);

module.exports = router;
