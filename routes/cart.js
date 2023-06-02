const express = require("express");
const cartRouter = express.Router();
const CartController = require("../controllers/CartController");

cartRouter.route("/cart")
    .post(CartController.getCartItems);

cartRouter.route("/cart/delete")
    .delete(CartController.deleteCartItem);

cartRouter.route("/cart/add")
    .post(CartController.addCartItem);

cartRouter.route("/cart/update")
    .put(CartController.updateCartItem);

module.exports = cartRouter;
