const express = require("express");
const productsRouter = express.Router();
const ProductController = require("../controllers/ProductController");
const { getCartItems } = require("../helpers/getCartItems");
// const validationMiddleware = require("../middleware/validationMiddleware");
// const commentsSchema = require("../validations/commentValidation");
// const recaptchaValidation = require("../validations/recaptchaValidation");

productsRouter.route("/products")
    .get(getCartItems, ProductController.getAllProducts);

// productsRouter.route("/products/categories")
//     .post(ProductController.getCategories);

productsRouter.route("/products/:slug")
    .get(getCartItems, ProductController.getProductDetails);

// productsRouter.route("/product/comments")
//     .post(ProductController.getProductComments);

// productsRouter.route("/product/comment/add")
//     .post(validationMiddleware(commentsSchema), recaptchaValidation, ProductController.handleProductComment);

module.exports = productsRouter;
