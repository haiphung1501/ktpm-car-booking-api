const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  console.log(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server Error";

  res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message: message,
  });
};
