const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authController = {
  isAuthenticatedUser: catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
      return next(new ErrorHandler("Please Login", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);
    next();
  }),

  authorizeRoles: (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(`Roles: ${req.user.role} is not allowed`, 403)
        );
      }
      next();
    };
  },
};

module.exports = authController;
