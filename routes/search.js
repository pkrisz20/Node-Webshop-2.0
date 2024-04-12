const express = require("express");
const searchRouter = express.Router();
const SearchController = require("../controllers/SearchController");
const getConfigFromDb = require("../helpers/getConfigFromDb");
const selectWebshopCategories = require("../helpers/selectWebshopCategories");
const selectStaticContents = require("../middleware/selectStaticContents");
const filterActiveWishlistItems = require('../middleware/filterActiveWishlistItems');

searchRouter.route("/search")
    .get(getConfigFromDb, selectWebshopCategories, selectStaticContents, filterActiveWishlistItems, SearchController.handleSearch);

searchRouter.route("/ajax-search")
    .post(SearchController.ajaxSearch);

module.exports = searchRouter;
