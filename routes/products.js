const express = require("express");
const productsRouter = express.Router();
const ProductController = require("../controllers/ProductController");
const { getCartItems } = require("../helpers/getCartItems");
// const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');
const checkSlug = require("../middleware/checkSlug");

productsRouter.route("/:lang/:slug")
    .get(checkSlug('slugs.products'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, ProductController.getAllProducts);

productsRouter.route("/:lang/:slug")
    .get(checkSlug('slugs.wishlist'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, ProductController.getWishlistListPage);

productsRouter.route("/:lang/:categorySlug/:slug/:categoryId")
    .get(checkSlug('slugs.products'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, ProductController.getCategoryProducts);

productsRouter.route("/:lang/:slug/:slugName/:productId")
    .get(checkSlug('slugs.product'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, ProductController.getProductDetails);

module.exports = productsRouter;
