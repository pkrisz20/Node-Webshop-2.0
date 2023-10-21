const express = require("express");
const homeRouter = express.Router();
const HomePageController = require("../controllers/HomePageController");
const { getCartItems } = require("../helpers/getCartItems");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");

homeRouter.route("/")
    .get(getConfigFromDb, selectWebshopCategories, getCartItems, HomePageController.getData);

module.exports = homeRouter;
