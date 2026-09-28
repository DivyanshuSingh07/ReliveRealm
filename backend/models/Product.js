const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters long"],
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Product description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price cannot be negative"],
    },

    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Product stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Product stock must be a whole number",
      },
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: {
        values: [
          "electronics",
          "computers",
          "gaming",
          "cameras",
          "home",
          "furniture",
          "fashion",
          "books",
          "sports",
          "appliances",
          "automotive",
        ],
        message: "Invalid product category",
      },
    },

    condition: {
      type: String,
      required: [true, "Product condition is required"],
      enum: {
        values: [
          "A / Excellent",
          "B / Very good",
          "C / Good",
        ],
        message: "Invalid product condition",
      },
    },

    type: {
      type: String,
      required: [true, "Product type is required"],
      enum: {
        values: ["Pre-owned", "Refurbished"],
        message: "Product type must be Pre-owned or Refurbished",
      },
    },

    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);