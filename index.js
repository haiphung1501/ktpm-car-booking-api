const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketIO = require("socket.io");
const cron = require("node-cron");
mongoose.set("strictQuery", true);

dotenv.config();
//Route
const userRouter = require("./routes/userRoute");
const carRouter = require("./routes/carRoute");
const bookingRouter = require("./routes/bookingRoute");

//Helper
const bookingHelper = require("./helpers/bookingHelpers");

//Socket
const setupBookingSocket = require("./sockets/bookingSocket");
const setupNotificationSocket = require("./sockets/notificationSocket");

//App config
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// io.on("connection", (socket) => {
//   console.log("New client connected");
//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

//Middleware and packages
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: ["*", "http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/car", carRouter);
app.use("/api/booking", bookingRouter);
app.use("/health", (req, res) => {
  res.send("OK");
});

//
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (error) => {
  console.error("Error connecting to MongoDB:", error);
});

//Setup Socket
setupNotificationSocket(io.of("/notification"));
setupBookingSocket(io.of("/booking"));

// cron.schedule("0 * * * *", async () => {
//   try {
//     await bookingHelper.updatePendingBookingToCancelled();
//     console.log("Cron job run successfully");
//   } catch (error) {
//     console.log("Cron job failed");
//   }
// });

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
