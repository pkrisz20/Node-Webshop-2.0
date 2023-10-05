const express = require("express");
const productsRouter = express.Router();
const ProductController = require("../controllers/ProductController");
const { getCartItems } = require("../helpers/getCartItems");
const validationMiddleware = require("../middleware/validationMiddleware");
const commentsSchema = require("../validations/commentValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");

productsRouter.route("/products")
    .get(getConfigFromDb, getCartItems, ProductController.getAllProducts);

productsRouter.route("/products/category/:slug")
    .get(getConfigFromDb, getCartItems, ProductController.getCategoryProducts);

productsRouter.route("/products/:slug")
    .get(getConfigFromDb, getCartItems, ProductController.getProductDetails);

productsRouter.route("/product/comment/:itemId")
    .post(validationMiddleware(commentsSchema), recaptchaValidation, ProductController.handleProductComment);

module.exports = productsRouter;
