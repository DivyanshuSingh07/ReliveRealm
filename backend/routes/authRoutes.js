const express = require("express");

const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
} = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidators");

const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// -------------------------
// Public routes
// -------------------------

router.post("/register", registerValidator, validate, register);

router.post("/login", loginValidator, validate, login);

router.post("/refresh-token", refreshToken);

// -------------------------
// Authenticated routes
// -------------------------

router.post("/logout", authenticate, logout);

router.get("/me", authenticate, getMe);

module.exports = router;
