const Booking = require("../models/booking");
const User = require("../models/user");

const setupNotificationSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("driverAvailable", async (driverId) => {
      const driver = await User.findById(driverId);
      if (driver) {
        const newBookings = await Booking.find({ bookingStatus: "pending" });

        if (newBookings.length > 0) {
          socket.emit("newBooking", newBookings);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

module.exports = setupNotificationSocket;
