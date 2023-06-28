const express = require("express");
const homeRouter = express.Router();
const HomePageController = require("../controllers/HomePageController");
const { getCartItems } = require("../helpers/getCartItems");

homeRouter.route("/")
    .get(getCartItems, HomePageController.getData);

module.exports = homeRouter;
