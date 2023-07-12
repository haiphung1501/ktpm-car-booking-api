const Booking = require("../models/booking");

const setupBookingSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    Booking.watch().on("change", async (change) => {
      const updatedBooking = change.fullDocument;
      const bookingId = updatedBooking._id;

      io.to(bookingId).emit("bookingUpdated", updatedBooking);
    });

    socket.on("sendMessage", (data) => {
      const { bookingId, message } = data;

      Booking.findByIdAndUpdate();
    });
  });
};

module.exports = setupBookingSocket;
