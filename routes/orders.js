const express = require("express");
const ordersRouter = express.Router();
const { getCartItems } = require("../helpers/getCartItems");
const OrdersController = require("../controllers/OrdersController");
const validationMiddleware = require("../middleware/validationMiddleware");
const orderSchema = require("../validations/orderValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');

ordersRouter.route("/order")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, getCartItems, filterActiveWishlistItems, OrdersController.getOrderPage);

ordersRouter.route("/order/handle")
    .post(validationMiddleware(orderSchema), recaptchaValidation, OrdersController.createOrder);

module.exports = ordersRouter;
