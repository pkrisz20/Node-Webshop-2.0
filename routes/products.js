const express = require("express");
const productsRouter = express.Router();
const ProductController = require("../controllers/ProductController");
const { getCartItems } = require("../helpers/getCartItems");
const validationMiddleware = require("../middleware/validationMiddleware");
const commentsSchema = require("../validations/commentValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");

productsRouter.route("/products")
    .get(getConfigFromDb, selectWebshopCategories, getCartItems, ProductController.getAllProducts);

productsRouter.route("/products/category/:slug")
    .get(getConfigFromDb, selectWebshopCategories, getCartItems, ProductController.getCategoryProducts);

productsRouter.route("/products/:slug")
    .get(getConfigFromDb, selectWebshopCategories, getCartItems, ProductController.getProductDetails);

productsRouter.route("/product/comment/load-more")
    .post(ProductController.ajaxLoadMoreComments);

productsRouter.route("/product/comment/:itemId")
    .post(validationMiddleware(commentsSchema), recaptchaValidation, ProductController.handleProductComment);

module.exports = productsRouter;
