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
