const Booking = require("../models/booking");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

const bookingController = {
  createBooking: catchAsyncError(async (req, res, next) => {
    const { userId, pickupLocation, destination, ...others } = req.body;

    if (!userId || !pickupLocation || !destination) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    const booking = await Booking.create({
      userId,
      pickupLocation,
      destination,
      ...others,
    });

    res.status(200).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  }),

  getAllBooking: catchAsyncError(async (req, res, next) => {
    const bookings = await Booking.find();
    res.status(200).json({
      success: true,
      bookings,
    });
  }),
};

module.exports = bookingController;
