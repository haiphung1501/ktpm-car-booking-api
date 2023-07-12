const Booking = require("../models/booking");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

const bookingController = {
  createBooking: catchAsyncError(async (req, res, next) => {
    const { pickupLocation, destination, ...others } = req.body;

    const userId = req.user._id;

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

  //TODO: IMPROVED IN THE FUTURE
  acceptBooking: catchAsyncError(async (req, res, next) => {
    const { bookingId } = req.params;
    const driverId = req.user._id;
    const { carId, driverLocation } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }

    if (!driverId || !carId || !driverLocation) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    booking.driverId = driverId;
    booking.carId = carId;
    booking.driverLocation = driverLocation;
    booking.bookingStatus = "accepted";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      booking,
    });
  }),

  getAllBooking: catchAsyncError(async (req, res, next) => {
    const bookings = await Booking.find({ isDeleted: false });
    res.status(200).json({
      success: true,
      bookings,
    });
  }),

  myBookings: catchAsyncError(async (req, res, next) => {
    const bookings = await Booking.find({
      userId: req.user._id,
      isDeleted: false,
    });
    res.status(200).json({
      success: true,
      bookings,
    });
  }),
};

module.exports = bookingController;
