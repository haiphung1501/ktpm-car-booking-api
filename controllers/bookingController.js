const Booking = require("../models/booking");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/apiFeatures");

const bookingController = {
  userCreateBooking: catchAsyncError(async (req, res, next) => {
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
  driverAcceptBooking: catchAsyncError(async (req, res, next) => {
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

  driverProgressBooking: catchAsyncError(async (req, res, next) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }

    booking.bookingStatus = "progress";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated to progress successfully",
      booking,
    });
  }),

  driverCompletedBooking: catchAsyncError(async (req, res, next) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }

    booking.bookingStatus = "completed";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated to completed successfully",
      booking,
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

  sendMessageBooking: catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findById(req.params.bookingId);
    const { content, receiver } = req.body;

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }
    if (!message) {
      return next(new ErrorHandler("Please enter message", 400));
    }

    booking.messages.push({
      sender: req.user._id,
      receiver,
      content,
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  }),

  userCancelBooking: catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findById(req.params.bookingId);

    const { cancelReason } = req.body;

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }

    if (booking.bookingStatus !== "pending") {
      return next(new ErrorHandler("Booking is not pending", 400));
    }

    booking.bookingStatus = "cancelled";
    booking.cancelReason = cancelReason;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  }),

  //ADMIN
  getAllBooking: catchAsyncError(async (req, res, next) => {
    resultPerPage = 10; //Default
    if (req.query.limit) {
      resultPerPage = parseInt(req.query.limit);
    }

    const apiFeature = new ApiFeatures(Booking.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);

    const bookings = await apiFeature.query;
    const bookingsCount = await Booking.countDocuments();
    const filteredBookingsCount = bookings.length;

    res.status(200).json({
      success: true,
      bookings,
      bookingsCount,
      resultPerPage,
      filteredBookingsCount,
    });
  }),

  updatePendingBookingToCancelled: async (req, res, next) => {
    const oneHourAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await Booking.updateMany(
      { bookingStatus: "pending", createdAt: { $lte: oneHourAgo } },
      { $set: { bookingStatus: "cancelled" } }
    );
  },
};

module.exports = bookingController;
