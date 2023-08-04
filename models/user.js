const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  avatar: {
    public_id: {
      type: String,
      default: "sample ID",
    },
    url: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
  },
  phoneNumber: {
    type: String,
  },
  address: {
    type: String,
    default: "HCM",
  },
  role: {
    type: String,
    enum: ["user", "admin", "banned", "driver", "vip"],
    default: "user",
  },
  verified: {
    type: Boolean,
    default: false,
  },
  currentLocation: {
    lat: {
      type: Number,
      default: 0,
    },
    lng: {
      type: Number,
      default: 0,
    },
  },
  otp: String,
  otpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  //FOR DRIVER ONLY (HAS PREFIX DRIVER)
  cars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
    },
  ],
  driverAvailable: {
    type: Boolean,
  },
  driverRating: {
    type: Number,
    default: 0,
  },

  //SOFT DELETE
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

let User = mongoose.model("User", userSchema);
module.exports = User;
