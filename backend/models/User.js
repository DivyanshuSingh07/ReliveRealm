const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// -------------------------
// Password hashing
// -------------------------

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const saltRounds = 10;

  this.password = await bcrypt.hash(this.password, saltRounds);
});

module.exports = mongoose.model("User", userSchema);
