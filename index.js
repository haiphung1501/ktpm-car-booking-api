const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
mongoose.set("strictQuery", true);

dotenv.config();
const app = express();

//Route
const userRouter = require("./routes/userRoute");

//Middleware and packages
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(express.json());

app.use("/api/user", userRouter);

//
mongoose.connect(process.env.DB_URL, () => {
  console.log("Connected to MongoDB");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
