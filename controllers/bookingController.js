const Booking = require("../models/booking");
const User = require("../models/user");
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
    const { driverLocation } = req.body;

    const booking = await Booking.findById(bookingId).populate(
      "userId driverId"
    );

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }

    if (!driverId || !driverLocation) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    booking.driverId = driverId;
    booking.carId = req.user.car._id;
    booking.driverLocation = driverLocation;
    booking.bookingStatus = "accepted";

    await booking.save();

    const populatedBooking = await Booking.findById(bookingId).populate(
      "userId driverId"
    );

    res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      booking: populatedBooking,
    });
  }),

  driverProgressBooking: catchAsyncError(async (req, res, next) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate(
      "userId driverId"
    );

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }

    booking.bookingStatus = "progress";
    booking.pickupTime = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated to progress successfully",
      booking,
    });
  }),

  driverCompletedBooking: catchAsyncError(async (req, res, next) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate(
      "userId driverId"
    );

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }

    booking.bookingStatus = "completed";
    booking.dropOffTime = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking status updated to completed successfully",
      booking,
    });
  }),

  myUserBookings: catchAsyncError(async (req, res, next) => {
    resultPerPage = 100; //Default
    if (req.query.limit) {
      resultPerPage = parseInt(req.query.limit);
    }
    const apiFeature = new ApiFeatures(
      Booking.find({
        userId: req.user._id,
      }).populate("driverId userId userId.car"),
      req.query
    )
      .search()
      .filter()
      .pagination(resultPerPage);

    const bookings = await apiFeature.query;
    const bookingsCount = await Booking.countDocuments({
      userId: req.user._id,
    });
    const filteredBookingsCount = bookings.length;

    res.status(200).json({
      success: true,
      bookings,
      bookingsCount,
      filteredBookingsCount,
    });
  }),

  myDriverBookings: catchAsyncError(async (req, res, next) => {
    resultPerPage = 10; //Default
    if (req.query.limit) {
      resultPerPage = parseInt(req.query.limit);
    }
    const apiFeature = new ApiFeatures(
      Booking.find({
        driverId: req.user._id,
      }).populate("driverId userId userId.car"),
      req.query
    )
      .search()
      .filter()
      .pagination(resultPerPage);

    const bookings = await apiFeature.query;
    const bookingsCount = await Booking.countDocuments({
      driverId: req.user._id,
    });
    const filteredBookingsCount = bookings.length;

    res.status(200).json({
      success: true,
      bookings,
      bookingsCount,
      filteredBookingsCount,
    });
  }),

  sendMessageBooking: catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findById(req.params.bookingId);
    const { content } = req.body;

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }
    if (!content) {
      return next(new ErrorHandler("Please enter message", 400));
    }

    let sender, receiver;

    if (req.user.role === "user") {
      sender = req.user._id;
      receiver = booking.driverId;
    } else if (req.user.role === "driver") {
      sender = req.user._id;
      receiver = booking.userId;
    } else {
      return next(new ErrorHandler("Invalid role", 400));
    }

    booking.messages.push({
      sender,
      receiver,
      content,
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      messages: booking.messages,
    });
  }),

  userCancelBooking: catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findById(req.params.bookingId).populate(
      "userId driverId driverId.car"
    );

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
    resultPerPage = 100; //Default
    if (req.query.limit) {
      resultPerPage = parseInt(req.query.limit);
    }

    const apiFeature = new ApiFeatures(
      Booking.find().populate("userId driverId driverId.car"),
      req.query
    )
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

  getDetailBooking: catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findById(req.params.bookingId).populate(
      "userId driverId driverId.car"
    );
    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }
    res.status(200).json({
      success: true,
      booking,
    });
  }),

  userCreateReview: catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }

    if (booking.bookingStatus !== "completed") {
      return next(new ErrorHandler("Booking is not completed", 400));
    }

    const driver = await User.findById(booking.driverId);
    const { rating, comment } = req.body;
    const review = {
      booking: booking._id,
      user: req.user._id,
      name: req.user.displayName,
      rating: Number(rating),
      comment,
    };

    driver.driverReviews.push(review);
    driver.driverNumOfReviews = driver.driverReviews.length;

    let avg = 0;

    driver.driverReviews.forEach((review) => {
      avg += review.rating;
    });

    driver.driverRating = avg / driver.driverReviews.length;

    await driver.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Review added successfully",
    });
  }),
};

module.exports = bookingController;
