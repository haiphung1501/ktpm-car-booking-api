const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["car", "motorbike", "bus"],
    default: "car",
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
  },
  car_verified: {
    type: Boolean,
    default: false,
  },
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
