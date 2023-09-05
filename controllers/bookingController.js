const Booking = require("../models/booking");
const User = require("../models/user");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/apiFeatures");
const axios = require("axios");
const moment = require("moment-timezone");

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

isHighDemand = () => {
  const hour = moment().tz("Asia/Ho_Chi_Minh").hour();
  if (hour >= 6 && hour <= 9) {
    return true;
  }
  if (hour >= 16 && hour <= 12) {
    return true;
  }
  return false;
};

const bookingController = {
  userCreateBooking: catchAsyncError(async (req, res, next) => {
    const { pickupLocation, destination, ...others } = req.body;
    const lat = req.body.pickupLocation.lat;
    const lng = req.body.pickupLocation.lng;
    const pickupAddress = req.body.pickupAddress.fullAddress;
    const destinationAddress = req.body.destinationAddress.fullAddress;

    const userId = req.user._id;

    if (!userId || !pickupLocation || !destination) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    var isPriceIncreased = false;

    // check weather using API
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}`;

    try {
      const weatherResponse = await axios.get(weatherApiUrl);

      // check if res has weather.main == Rain
      const weather = weatherResponse.data;
      console.log(weather);
      if (
        weather.weather[0].main == "Rain" ||
        weather.weather[0].main == "Thunderstorm" ||
        weather.weather[0].main == "Drizzle"
      ) {
        isPriceIncreased = true;
      }
    } catch (err) {
      console.log("Error when fetching weather data", err);
    }

    // Check if pickup address contain "Quận 1" string

    if (
      pickupAddress &&
      (pickupAddress.includes("Quận 1") ||
        pickupAddress.includes("Quận 5") ||
        pickupAddress.includes("Quận 3"))
    ) {
      isPriceIncreased = true;
    }

    if (
      destinationAddress &&
      (destinationAddress.includes("Quận 1") ||
        destinationAddress.includes("Quận 5") ||
        destinationAddress.includes("Quận 3"))
    ) {
      isPriceIncreased = true;
    }

    if (isHighDemand()) {
      isPriceIncreased = true;
    }

    const booking = await Booking.create({
      userId,
      pickupLocation,
      destination,
      isPriceIncreased,
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

    const user = await User.findById(req.user._id);

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
    user.driverAvailable = false;

    await user.save();
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
    const user = await User.findById(req.user._id);

    const booking = await Booking.findById(bookingId).populate(
      "userId driverId"
    );

    if (!booking) {
      return next(new ErrorHandler("Booking not found", 404));
    }

    booking.bookingStatus = "completed";
    booking.dropOffTime = new Date();
    user.driverAvailable = true;

    await user.save();
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

    booking.isReviewed = true;

    let avg = 0;

    driver.driverReviews.forEach((review) => {
      avg += review.rating;
    });

    driver.driverRating = avg / driver.driverReviews.length;

    await driver.save({ validateBeforeSave: false });
    await booking.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Review added successfully",
    });
  }),
};

module.exports = bookingController;
