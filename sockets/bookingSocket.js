// bookingSocket.js

const Booking = require("../models/booking");
const User = require("../models/user");

const setupBookingSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected to booking socket");

    socket.on("userMakeBooking", async (bookingId) => {
      // Notify all drivers about the new booking
      const newBooking = await Booking.findById(bookingId);
      io.emit("newBooking", newBooking);
    });

    // When a driver accepts a booking, they will join the room for that booking ID
    socket.on("acceptBooking", (bookingId) => {
      socket.join(bookingId);
    });

    // Listen for updates on bookings and notify the relevant users in the room
    socket.on("bookingUpdated", async (bookingId) => {
      const updatedBooking = await Booking.findById(bookingId);
      if (updatedBooking) {
        io.to(bookingId).emit("bookingUpdate", updatedBooking);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

module.exports = setupBookingSocket;
