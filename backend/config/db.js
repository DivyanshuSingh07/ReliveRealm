const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Connection already in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then((connection) => {
      console.log(
        `MongoDB connected: ${connection.connection.host}`
      );

      return connection.connection;
    })
    .catch((error) => {
      console.error(
        "MongoDB connection failed:",
        error.message
      );

      connectionPromise = null;

      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;


/*
const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Connection is already in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then((connection) => {
      console.log(
        `MongoDB connected: ${connection.connection.host}`
      );

      return connection.connection;
    })
    .catch((error) => {
      console.error(
        "MongoDB connection failed:",
        error.message
      );

      connectionPromise = null;

      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;
*/

/*
const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Connection is already in progress
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then((connection) => {
      console.log(
        `MongoDB connected: ${connection.connection.host}`
      );

      return connection.connection;
    })
    .catch((error) => {
      console.error(
        "MongoDB connection failed:",
        error.message
      );

      connectionPromise = null;

      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;
*/

/*
const mongoose = require("mongoose");

let isConnecting = false;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Already connecting
  if (isConnecting) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    isConnecting = true;

    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${connection.connection.host}`);

    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  } finally {
    isConnecting = false;
  }
};

module.exports = connectDB;
*/


// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     const connection = await mongoose.connect(process.env.MONGO_URI);

//     console.log(`MongoDB connected: ${connection.connection.host}`);
//   } catch (error) {
//     console.error("MongoDB connection failed:", error);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
