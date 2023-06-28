const express = require("express");
const cartRouter = express.Router();
const CartController = require("../controllers/CartController");

cartRouter.route("/cart/delete")
    .post(CartController.deleteCartItem);

cartRouter.route("/cart/add")
    .post(CartController.addCartItem);

cartRouter.route("/cart/update")
    .post(CartController.updateCartItem);

module.exports = cartRouter;
