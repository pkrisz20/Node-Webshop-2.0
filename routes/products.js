const express = require("express");
const productsRouter = express.Router();
const ProductController = require("../controllers/ProductController");
const { getCartItems } = require("../helpers/getCartItems");
// const recaptchaValidation = require("../validations/recaptchaValidation");
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

module.exports = productsRouter;
