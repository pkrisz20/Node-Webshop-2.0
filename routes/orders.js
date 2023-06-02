const express = require("express");
const ordersRouter = express.Router();
const OrdersController = require("../controllers/OrdersController");
const validationMiddleware = require("../middleware/validationMiddleware");
const orderSchema = require("../validations/orderValidation");
// const recaptchaValidation = require("../validations/recaptchaValidation");

ordersRouter.route("/order/register")
    .post(validationMiddleware(orderSchema), OrdersController.createOrder);

module.exports = ordersRouter;
