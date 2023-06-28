const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const cloudinary = require("cloudinary");
const emailService = require("../utils/emailService");

const userController = {
  createUser: catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return next(new ErrorHandler("Please enter email & password", 400));
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const otp = Math.random().toString().slice(-6);

    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      email,
      password,
      otp,
      otpExpire,
    });

    await emailService.sendEmail(
      email,
      "OTP Verification",
      `Your OTP for registration is: ${otp}`
    );

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
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

      if (user.verified === false) {
        return next(
          new ErrorHandler("Please verify your email before logging in", 401)
        );
      }

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

  verifyUser: catchAsyncError(async (req, res, next) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("Invalid email", 401));
    }

    if (user.otpExpire < Date.now()) {
      return next(new ErrorHandler("OTP expired", 401));
    }

    if (user.otp !== otp) {
      return next(new ErrorHandler("Invalid OTP", 401));
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified",
    });
  }),

  getUserDetail: catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  }),

  updateUserPassword: catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 401));
    }

    const { oldPassword, newPassword } = req.body;

    const isPasswordMatched = await user.comparePassword(oldPassword);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid password", 401));
    }

    user.password = newPassword;

    await user.save();

    sendToken(user, 200, res);
  }),
};

module.exports = userController;
