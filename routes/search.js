const express = require("express");
const searchRouter = express.Router();
const SearchController = require("../controllers/SearchController");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");

searchRouter.route("/search")
    .get(getConfigFromDb, selectWebshopCategories, SearchController.handleSearch);

module.exports = searchRouter;
