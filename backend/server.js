require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------------------------------------------
// Database connection
// --------------------------------------------------

connectDB().catch((error) => {
  console.error(
    "Initial database connection failed:",
    error.message
  );
});

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// --------------------------------------------------
// Base API route
// --------------------------------------------------

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "ReliveRealm API is running",
  });
});

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();

    res.status(200).json({
      success: true,
      api: "running",
      database: "connected",
    });
  } catch (error) {
    console.error(
      "Health check database error:",
      error.message
    );

    res.status(503).json({
      success: false,
      api: "running",
      database: "disconnected",
      message: "Database connection failed",
    });
  }
});

// --------------------------------------------------
// 404 handler
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// --------------------------------------------------
// Global error handler
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// --------------------------------------------------
// Local development
// --------------------------------------------------

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `ReliveRealm API running on http://localhost:${PORT}`
    );
  });
}

module.exports = app;



/*
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------------------------------------------
// Database connection
// --------------------------------------------------

connectDB().catch((error) => {
  console.error("Initial database connection failed:", error.message);
});

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// --------------------------------------------------
// Base API route
// --------------------------------------------------

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "ReliveRealm API is running",
  });
});

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();

    res.json({
      success: true,
      api: "running",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check database error:", error.message);

    res.status(503).json({
      success: false,
      api: "running",
      database: "disconnected",
      message: "Database connection failed",
    });
  }
});

// --------------------------------------------------
// 404 handler
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// --------------------------------------------------
// Global error handler
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// --------------------------------------------------
// Local development
// --------------------------------------------------

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ReliveRealm API running on http://localhost:${PORT}`);
  });
}

// --------------------------------------------------
// Export for Vercel
// --------------------------------------------------

module.exports = app;
*/

/*
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// -------------------------
// Global middleware
// -------------------------

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------------
// Database
// -------------------------

// Start connection without crashing the application.
// Routes that require MongoDB can call connectDB() themselves.
connectDB().catch((error) => {
  console.error("Initial database connection failed:", error.message);
});

// -------------------------
// Routes
// -------------------------

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// -------------------------
// Base route
// -------------------------

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "ReliveRealm API is running",
  });
});

// -------------------------
// Health route
// -------------------------

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();

    res.json({
      success: true,
      api: "running",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      api: "running",
      database: "disconnected",
      message: "Database connection failed",
    });
  }
});

// -------------------------
// 404 handler
// -------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// -------------------------
// Global error handler
// -------------------------

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// -------------------------
// Local development
// -------------------------

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ReliveRealm API running on http://localhost:${PORT}`);
  });
}

// -------------------------
// Vercel
// -------------------------

module.exports = app;
*/

/*
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// -------------------------
// Database
// -------------------------

connectDB();

// -------------------------
// Global middleware
// -------------------------

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// -------------------------
// Health / base route
// -------------------------

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "ReliveRealm API is running",
  });
});

app.get("/api/health", (req, res) => {
  const dbState = require("mongoose").connection.readyState;

  const databaseStatus = dbState === 1 ? "connected" : "disconnected";

  res.json({
    success: true,
    api: "running",
    database: databaseStatus,
  });
});

// -------------------------
// 404 handler
// -------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// -------------------------
// Global error handler
// -------------------------

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// -------------------------
// Start server
// -------------------------

app.listen(PORT, () => {
  console.log(`ReliveRealm API running on http://localhost:${PORT}`);
});
*/