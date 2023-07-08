const Booking = require("../models/booking");

const setupBookingSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("createBooking", async (booking) => {
      const newBooking = await Booking.create(booking);
      io.emit("newBooking", newBooking);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from booking socket");
    });
  });
};
