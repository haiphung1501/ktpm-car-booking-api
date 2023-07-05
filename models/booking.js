const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  carType: {
    type: String,
    enum: ["car", "motorbike", "bus"],
    default: "car",
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
  },
  pickupLocation: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
  destination: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
  pickupTime: {
    type: Date,
  },
  dropOffTime: {
    type: Date,
  },
  bookingStatus: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "progress",
      "rejected",
      "cancelled",
      "completed",
    ],
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "cancelled", "refunded"],
  },
  paymentMethod: {
    type: String,
  },
  //METER
  distance: {
    type: Number,
  },
  //VND
  price: {
    type: Number,
  },
  //SECOND
  duration: {
    type: Number,
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
