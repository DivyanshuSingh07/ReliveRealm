const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
} = require("../validators/productValidators");

const validate = require("../middleware/validate");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Create Product - Protected
router.post("/", authenticate, createProductValidator, validate, createProduct);

// Get All Products - Public
router.get("/", getProducts);

// Get Single Product - Public
router.get("/:id", productIdValidator, validate, getProductById);

// Update Product - Protected
router.put(
  "/:id",
  authenticate,
  productIdValidator,
  updateProductValidator,
  validate,
  updateProduct,
);

// Delete Product - Protected
router.delete(
  "/:id",
  authenticate,
  productIdValidator,
  validate,
  deleteProduct,
);

module.exports = router;
