const express = require("express");
const productsRouter = express.Router();
const ProductController = require("../controllers/ProductController");
const { getCartItems } = require("../helpers/getCartItems");
const validationMiddleware = require("../middleware/validationMiddleware");
const commentsSchema = require("../validations/commentValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');

productsRouter.route("/products")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, ProductController.getAllProducts);

productsRouter.route("/products/category/:slug")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, ProductController.getCategoryProducts);

productsRouter.route("/products/:slug")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, ProductController.getProductDetails);

productsRouter.route("/wishlist")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, ProductController.getWishlistListPage);

productsRouter.route("/product/comment/load-more")
    .post(ProductController.ajaxLoadMoreComments);

productsRouter.route("/product/comment/:itemId")
    .post(validationMiddleware(commentsSchema), recaptchaValidation, ProductController.handleProductComment);

productsRouter.route("/wishlist-handle/:productId")
    .post(ProductController.wishlistHandler);

module.exports = productsRouter;
