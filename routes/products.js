const express = require("express");
const productsRouter = express.Router();
const ProductController = require("../controllers/ProductController");
const validationMiddleware = require("../middleware/validationMiddleware");
const commentsSchema = require("../validations/commentValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");

productsRouter.route("/products")
    .post(ProductController.getAllProducts);

productsRouter.route("/products/categories")
    .post(ProductController.getCategories);

productsRouter.route("/products/:productId")
    .post(ProductController.getProductDetails);

productsRouter.route("/product/comments")
    .post(ProductController.getProductComments);

productsRouter.route("/product/comment/add")
    .put(validationMiddleware(commentsSchema), recaptchaValidation, ProductController.handleProductComment);

module.exports = productsRouter;
