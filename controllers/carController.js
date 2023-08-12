const Car = require("../models/car");
const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");

const carController = {
  createCar: catchAsyncError(async (req, res, next) => {
    const { brand, model, color, licensePlate } = req.body;

    if (!model || !color || !brand || !licensePlate) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    const existingCar = await Car.findOne({ licensePlate });
    if (existingCar) {
      return next(new ErrorHandler("Car already exists", 400));
    }

    const car = await Car.create({
      brand,
      model,
      color,
      licensePlate,
    });

    // Driver is the user who created the car
    req.user.cars.push(car._id);
    req.user.car = car._id;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Car created successfully",
      car,
    });
  }),
};

module.exports = carController;
