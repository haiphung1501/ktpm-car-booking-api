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
  driverLocation: {
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
  pickupAddress: {
    name: {
      type: String,
    },
    fullAddress: {
      type: String,
    },
  },
  destinationAddress: {
    name: {
      type: String,
    },
    fullAddress: {
      type: String,
    },
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
    default: "pending",
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
  tipping: {
    type: Number,
  },
  //SECOND
  duration: {
    type: Number,
  },
  //FOR USER
  cancelReason: {
    type: String,
  },
  currentTime: {
    type: Date,
    default: Date.now(),
  },
  isReviewed: {
    type: Boolean,
    default: false,
  },
  //SOFT DELETE
  isDeleted: {
    type: Boolean,
    default: false,
  },

  //MESSAGE
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      content: {
        type: String,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
