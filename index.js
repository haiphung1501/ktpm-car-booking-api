const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketIO = require("socket.io");
mongoose.set("strictQuery", true);

dotenv.config();
//Route
const userRouter = require("./routes/userRoute");
const carRouter = require("./routes/carRoute");
const bookingRouter = require("./routes/bookingRoute");

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
app.use(cors());
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/car", carRouter);
app.use("/api/booking", bookingRouter);
app.use("/health", (req, res) => {
  res.send("OK");
});

//
mongoose.connect(process.env.DB_URL, () => {
  console.log("Connected to MongoDB");
});

//Setup Socket
setupNotificationSocket(io);
setupBookingSocket(io);

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
