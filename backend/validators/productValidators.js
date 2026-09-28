// const { body } = require("express-validator");
const { body, param } = require("express-validator");

const createProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Product name must be between 2 and 120 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 2000 })
    .withMessage("Product description cannot exceed 2000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isFloat({ min: 0 })
    .withMessage("Product price must be a non-negative number")
    .toFloat(),

  body("stock")
    .notEmpty()
    .withMessage("Product stock is required")
    .isInt({ min: 0 })
    .withMessage("Product stock must be a non-negative whole number")
    .toInt(),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Product category is required")
    .isIn([
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
    ])
    .withMessage("Invalid product category"),

  body("condition")
    .trim()
    .notEmpty()
    .withMessage("Product condition is required")
    .isIn([
      "A / Excellent",
      "B / Very good",
      "C / Good",
    ])
    .withMessage("Invalid product condition"),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("Product type is required")
    .isIn(["Pre-owned", "Refurbished"])
    .withMessage("Product type must be Pre-owned or Refurbished"),

  body("image")
    .trim()
    .notEmpty()
    .withMessage("Product image is required"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Product tags must be an array"),

  body("tags.*")
    .optional()
    .trim()
    .isString()
    .withMessage("Each product tag must be a string"),
];

const updateProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Product name must be between 2 and 120 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 2000 })
    .withMessage("Product description cannot exceed 2000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isFloat({ min: 0 })
    .withMessage("Product price must be a non-negative number")
    .toFloat(),

  body("stock")
    .notEmpty()
    .withMessage("Product stock is required")
    .isInt({ min: 0 })
    .withMessage("Product stock must be a non-negative whole number")
    .toInt(),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Product category is required")
    .isIn([
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
    ])
    .withMessage("Invalid product category"),

  body("condition")
    .trim()
    .notEmpty()
    .withMessage("Product condition is required")
    .isIn([
      "A / Excellent",
      "B / Very good",
      "C / Good",
    ])
    .withMessage("Invalid product condition"),

  body("type")
    .trim()
    .notEmpty()
    .withMessage("Product type is required")
    .isIn(["Pre-owned", "Refurbished"])
    .withMessage("Product type must be Pre-owned or Refurbished"),

  body("image")
    .trim()
    .notEmpty()
    .withMessage("Product image is required"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Product tags must be an array"),

  body("tags.*")
    .optional()
    .trim()
    .isString()
    .withMessage("Each product tag must be a string"),
];

const productIdValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
};

// module.exports = {
//   createProductValidator,
//   productIdValidator,
// };

// module.exports = {
//   createProductValidator,
// };