const express = require("express");
const ordersRouter = express.Router();
const { getCartItems } = require("../helpers/getCartItems");
const OrdersController = require("../controllers/OrdersController");
const validationMiddleware = require("../middleware/validationMiddleware");
const orderSchema = require("../validations/orderValidation");
const recaptchaValidation = require("../validations/recaptchaValidation");

ordersRouter.route("/order")
    .get(getCartItems, OrdersController.getOrderPage);

ordersRouter.route("/order/handle")
    .post(validationMiddleware(orderSchema), recaptchaValidation, OrdersController.createOrder);

module.exports = ordersRouter;
