const express = require("express");
const bookingController = require("../controllers/bookingController.js");
const authController = require("../middlewares/auth.js");
const router = express.Router();

router.post(
  "/create",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("user"),
  bookingController.createBooking
);
router.get("/all", bookingController.getAllBooking);

router.put(
  "/accept/:bookingId",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("driver"),
  bookingController.acceptBooking
);

module.exports = router;