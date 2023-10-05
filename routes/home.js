const express = require("express");
const homeRouter = express.Router();
const HomePageController = require("../controllers/HomePageController");
const { getCartItems } = require("../helpers/getCartItems");
const getConfigFromDb = require("../helpers/getConfigFromDb");

homeRouter.route("/")
    .get(getConfigFromDb, getCartItems, HomePageController.getData);

module.exports = homeRouter;
