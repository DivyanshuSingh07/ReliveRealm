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

router.post(
  "/register",
  registerValidator,
  validate,
  register
);

router.post(
  "/login",
  loginValidator,
  validate,
  login
);

router.post(
  "/refresh-token",
  refreshToken
);

// -------------------------
// Authenticated routes
// -------------------------

router.post(
  "/logout",
  authenticate,
  logout
);

router.get(
  "/me",
  authenticate,
  getMe
);

module.exports = router;

/*
const express = require("express");

const { register, login } = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidators");

const validate = require("../middleware/validate");

const router = express.Router();

// Register
router.post("/register", registerValidator, validate, register);

// Login
router.post("/login", loginValidator, validate, login);

module.exports = router;
*/


/*const express = require("express");

const {
  register,
  login,
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

router.post(
  "/register",
  registerValidator,
  validate,
  register
);

router.post(
  "/login",
  loginValidator,
  validate,
  login
);

// -------------------------
// Temporary protected route
// -------------------------

router.get("/test-protected", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication middleware is working",
    user: req.user,
  });
});

module.exports = router;

*/

/*
const express = require("express");

const { register, login } = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidators");

const validate = require("../middleware/validate");

const router = express.Router();

// Register
router.post("/register", registerValidator, validate, register);

// Login
router.post("/login", loginValidator, validate, login);

module.exports = router;
*/


/*
const express = require("express");

const { register } = require("../controllers/authController");
const { registerValidator } = require("../validators/authValidators");
const validate = require("../middleware/validate");

const router = express.Router();

router.post("/register", registerValidator, validate, register);

module.exports = router;
*/
