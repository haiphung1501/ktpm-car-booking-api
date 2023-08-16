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
        // Check if any booking with status accept, progress that have driverId = driverId

        const alreadyHaveBooking = await Booking.findOne({
          driverId: driverId,
          bookingStatus: { $in: ["accepted", "inProgress"] },
        }).populate(
          "driverId.car carId userId driverId driverId.car messages.sender messages.receiver"
        );

        if (alreadyHaveBooking) {
          console.log("Driver already have booking");
          socket.join(alreadyHaveBooking._id);
        } else {
          const newBookings = await getPendingBookings();

          if (newBookings.length > 0) {
            console.log("Emitted new booking to driver");
            emitNewBookings(io, "driverAvailableRoom", newBookings);
          }
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

        // Emit to user when create booking

        io.to(change.documentKey._id).emit(
          "bookingUpdate",
          change.fullDocument
        );
      }
    });

    // User connect to room bookingId when create booking to listen for any update
    socket.on("createBooking", (bookingId) => {
      socket.join(bookingId);
      console.log("User joined room", bookingId);
      handleBookingUpdate(io, socket, bookingId);
    });

    // Driver disconnects from new booking notifications when they accept a booking
    socket.on("acceptBooking", (bookingId) => {
      socket.leave("driverAvailableRoom");
      socket.join(bookingId);
      console.log("Driver joined room", bookingId);

      //Watch for completed booking
      Booking.watch().on("change", async (change) => {
        if (
          change.operationType === "update" &&
          (change.updateDescription.updatedFields.bookingStatus ===
            "completed" ||
            change.updateDescription.updatedFields.bookingStatus ===
              "cancelled")
        ) {
          console.log("Booking completed");
          setTimeout(() => {
            socket.leave(bookingId);
            socket.join("driverAvailableRoom");
          }, 2000);
          console.log("Driver left room", bookingId);
        }
      });
    });

    // Driver disconnects from booking updates when they complete a booking

    socket.on("disconnect", () => {
      console.log("Client disconnected from socket");
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

const handleBookingUpdate = (io, socket, bookingId) => {
  const changeListener = async (change) => {
    if (change.operationType === "update") {
      const updatedBooking = await Booking.findById(bookingId).populate(
        "driverId.car carId userId driverId driverId.car messages.sender messages.receiver"
      );

      if (
        change.updateDescription.updatedFields.bookingStatus === "completed" ||
        change.updateDescription.updatedFields.bookingStatus === "cancelled"
      ) {
        io.to(bookingId).emit("bookingUpdate", updatedBooking);

        Booking.watch({ _id: bookingId }).removeListener(
          "change",
          changeListener
        );

        socket.leave(bookingId);
      } else {
        console.log(updatedBooking);
        io.to(bookingId).emit("bookingUpdate", updatedBooking);
      }

      socket.on("disconnect", () => {
        Booking.watch({ _id: bookingId }).removeListener(
          "change",
          changeListener
        );
      });
    }
  };
  Booking.watch({ _id: bookingId }).on("change", changeListener);
};
module.exports = setupNotificationSocket;
