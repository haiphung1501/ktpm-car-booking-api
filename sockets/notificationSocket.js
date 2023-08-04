const Booking = require("../models/booking");
const User = require("../models/user");

const setupNotificationSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected to notification socket");

    socket.on("driverAvailable", async (driverId) => {
      socket.join("driverAvailableRoom");
      const driver = await User.findById(driverId);
      console.log("Driver connected to notify room", driver.email);
      if (driver) {
        const newBookings = await Booking.find({
          bookingStatus: "pending",
        }).populate("userId driverId");

        if (newBookings.length > 0) {
          console.log("All pending bookings", newBookings);
          io.to("driverAvailableRoom").emit("newBooking", newBookings);
        }
      } else {
        console.log("Driver not found");
      }
    });

    Booking.watch().on("change", async (change) => {
      if (
        change.operationType === "insert" &&
        change.fullDocument.bookingStatus === "pending"
      ) {
        console.log("run this");
        const newBookings = await Booking.find({
          bookingStatus: "pending",
        }).populate("userId driverId");
        io.emit("newBooking", newBookings);
      }
    });

    // Driver disconnects from new booking notifications when they accept a booking
    socket.on("acceptBooking", (bookingId) => {
      socket.leave("driverAvailableRoom");
      socket.join(bookingId);
      console.log("Driver joined room", bookingId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

const getPendingBookings = async () => {
  return Booking.find({ bookingStatus: "pending" }).populate("userId driverId");
};

module.exports = setupNotificationSocket;
