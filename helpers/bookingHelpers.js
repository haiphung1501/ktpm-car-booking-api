const Booking = require("../models/booking");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const ApiFeatures = require("../utils/apiFeatures");

const bookingHelper = {
  updatePendingBookingToCancelled: async (req, res, next) => {
    // TODO: decrease time from 1 month to 1 day
    const time = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    await Booking.updateMany(
      { bookingStatus: "pending", createdAt: { $lte: time } },
      { $set: { bookingStatus: "cancelled" } }
    );
  },
};

module.exports = bookingHelper;
