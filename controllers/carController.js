const Car = require("../models/car");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

const carController = {
  createCar: catchAsyncError(async (req, res, next) => {
    const { model, color, type, licensePlate, capacity } = req.body;
    if (!model || !color || !type || !licensePlate || !capacity) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    const existingCar = await Car.findOne({ licensePlate });
    if (existingCar) {
      return next(new ErrorHandler("Car already exists", 400));
    }
    const car = await Car.create({
      model,
      color,
      type,
      licensePlate,
      capacity,
    });
    res.status(200).json({
      success: true,
      message: "Car created successfully",
      car,
    });
  }),
};
