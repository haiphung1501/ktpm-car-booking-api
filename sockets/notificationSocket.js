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
        const newBookings = await getPendingBookings();

        if (newBookings.length > 0) {
          console.log("Emitted new booking to driver");
          emitNewBookings(io, "driverAvailableRoom", newBookings);
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
        const newBookings = await getPendingBookings();
        emitNewBookings(io, "driverAvailableRoom", newBookings);
        //Implement when 1 booking status change from pending to another status
        //Emit to driver
      } else if (
        change.operationType === "update" &&
        change.updateDescription.updatedFields.bookingStatus !== "pending"
      ) {
        const newBookings = await getPendingBookings();
        emitNewBookings(io, "driverAvailableRoom", newBookings);
      }
    });

    // Driver disconnects from new booking notifications when they accept a booking
    socket.on("acceptBooking", (bookingId) => {
      socket.leave("driverAvailableRoom");
      socket.join(bookingId);
      console.log("Driver joined room", bookingId);

      //Watch for any update of that bookingId
      Booking.watch({ _id: bookingId }).on("change", async (change) => {
        if (change.operationType === "update") {
          //emit to driver
          const updatedBooking = await Booking.findById(bookingId)
            .populate("userId driverId messages.sender messages.receiver")
            .lean();

          io.to(bookingId).emit("bookingUpdate", updatedBooking);
        }
      });
    });

    // User connect to room bookingId when create booking to listen for any update
    socket.on("createBooking", (bookingId) => {
      socket.join(bookingId);
      console.log("User joined room", bookingId);

      // Watch for leaving
      Booking.watch({ _id: bookingId }).on("change", async (change) => {
        if (
          change.operationType === "update" &&
          change.fullDocument.bookingStatus === "completed"
        ) {
          socket.leave(bookingId);
          console.log("User finish booking", bookingId);
        }
      });
    });

    // Driver disconnects from booking updates when they complete a booking
    socket.on("completeBooking", (bookingId) => {
      socket.leave(bookingId);
      console.log("Driver left room", bookingId);
      socket.join("driverAvailableRoom");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

const getPendingBookings = async () => {
  return Booking.find({
    bookingStatus: "pending",
  })
    .populate("userId driverId")
    .lean();
};

const emitNewBookings = (io, room, newBookings) => {
  io.to(room).emit("newBooking", newBookings);
};

module.exports = setupNotificationSocket;
