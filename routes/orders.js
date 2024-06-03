const express = require("express");
const ordersRouter = express.Router();
const { getCartItems } = require("../helpers/getCartItems");
const OrdersController = require("../controllers/OrdersController");
// const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');
const checkSlug = require("../middleware/checkSlug");

ordersRouter.route("/:lang/:slug")
    .get(checkSlug('slugs.cart'), getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, OrdersController.getOrderPage);

module.exports = ordersRouter;
