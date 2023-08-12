const express = require("express");
const bookingController = require("../controllers/bookingController.js");
const authController = require("../middlewares/auth.js");
const router = express.Router();

//USER
router.post(
  "/create",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("user", "vip"),
  bookingController.userCreateBooking
);
router.get(
  "/me",
  authController.isAuthenticatedUser,
  bookingController.myUserBookings
);

router.get(
  "/driver/me",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("driver"),
  bookingController.myDriverBookings
);
//ADMIN
router.get(
  "/all",
  authController.isAuthenticatedUser,
  bookingController.getAllBooking
);

// -- WITH ID --
router.put(
  "/msg/:bookingId",
  authController.isAuthenticatedUser,
  bookingController.sendMessageBooking
);
router.put(
  "/cancel/:bookingId",
  authController.isAuthenticatedUser,
  bookingController.userCancelBooking
);

//DRIVER
router.put(
  "/driver/accept/:bookingId",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("driver"),
  bookingController.driverAcceptBooking
);

router.put(
  "/driver/progress/:bookingId",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("driver"),
  bookingController.driverProgressBooking
);

router.put(
  "/driver/completed/:bookingId",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("driver"),
  bookingController.driverCompletedBooking
);

router.get(
  "/:bookingId",
  authController.isAuthenticatedUser,
  bookingController.getDetailBooking
);

router.put(
  "/review/:bookingId",
  authController.isAuthenticatedUser,
  authController.authorizeRoles("user"),
  bookingController.userCreateReview
);

module.exports = router;
