const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const cloudinary = require("cloudinary");

const userController = {
  createUser: catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    if (!email || !password) {
      return next(new ErrorHandler("Please enter email & password", 400));
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Email already exists", 400));
    }
    const user = await User.create({
      email,
      password,
    });
    res.status(200).json({
      success: true,
      user,
    });
  }),

  loginUser: catchAsyncError(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email & password", 400));
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
      }

      const isPasswordMatched = await user.comparePassword(password);

      if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
      } else {
        sendToken(user, 200, res);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }),

  logoutUser: catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  }),
};

module.exports = userController;
